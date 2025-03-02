import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type {
  Option,
  Category,
  Subcategory,
  GuitarConfiguration,
  ConfigurationState,
  ConfigurationError,
  ImageLayer,
  GuitarView
} from '@/types/guitar'
import type { Database } from '@/integrations/supabase/types'
import {
  validateOptionSelection,
  calculateTotalPrice,
  processImageLayers,
  validateConfiguration
} from '@/utils/configurationUtils'
import { shouldHideOption, getOptionsToDeselect, FILTER_RULES } from '@/utils/filterRules'
import { getPairedHardwareSelections } from '@/utils/menuUtils'

interface GuitarConfigContextType {
  configuration: GuitarConfiguration
  loading: boolean
  error: unknown
  categories: Category[]
  subcategories: Subcategory[]
  availableOptions: Option[]
  imageLayers: ImageLayer[]
  currentView: GuitarView
  setCurrentView: (view: GuitarView) => void
  setOption: (subcategoryId: number, option: Option) => void
  removeOption: (subcategoryId: number) => void
  resetConfiguration: () => void
  getSubcategoryOptions: (subcategoryId: number) => Option[]
  isOptionCompatible: (option: Option) => boolean
  getConfigurationErrors: () => ConfigurationError[]
  isOptionHidden: (option: Option) => boolean
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  saveBuild: (userId: string, userEmail: string, title: string) => Promise<{ success: boolean; error?: string }>
  getUserBuilds: (userId: string) => Promise<any[]>
  loadBuild: (buildData: any) => Promise<{ success: boolean; error?: string }>
  isConfigurationSaved: boolean
}

const GuitarConfigContext = React.createContext<GuitarConfigContextType | null>(null)

export function useGuitarConfig() {
  const context = React.useContext(GuitarConfigContext)
  if (!context) {
    throw new Error('useGuitarConfig must be used within a GuitarConfigProvider')
  }
  return context
}

interface GuitarConfigProviderProps {
  children: React.ReactNode
}

