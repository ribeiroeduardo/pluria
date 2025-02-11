import { Option } from '@/types/guitar'
import { useGuitarStore } from '@/store/useGuitarStore'

interface Rule {
  condition: (selections: Record<number, number>, options: Option[], woodSelections: Record<string, boolean>) => boolean
  actions: {
    hide?: number[]
    autoSelect?: number[]
    disable?: number[]
  }
}

interface RuleSet {
  [key: string]: {
    [key: string]: Rule
  }
}

// Configuration rules
export const configRules: RuleSet = {
  Strings: {
    '6': {
      condition: (selections, options) => {
        const selectedOption = options.find(opt => opt.id === selections[1]) // Assuming 1 is the subcategory ID for strings
        return selectedOption?.strings === '6'
      },
      actions: {
        hide: [370], // Hide 7 strings option
        autoSelect: [1030] // Auto-select black Spokewheel for 6 strings
      }
    },
    '7': {
      condition: (selections, options) => {
        const selectedOption = options.find(opt => opt.id === selections[1])
        return selectedOption?.strings === '7'
      },
      actions: {
        hide: [369], // Hide 6 strings option
        autoSelect: [1031] // Auto-select chrome Spokewheel for 7 strings
      }
    }
  },
  'Scale Length': {
    'standard': {
      condition: (selections, options) => {
        const selectedOption = options.find(opt => opt.id === selections[2]) // Assuming 2 is the subcategory ID for scale length
        return selectedOption?.scale_length === 'standard'
      },
      actions: {
        hide: [2] // Hide multiscale option
      }
    },
    'multiscale': {
      condition: (selections, options) => {
        const selectedOption = options.find(opt => opt.id === selections[2])
        return selectedOption?.scale_length === 'multiscale'
      },
      actions: {
        hide: [1] // Hide standard scale option
      }
    }
  },
  'Woods': {
    'buckeye': {
      condition: (selections, options, woodSelections) => woodSelections.isBuckeyeBurlSelected,
      actions: {
        hide: [244, 53, 59, 91] // Hide other wood options
      }
    },
    'flamed': {
      condition: (selections, options, woodSelections) => woodSelections.isFlamedMapleSelected,
      actions: {
        hide: [55, 53, 59, 91] // Hide other wood options
      }
    },
    'maple_burl': {
      condition: (selections, options, woodSelections) => woodSelections.isMapleBurlSelected,
      actions: {
        hide: [55, 244, 59, 91] // Hide other wood options
      }
    },
    'quilted': {
      condition: (selections, options, woodSelections) => woodSelections.isQuiltedMapleSelected,
      actions: {
        hide: [55, 244, 53, 91] // Hide other wood options
      }
    },
    'paulownia': {
      condition: (selections, options, woodSelections) => woodSelections.isPaulowniaSelected,
      actions: {
        hide: [55, 244, 53, 59], // Hide other wood options
        autoSelect: [1032] // Auto-select Natural finish
      }
    }
  }
}

// Rule processor
export const processRules = (
  selections: Record<number, number>,
  options: Option[]
): {
  hiddenOptions: number[]
  autoSelectedOptions: number[]
  disabledOptions: number[]
} => {
  const { woodSelections } = useGuitarStore.getState()
  const result = {
    hiddenOptions: [] as number[],
    autoSelectedOptions: [] as number[],
    disabledOptions: [] as number[]
  }

  // Process each rule category
  Object.values(configRules).forEach(categoryRules => {
    Object.values(categoryRules).forEach(rule => {
      if (rule.condition(selections, options, woodSelections)) {
        if (rule.actions.hide) {
          result.hiddenOptions.push(...rule.actions.hide)
        }
        if (rule.actions.autoSelect) {
          result.autoSelectedOptions.push(...rule.actions.autoSelect)
        }
        if (rule.actions.disable) {
          result.disabledOptions.push(...rule.actions.disable)
        }
      }
    })
  })

  return result
}

// Helper function to check if an option should be hidden
export const shouldHideOption = (
  optionId: number,
  selections: Record<number, number>,
  options: Option[]
): boolean => {
  const { hiddenOptions } = processRules(selections, options)
  return hiddenOptions.includes(optionId)
}

// Helper function to get auto-selected options
export const getAutoSelectedOptions = (
  selections: Record<number, number>,
  options: Option[]
): number[] => {
  const { autoSelectedOptions } = processRules(selections, options)
  return autoSelectedOptions
}

// Helper function to check if an option should be disabled
export const isOptionDisabled = (
  optionId: number,
  selections: Record<number, number>,
  options: Option[]
): boolean => {
  const { disabledOptions } = processRules(selections, options)
  return disabledOptions.includes(optionId)
} 