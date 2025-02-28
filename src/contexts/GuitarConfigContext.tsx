
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
  ImageLayer
} from '@/types/guitar'
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

        const processedOptions = optionsResult.data.map(option => ({
          ...option,
          image_url: option.front_image_url ? `/images/${option.front_image_url.split('/').pop()}` : null
        }))

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
    const newLayers = processImageLayers(newSelections)

    setConfiguration({
      selectedOptions: newSelections,
      totalPrice,
      isValid: errors.length === 0,
      errors
    })
    setImageLayers(newLayers)
  }, [])

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
    if (rule?.autoSelectOption) {
      const autoSelectedOption = data?.options.find(opt => opt.id === rule.autoSelectOption)
      if (autoSelectedOption?.id_related_subcategory) {
        newSelections.set(autoSelectedOption.id_related_subcategory, autoSelectedOption)
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

  const value = React.useMemo(() => ({
    configuration,
    loading: isLoading,
    error,
    categories: data?.categories || [],
    subcategories: data?.subcategories || [],
    availableOptions: data?.options || [],
    imageLayers,
    setOption,
    removeOption,
    resetConfiguration,
    getSubcategoryOptions,
    isOptionCompatible,
    getConfigurationErrors,
    isOptionHidden
  }), [
    configuration,
    isLoading,
    error,
    data?.categories,
    data?.subcategories,
    data?.options,
    imageLayers,
    setOption,
    removeOption,
    resetConfiguration,
    getSubcategoryOptions,
    isOptionCompatible,
    getConfigurationErrors,
    isOptionHidden
  ])

  return (
    <GuitarConfigContext.Provider value={value}>
      {children}
    </GuitarConfigContext.Provider>
  )
}