export function GuitarConfigProvider({ children }: GuitarConfigProviderProps) {
  // State
  const [configuration, setConfiguration] = React.useState<GuitarConfiguration>({
    selectedOptions: new Map(),
    totalPrice: 0,
    isValid: true,
    errors: []
  })
  const [imageLayers, setImageLayers] = React.useState<ImageLayer[]>([])
  const [currentView, setCurrentView] = React.useState<GuitarView>('front')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')
  const [isConfigurationSaved, setIsConfigurationSaved] = React.useState(false)

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['guitar-config-data'],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult, optionsResult] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('subcategories')
            .select('*')
            .not('id', 'in', '(5)')
            .or('id.eq.39,id.eq.40,id.eq.41,id.eq.44,id.eq.46,id.eq.47,hidden.is.null,hidden.eq.false')
            .order('sort_order'),
          supabase.from('options')
            .select('*')
            .or(
              'id_related_subcategory.eq.39,id_related_subcategory.eq.40,id_related_subcategory.eq.41,id_related_subcategory.eq.44,id_related_subcategory.eq.46,id_related_subcategory.eq.47,active.eq.true,id.eq.1030,id.eq.1031')
            .order('zindex')
        ])

        if (categoriesResult.error) throw categoriesResult.error
        if (subcategoriesResult.error) throw subcategoriesResult.error
        if (optionsResult.error) throw optionsResult.error

        const processedOptions = optionsResult.data.map(option => {
          // Determine the appropriate image URL based on front or back
          let imageUrl = null;
          if (option.front_image_url) {
            imageUrl = `/images/${option.front_image_url.split('/').pop()}`;
          }
          
          return {
            ...option,
            image_url: imageUrl
          };
        });

        return {
          categories: categoriesResult.data,
          subcategories: subcategoriesResult.data,
          options: processedOptions
        }
      } catch (error) {
        console.error('Error fetching guitar configuration data:', error)
        throw error
      }
    }
  })

  // Set default options when data is loaded
  React.useEffect(() => {
    if (!data?.options || configuration.selectedOptions.size > 0) return

    const defaultSelections = new Map<number, Option>()
    
    data.options.forEach(option => {
      if (option.is_default && option.id_related_subcategory) {
        defaultSelections.set(option.id_related_subcategory, option)
      }
    })

    // Add default 6 strings option
    const sixStringsOption = data.options.find(opt => opt.id === 369)
    if (sixStringsOption?.id_related_subcategory) {
      defaultSelections.set(sixStringsOption.id_related_subcategory, sixStringsOption)
    }

    // Add default black Spokewheel
    const spokewheelOption = data.options.find(opt => opt.id === 1030)
    if (spokewheelOption?.id_related_subcategory) {
      defaultSelections.set(spokewheelOption.id_related_subcategory, spokewheelOption)
    }

    updateConfiguration(defaultSelections)
  }, [data?.options])

  // Update configuration and recalculate derived state
  const updateConfiguration = React.useCallback((newSelections: Map<number, Option>) => {
    const totalPrice = calculateTotalPrice(newSelections)
    const errors = validateConfiguration({ 
      selectedOptions: newSelections, 
      totalPrice, 
      isValid: true, 
      errors: [] 
    })
    const newLayers = processImageLayers(newSelections, currentView)

    setConfiguration({
      selectedOptions: newSelections,
      totalPrice,
      isValid: errors.length === 0,
      errors
    })
    setImageLayers(newLayers)
  }, [currentView])

  // Update image layers whenever the view changes
  React.useEffect(() => {
    if (configuration.selectedOptions.size > 0) {
      const newLayers = processImageLayers(configuration.selectedOptions, currentView)
      setImageLayers(newLayers)
    }
  }, [currentView, configuration.selectedOptions])

  // Context methods
  const setOption = React.useCallback((subcategoryId: number, option: Option) => {
    // Skip validation to allow free experimentation
    let newSelections: Map<number, Option>;
    
    // Check if this is a hardware color change
    if (option.id === 727 || option.id === 728) { // Black or Chrome hardware
      // Get the new hardware color
      const newHardwareColor = option.id === 727 ? 'Preto' : 'Cromado'
      
      // Get paired selections for all hardware components
      newSelections = getPairedHardwareSelections(
        configuration.selectedOptions,
        newHardwareColor,
        data?.options || []
      )
    } else {
      newSelections = new Map(configuration.selectedOptions)
    }
    
    // Set the new option
    newSelections.set(subcategoryId, option)

    // Mark configuration as not saved when an option is changed
    setIsConfigurationSaved(false)

    // Handle generic auto-selection based on filter rules
    const rule = FILTER_RULES[option.id]
    if (rule) {
      let autoSelectOptionId: number | undefined;
      
      if (rule.getAutoSelectOption) {
        // Use dynamic function if available
        autoSelectOptionId = rule.getAutoSelectOption(newSelections);
      } else if (rule.autoSelectOption) {
        // Use static auto-selection if available
        autoSelectOptionId = rule.autoSelectOption;
      }

      if (autoSelectOptionId) {
        const autoSelectedOption = data?.options.find(opt => opt.id === autoSelectOptionId)
        if (autoSelectedOption?.id_related_subcategory) {
          newSelections.set(autoSelectedOption.id_related_subcategory, autoSelectedOption)
        }
      }
    }

    // Handle option 1045 (Top Wood - None) selection
    if (option.id === 1045) {
      const incompatibleOptions = [
        716, 1017, 718, 719, 720,
        734, 735, 736, 737, 738,
        1019, 1021, 1023, 1022, 1020,
        1024, 1025, 1026, 1027, 1028
      ]
      
      // Remove any incompatible options from the selection
      for (const [subId, selectedOpt] of Array.from(newSelections.entries())) {
        if (incompatibleOptions.includes(selectedOpt.id)) {
          newSelections.delete(subId)
        }
      }
    }

    // Auto-select option 1017 when option 55 is selected
    if (option.id === 55) {
      const option1017 = data?.options.find(opt => opt.id === 1017)
      if (option1017 && option1017.id_related_subcategory) {
        newSelections.set(option1017.id_related_subcategory, option1017)
      }
    }

    // Auto-select option 735 when option 244 is selected
    if (option.id === 244) {
      const option735 = data?.options.find(opt => opt.id === 735)
      if (option735 && option735.id_related_subcategory) {
        newSelections.set(option735.id_related_subcategory, option735)
      }
    }

    // Auto-select option 1019 when option 53 is selected
    if (option.id === 53) {
      const option1019 = data?.options.find(opt => opt.id === 1019)
      if (option1019 && option1019.id_related_subcategory) {
        newSelections.set(option1019.id_related_subcategory, option1019)
      }
    }

    // Auto-select option 1024 when option 59 is selected
    if (option.id === 59) {
      const option1024 = data?.options.find(opt => opt.id === 1024)
      if (option1024 && option1024.id_related_subcategory) {
        newSelections.set(option1024.id_related_subcategory, option1024)
      }
    }

    // Get options that should be deselected based on the new selection
    const optionsToDeselect = getOptionsToDeselect(option, newSelections)

    // Remove any selected options that should be deselected
    for (const [subId, selectedOption] of newSelections) {
      if (optionsToDeselect.includes(selectedOption.id)) {
        newSelections.delete(subId)
      }
    }

    updateConfiguration(newSelections)
  }, [configuration, updateConfiguration, data?.options])

  const removeOption = React.useCallback((subcategoryId: number) => {
    const newSelections = new Map(configuration.selectedOptions)
    newSelections.delete(subcategoryId)
    updateConfiguration(newSelections)
  }, [configuration, updateConfiguration])

  const resetConfiguration = React.useCallback(() => {
    setConfiguration({
      selectedOptions: new Map(),
      totalPrice: 0,
      isValid: true,
      errors: []
    })
    setImageLayers([])
  }, [])

  const getSubcategoryOptions = React.useCallback((subcategoryId: number): Option[] => {
    if (!data?.options) return []
    return data.options
      .filter(opt => opt.id_related_subcategory === subcategoryId)
      .filter(opt => !shouldHideOption(opt, configuration.selectedOptions))
      .sort((a, b) => {
        // Put "None" option first
        if (a.option === 'None') return -1
        if (b.option === 'None') return 1
        
        // Sort by price (lowest to highest)
        const priceA = a.price_usd || 0
        const priceB = b.price_usd || 0
        return priceA - priceB
      })
  }, [data?.options, configuration.selectedOptions])

  const isOptionCompatible = React.useCallback((option: Option): boolean => {
    return validateOptionSelection(option, configuration).isValid
  }, [configuration])

  const getConfigurationErrors = React.useCallback((): ConfigurationError[] => {
    return validateConfiguration(configuration)
  }, [configuration])

  const isOptionHidden = React.useCallback((option: Option): boolean => {
    return shouldHideOption(option, configuration.selectedOptions)
  }, [configuration.selectedOptions])

  const saveBuild = React.useCallback(async (userId: string, userEmail: string, title: string) => {
    try {
      if (!configuration.selectedOptions || configuration.selectedOptions.size === 0) {
        return { success: false, error: 'No configuration selected' }
      }

      // Initialize build data with user ID
      const buildData: Database['public']['Tables']['builds']['Insert'] = {
        id_user: userId,
        user_email: userEmail,
        title: title || 'Untitled Build', // Add title with fallback
        custo: 0, // Will be calculated
        preco: configuration.totalPrice,
        // Set "1" as value for specified columns (using type assertion to override type checking)
        jack: "1",
        jack_plate: "1" as any,
        tensor: "1" as any,
        ferrules: "1" as any,
        feltro: "1" as any,
        roldana: "1" as any,
        chave_allen_25mm: "1" as any,
        marca_pagina: "1" as any,
        porta_certificado: "1" as any,
        certificado: "1" as any,
        ziplock: "1" as any,
        treble_bleed: "1" as any,
        tag_specs: "1",
        tag_modelo: "1"
      }

      // Map selected options to build data fields
      for (const [subcategoryId, option] of configuration.selectedOptions.entries()) {
        const subcategory = data?.subcategories.find(sub => sub.id === subcategoryId)
        if (!subcategory) continue

        // Skip hidden options
        if (isOptionHidden(option)) continue

        // Map subcategory to corresponding build field
        switch (subcategory.subcategory.toLowerCase()) {
          case 'body color':
            buildData.body_color = option.id.toString()
            break
          case 'body wood':
            buildData.body_wood = option.id.toString()
            break
          case 'top wood':
            buildData.top_wood = option.id.toString()
            break
          case 'top color':
            buildData.top_color = option.id.toString()
            break
          case 'burst':
            buildData.burst = option.id.toString()
            break
          case 'top coat':
            buildData.top_coat = option.id.toString()
            break
          case 'neck wood':
            buildData.neck_wood = option.id.toString()
            break
          case 'fretboard wood':
            buildData.fretboard_wood = option.id.toString()
            break
          case 'inlays':
            buildData.inlays = option.id.toString()
            break
          case 'nut':
            buildData.nut = option.id.toString()
            break
          case 'frets':
            // Store the option ID instead of the text
            try {
              buildData.frets = option.id.toString();
              console.log("Saving frets ID:", option.id);
            } catch (e) {
              console.error("Error setting frets value:", option.id);
              buildData.frets = null;
            }
            break
          case 'neck construction':
            buildData.neck_construction = option.id.toString()
            break
          case 'side dots':
            buildData.side_dots = option.id.toString()
            break
          case 'neck reinforcements':
            buildData.neck_reinforcements = option.id.toString()
            break
          case 'neck profile':
            buildData.neck_profile = option.id.toString()
            break
          case 'fretboard radius':
            // Store the option ID instead of trying to extract numeric part
            try {
              buildData.fretboard_radius = option.id.toString();
              console.log("Saving fretboard radius ID:", option.id);
            } catch (e) {
              console.error("Error setting fretboard radius value:", option.id);
              buildData.fretboard_radius = null;
            }
            break
          case 'headstock angle':
            // Store the option ID instead of trying to extract numeric part
            try {
              buildData.headstock_angle = option.id.toString();
              console.log("Saving headstock angle ID:", option.id);
            } catch (e) {
              console.error("Error setting headstock angle value:", option.id);
              buildData.headstock_angle = null;
            }
            break
          case 'bridge':
            buildData.bridge = option.id.toString()
            console.log("Saving bridge ID:", option.id);
            break
          case 'tuners':
            buildData.tuners = option.id.toString()
            console.log("Saving tuners ID:", option.id);
            break
          case 'hardware color':
            buildData.hardware_color = option.id.toString()
            break
          case 'pickups':
            buildData.pickups = option.id.toString()
            break
          case 'knobs':
            buildData.knobs = option.id.toString()
            break
          case 'switch':
            buildData.switch = option.id.toString()
            break
          case 'pickups finish':
            buildData.pickups_finish = option.id.toString()
            break
          case 'pickups customization':
            buildData.pickups_customization = option.id.toString()
            break
          case 'plates':
            buildData.plates = option.id.toString()
            break
          case 'strings':
            buildData.strings = option.id.toString()
            break
          case 'scale length':
            // Store the option ID instead of trying to extract numeric part
            try {
              buildData.scale_length = option.id.toString();
              console.log("Saving scale length ID:", option.id);
            } catch (e) {
              console.error("Error setting scale length value:", option.id);
              buildData.scale_length = null;
            }
            break
          case 'case':
            buildData.case_type = option.id.toString()
            break
        }
      }

      // Debug logging for build data
      console.log('Debug - Build data before saving:', {
        ...buildData,
        frets: buildData.frets,
        bridge: buildData.bridge,
        tuners: buildData.tuners,
        headstock_angle: buildData.headstock_angle,
        fretboard_radius: buildData.fretboard_radius,
        scale_length: buildData.scale_length
      });

      // Insert data into Supabase
      const { data: insertData, error } = await supabase
        .from('builds')
        .insert(buildData)
        .select()

      if (error) {
        console.error('Error saving build:', error)
        return { success: false, error: error.message }
      }

      setIsConfigurationSaved(true)
      return { success: true }
    } catch (error: any) {
      console.error('Error in saveBuild:', error)
      return { success: false, error: error.message || 'An unknown error occurred' }
    }
  }, [configuration, data?.subcategories, isOptionHidden])

  // Get user's saved builds
  const getUserBuilds = React.useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('id_user', userId)
        .order('id', { ascending: false }) // Most recent first

      if (error) {
        console.error('Error fetching user builds:', error)
        return []
      }

      return data || []
    } catch (error: any) {
      console.error('Error in getUserBuilds:', error)
      return []
    }
  }, [])

  // Load a saved build
  const loadBuild = React.useCallback(async (buildData: any) => {
    try {
      if (!data) {
        return { success: false, error: 'Configuration data not loaded yet' }
      }

      // Create a new map for selected options
      const newSelectedOptions = new Map<number, Option>()

      // Debug logging
      console.log('Loading build data:', buildData);
      
      // Add detailed logging for problematic fields
      console.log('DEBUGGING PROBLEMATIC FIELDS:');
      console.log('- Frets value in database:', buildData.frets);
      console.log('- Headstock Angle value in database:', buildData.headstock_angle);
      console.log('- Pickup Customization value in database:', buildData.pickups_customization);
      console.log('- Tuners value in database:', buildData.tuners);
      console.log('- Bridge value in database:', buildData.bridge);

      // Helper function to check if a value is a numeric string
      const isNumeric = (value: any): boolean => {
        return value !== null && value !== undefined && !isNaN(parseInt(value as string)) && isFinite(Number(value));
      };

      // Log all subcategories and their IDs for reference
      console.log('SUBCATEGORIES:');
      data.subcategories.forEach(sub => {
        console.log(`- ${sub.subcategory} (ID: ${sub.id})`);
      });

      // Special debug function to check if a subcategory is being processed
      const debugSubcategory = (name: string, id: number) => {
        const subcategory = data?.subcategories.find(sub => sub.id === id);
        if (!subcategory) {
          console.log(`❌ Subcategory with ID ${id} not found!`);
          return;
        }
        
        console.log(`\n🔍 CHECKING SUBCATEGORY: ${name} (ID: ${id})`);
        console.log(`- Subcategory name in database: "${subcategory.subcategory}"`);
        console.log(`- Subcategory name lowercase: "${subcategory.subcategory.toLowerCase()}"`);
        
        // Check if this subcategory is being processed in the switch statement
        const isProcessed = subcategory.subcategory.toLowerCase() === name.toLowerCase();
        console.log(`- Is processed correctly: ${isProcessed ? '✅ Yes' : '❌ No'}`);
        
        // Check available options
        const options = data?.options.filter(opt => opt.id_related_subcategory === id);
        console.log(`- Available options: ${options.length}`);
        options.forEach((opt, i) => {
          console.log(`  ${i+1}. "${opt.option}" (ID: ${opt.id})`);
        });
        
        // Check if there's a value in the build data
        const buildValue = buildData[name.toLowerCase().replace(/\s+/g, '_')];
        console.log(`- Value in build data: "${buildValue}"`);
        console.log(`- Is value an option ID: ${isNumeric(buildValue)}`);
      };
      
      // Debug the problematic subcategories
      // Find the subcategory IDs for the problematic subcategories
      const fretsSubcategory = data.subcategories.find(sub => sub.subcategory.toLowerCase() === 'frets');
      const tunersSubcategory = data.subcategories.find(sub => sub.subcategory.toLowerCase() === 'tuners');
      const bridgeSubcategory = data.subcategories.find(sub => sub.subcategory.toLowerCase() === 'bridge');
      
      if (fretsSubcategory) debugSubcategory('frets', fretsSubcategory.id);
      if (tunersSubcategory) debugSubcategory('tuners', tunersSubcategory.id);
      if (bridgeSubcategory) debugSubcategory('bridge', bridgeSubcategory.id);

      // Process each field in the build data and map it back to options
      for (const subcategory of data.subcategories) {
        const subcategoryName = subcategory.subcategory.toLowerCase()
        let optionValue: string | null = null

        // Map build data fields to subcategory names
        switch (subcategoryName) {
          case 'body color':
            optionValue = buildData.body_color
            break
          case 'body wood':
            optionValue = buildData.body_wood
            break
          case 'top wood':
            optionValue = buildData.top_wood
            break
          case 'top color':
            optionValue = buildData.top_color
            break
          case 'burst':
            optionValue = buildData.burst
            break
          case 'top coat':
            optionValue = buildData.top_coat
            break
          case 'neck wood':
            optionValue = buildData.neck_wood
            break
          case 'fretboard wood':
            optionValue = buildData.fretboard_wood
            break
          case 'inlays':
            optionValue = buildData.inlays
            break
          case 'nut':
            optionValue = buildData.nut
            break
          case 'frets':
            optionValue = buildData.frets
            break
          case 'neck construction':
            optionValue = buildData.neck_construction
            break
          case 'side dots':
            optionValue = buildData.side_dots
            break
          case 'neck reinforcements':
            optionValue = buildData.neck_reinforcements
            break
          case 'neck profile':
            optionValue = buildData.neck_profile
            break
          case 'fretboard radius':
            optionValue = buildData.fretboard_radius
            break
          case 'headstock angle':
            optionValue = buildData.headstock_angle
            break
          case 'bridge':
            optionValue = buildData.bridge
            break
          case 'tuners':
            optionValue = buildData.tuners
            break
          case 'hardware color':
            optionValue = buildData.hardware_color
            break
          case 'pickups':
            optionValue = buildData.pickups
            break
          case 'knobs':
            optionValue = buildData.knobs
            break
          case 'switch':
            optionValue = buildData.switch
            break
          case 'pickups finish':
            optionValue = buildData.pickups_finish
            break
          case 'pickups customization':
            optionValue = buildData.pickups_customization
            break
          case 'plates':
            optionValue = buildData.plates
            break
          case 'strings':
            optionValue = buildData.strings
            break
          case 'scale length':
            optionValue = buildData.scale_length
            break
          case 'case':
            optionValue = buildData.case_type
            break
          case 'project':
            // Project is typically a default option, so we'll find it by subcategory
            break
        }

        // If we have a value for this subcategory, find the matching option
        if (optionValue) {
          // Get all options for this subcategory
          const subcategoryOptions = data.options.filter(
            opt => opt.id_related_subcategory === subcategory.id
          );
          
          // Special detailed logging for problematic subcategories
          if (subcategoryName === 'frets' || subcategoryName === 'headstock angle' || subcategoryName === 'pickups customization' || subcategoryName === 'tuners' || subcategoryName === 'bridge') {
            console.log(`\n🔍 DETAILED DEBUG FOR ${subcategoryName.toUpperCase()}:`);
            console.log(`- Value from database: "${optionValue}" (type: ${typeof optionValue})`);
            console.log(`- Is numeric: ${isNumeric(optionValue)}`);
            console.log(`- Available options for this subcategory:`);
            subcategoryOptions.forEach((opt, index) => {
              console.log(`  ${index + 1}. "${opt.option}" (id: ${opt.id})`);
            });
          } else {
            console.log(`Searching for match for ${subcategoryName} with value "${optionValue}"`);
          }
          
          // For numeric fields that might have formatting differences, we need special handling
          let matchingOption: Option | undefined;

          // First, try to find by ID if the value is a number
          const optionId = parseInt(optionValue as string);
          if (isNumeric(optionValue)) {
            // If the optionValue is a valid number, try to find by ID
            matchingOption = subcategoryOptions.find(opt => opt.id === optionId);
            if (matchingOption) {
              console.log(`- ID match: ✅ Found option with ID ${optionId}: ${matchingOption.option}`);
            }
          }

          // If no match found by ID, try the original text-matching approach
          if (!matchingOption) {
            // For legacy data, try to match by text
            console.log(`- No ID match, trying text matching for: "${optionValue}"`);
            
            // Simple exact text match
            matchingOption = subcategoryOptions.find(opt => opt.option === optionValue);
            
            // If still no match, try case-insensitive
            if (!matchingOption && typeof optionValue === 'string') {
              const lowerValue = optionValue.toLowerCase();
              matchingOption = subcategoryOptions.find(opt => 
                opt.option.toLowerCase() === lowerValue
              );
            }
            
            // If still no match, try looking for partial matches in the option text
            if (!matchingOption && typeof optionValue === 'string') {
              // Try to find a option that contains the optionValue
              matchingOption = subcategoryOptions.find(opt => 
                opt.option.includes(optionValue)
              );
            }
            
            // Special handling for tuners: Prefer ID 98 for Gotoh SG381 (Locking)
            if (subcategoryName === 'tuners' && buildData.tuners) {
              const preferredOption = subcategoryOptions.find(opt => opt.id === 98);
              if (preferredOption && (!matchingOption || matchingOption.id !== 98)) {
                console.log(`- Using preferred Tuners option (ID: 98): ${preferredOption.option}`);
                matchingOption = preferredOption;
              }
            }
            
            // Special handling for bridge: Prefer ID 112 for Hipshot Bridge
            if (subcategoryName === 'bridge' && buildData.bridge) {
              const preferredOption = subcategoryOptions.find(opt => opt.id === 112);
              if (preferredOption && (!matchingOption || matchingOption.id !== 112)) {
                console.log(`- Using preferred Bridge option (ID: 112): ${preferredOption.option}`);
                matchingOption = preferredOption;
              }
            }
          }
          
          // If we still haven't found a matching option, use the first available one
          if (!matchingOption && subcategoryOptions.length > 0) {
            // For frets, prefer ID 179
            if (subcategoryName === 'frets') {
              const preferredFretsOption = subcategoryOptions.find(opt => opt.id === 179);
              if (preferredFretsOption) {
                matchingOption = preferredFretsOption;
                console.log(`- No match found for frets, using preferred option (ID: 179): ${matchingOption.option}`);
              } else {
                matchingOption = subcategoryOptions[0];
                console.log(`- No match found for frets, using first available option: ${matchingOption.option}`);
              }
            } else {
              matchingOption = subcategoryOptions[0];
              console.log(`- No match found for ${subcategoryName}, using first available option: ${matchingOption.option}`);
            }
          }

          // If we found a matching option, add it to the selection
          if (matchingOption) {
            newSelectedOptions.set(subcategory.id, matchingOption)
          }
        } else if (subcategoryName === 'project') {
          // For project, find the default option
          const defaultProjectOption = data.options.find(
            opt => opt.id_related_subcategory === subcategory.id && opt.is_default
          );
          
          if (defaultProjectOption) {
            newSelectedOptions.set(subcategory.id, defaultProjectOption);
            console.log(`✅ Selected default project option:`, defaultProjectOption.option);
          }
        }
      }

      // Update the configuration with the loaded options
      const newConfiguration = {
        selectedOptions: newSelectedOptions,
        totalPrice: buildData.preco || 0,
        isValid: true,
        errors: []
      }

      // Validate the new configuration
      const errors = validateConfiguration(newConfiguration)
      const isValid = errors.length === 0

      // Update state
      setConfiguration({
        ...newConfiguration,
        isValid,
        errors
      })

      // Log the final selected options for debugging
      console.log('FINAL SELECTED OPTIONS:');
      newSelectedOptions.forEach((option, subcategoryId) => {
        const subcategory = data.subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory) {
          console.log(`- ${subcategory.subcategory}: ${option.option} (ID: ${option.id})`);
        }
      });

      // Update image layers
      if (data.options) {
        const newImageLayers = processImageLayers(newSelectedOptions, currentView)
        setImageLayers(newImageLayers)
      }

      // Force a re-render to ensure UI updates
      setTimeout(() => {
        // This will trigger a re-render of components that depend on the configuration
        setConfiguration(prevConfig => {
          console.log('Forcing UI update with configuration:', {
            ...prevConfig,
            selectedOptions: new Map(prevConfig.selectedOptions)
          });
          return {...prevConfig, selectedOptions: new Map(prevConfig.selectedOptions)};
        });
      }, 100);

      // Mark configuration as saved since we just loaded it
      setIsConfigurationSaved(true);

      return { success: true }
    } catch (error: any) {
      console.error('Error in loadBuild:', error)
      return { success: false, error: error.message || 'Failed to load build' }
    }
  }, [data, currentView])

  const value = React.useMemo(() => ({
    configuration,
    loading: isLoading,
    error,
    categories: data?.categories || [],
    subcategories: data?.subcategories || [],
    availableOptions: data?.options || [],
    imageLayers,
    currentView,
    setCurrentView,
    setOption,
    removeOption,
    resetConfiguration,
    getSubcategoryOptions,
    isOptionCompatible,
    getConfigurationErrors,
    isOptionHidden,
    theme,
    setTheme,
    saveBuild,
    getUserBuilds,
    loadBuild,
    isConfigurationSaved
  }), [
    configuration,
    isLoading,
    error,
    data?.categories,
    data?.subcategories,
    data?.options,
    imageLayers,
    currentView,
    setCurrentView,
    setOption,
    removeOption,
    resetConfiguration,
    getSubcategoryOptions,
    isOptionCompatible,
    getConfigurationErrors,
    isOptionHidden,
    theme,
    setTheme,
    saveBuild,
    getUserBuilds,
    loadBuild,
    isConfigurationSaved
  ])

  return (
    <GuitarConfigContext.Provider value={value}>
      {children}
    </GuitarConfigContext.Provider>
  )
}
