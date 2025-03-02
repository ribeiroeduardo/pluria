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

interface GuitarConfigContextType extends ConfigurationState {
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
            buildData.body_color = option.option
            break
          case 'body wood':
            buildData.body_wood = option.option
            break
          case 'top wood':
            buildData.top_wood = option.option
            break
          case 'top color':
            buildData.top_color = option.option
            break
          case 'burst':
            buildData.burst = option.option
            break
          case 'top coat':
            buildData.top_coat = option.option
            break
          case 'neck wood':
            buildData.neck_wood = option.option
            break
          case 'fretboard wood':
            buildData.fretboard_wood = option.option
            break
          case 'inlays':
            buildData.inlays = option.option
            break
          case 'nut':
            buildData.nut = option.option
            break
          case 'frets':
            // Convert frets from string to a proper number, handling any special characters
            try {
              // Extract only digits and convert to a number
              const fretsValue = option.option.replace(/[^\d]/g, '');
              // Convert to string to match the type in Database['public']['Tables']['builds']['Insert']
              buildData.frets = fretsValue ? fretsValue : null;
            } catch (e) {
              console.error("Error converting frets value:", option.option);
              buildData.frets = null;
            }
            break
          case 'neck construction':
            buildData.neck_construction = option.option
            break
          case 'side dots':
            buildData.side_dots = option.option
            break
          case 'neck reinforcements':
            buildData.neck_reinforcements = option.option
            break
          case 'neck profile':
            buildData.neck_profile = option.option
            break
          case 'fretboard radius':
            // Convert fretboard radius from string format with commas to numeric format with decimal points
            try {
              // Replace commas with periods and remove any unwanted characters
              const cleanedValue = option.option.replace(',', '.').replace(/[^\d.]/g, '');
              buildData.fretboard_radius = cleanedValue || null;
            } catch (e) {
              console.error("Error converting fretboard radius value:", option.option);
              buildData.fretboard_radius = null;
            }
            break
          case 'headstock angle':
            // Convert headstock angle from string format with commas to numeric format with decimal points
            try {
              // Replace commas with periods and remove any unwanted characters
              const cleanedValue = option.option.replace(',', '.').replace(/[^\d.]/g, '');
              buildData.headstock_angle = cleanedValue || null;
            } catch (e) {
              console.error("Error converting headstock angle value:", option.option);
              buildData.headstock_angle = null;
            }
            break
          case 'bridge':
            buildData.bridge = option.option
            break
          case 'tuners':
            buildData.tuners = option.option
            break
          case 'hardware color':
            buildData.hardware_color = option.option
            break
          case 'pickups':
            buildData.pickups = option.option
            break
          case 'knobs':
            buildData.knobs = option.option
            break
          case 'switch':
            buildData.switch = option.option
            break
          case 'pickups finish':
            buildData.pickups_finish = option.option
            break
          case 'pickups customization':
            buildData.pickups_customization = option.option
            break
          case 'plates':
            buildData.plates = option.option
            break
          case 'strings':
            buildData.strings = option.option
            break
          case 'scale length':
            // Convert scale length from string format with commas to numeric format with decimal points
            try {
              if (option.option === '25,5') {
                buildData.scale_length = '25.5';
              } else if (option.option === '25,5 - 27 (Multiscale)') {
                buildData.scale_length = '25.5';  // Just store the base scale length
              } else {
                // Replace commas with periods and remove any unwanted characters
                const cleanedValue = option.option.replace(',', '.').replace(/[^\d.]/g, '');
                buildData.scale_length = cleanedValue || null;
              }
            } catch (e) {
              console.error("Error converting scale length value:", option.option);
              buildData.scale_length = null;
            }
            break
          case 'case':
            buildData.case_type = option.option
            break
        }
      }

      // Debug logging for numeric fields
      console.log('Debug - Build data before saving:', buildData);

      // Insert data into Supabase
      const { data: insertData, error } = await supabase
        .from('builds')
        .insert(buildData)
        .select()

      if (error) {
        console.error('Error saving build:', error)
        return { success: false, error: error.message }
      }

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
      if (!data?.subcategories || !data?.options) {
        return { success: false, error: 'Configuration data not loaded yet' }
      }

      // Create a new map for selected options
      const newSelectedOptions = new Map<number, Option>()

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
        }

        // If we have a value for this subcategory, find the matching option
        if (optionValue) {
          const matchingOption = data.options.find(
            opt => opt.id_related_subcategory === subcategory.id && opt.option === optionValue
          )
          
          if (matchingOption) {
            newSelectedOptions.set(subcategory.id, matchingOption)
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

      // Update image layers
      if (data.options) {
        const newImageLayers = processImageLayers(newSelectedOptions, currentView)
        setImageLayers(newImageLayers)
      }

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
    loadBuild
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
    loadBuild
  ])

  return (
    <GuitarConfigContext.Provider value={value}>
      {children}
    </GuitarConfigContext.Provider>
  )
}
