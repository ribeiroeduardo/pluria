import { MenuRules } from '@/types/menuRules'
import menuRulesJson from '@/config/menuRules.json'
import { useGuitarStore } from '@/store/useGuitarStore'

export const menuRules = menuRulesJson as unknown as MenuRules

interface ProcessedRules {
  hiddenOptions: number[]
  shownOptions: number[]
  autoselectOptions: number[]
}

interface Selection {
  optionId: number
  timestamp: number
}

export function processMenuRules(selections: Record<number, Selection>): ProcessedRules {
  // Initialize empty result
  const result: ProcessedRules = {
    hiddenOptions: [],
    shownOptions: [],
    autoselectOptions: []
  }

  // Convert selections to array and sort by timestamp
  const selectionEntries = Object.entries(selections)
    .map(([subcategoryId, selection]) => ({
      subcategoryId: parseInt(subcategoryId),
      optionId: selection.optionId,
      timestamp: selection.timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // Process each selection in chronological order
  selectionEntries.forEach(({ optionId }) => {
    // Find matching rules for this selection
    const matchingRules = menuRules.rules.rules.filter(rule => rule.trigger === optionId)
    
    matchingRules.forEach(rule => {
      // Process base actions - these override any previous rules for the affected options
      if (rule.actions?.hide) {
        // Remove these options from shown list if they were previously shown
        result.shownOptions = result.shownOptions.filter(
          id => !rule.actions.hide.includes(id)
        )
        // Add to hidden list
        result.hiddenOptions = [...new Set([...result.hiddenOptions, ...rule.actions.hide])]
      }

      // Process conditional actions
      if (rule.conditions) {
        rule.conditions.forEach(condition => {
          // Check if the condition's "if" option is selected
          if (selectionEntries.some(entry => entry.optionId === condition.if)) {
            // Apply the conditional actions
            if (condition.then.hide) {
              result.shownOptions = result.shownOptions.filter(
                id => !condition.then.hide.includes(id)
              )
              result.hiddenOptions = [...new Set([...result.hiddenOptions, ...condition.then.hide])]
            }
            if (condition.then.show) {
              result.hiddenOptions = result.hiddenOptions.filter(
                id => !condition.then.show.includes(id)
              )
              result.shownOptions = [...new Set([...result.shownOptions, ...condition.then.show])]
            }
            if (condition.then.autoselect) {
              result.autoselectOptions = [...new Set([...result.autoselectOptions, ...condition.then.autoselect])]
            }

            // Process nested rules if they exist
            if (condition.then.nested) {
              condition.then.nested.forEach(nestedRule => {
                // Check if the nested rule's condition is met
                if (selectionEntries.some(entry => entry.optionId === nestedRule.if)) {
                  if (nestedRule.then.hide) {
                    result.shownOptions = result.shownOptions.filter(
                      id => !nestedRule.then.hide.includes(id)
                    )
                    result.hiddenOptions = [...new Set([...result.hiddenOptions, ...nestedRule.then.hide])]
                  }
                  if (nestedRule.then.autoselect) {
                    result.autoselectOptions = [...new Set([...result.autoselectOptions, ...nestedRule.then.autoselect])]
                  }
                }
              })
            }
          }
        })
      }
    })
  })

  return result
}

export function shouldHideOption(optionId: number, selections: Record<number, Selection>): boolean {
  const { hiddenOptions } = processMenuRules(selections)
  return hiddenOptions.includes(optionId)
}

export function isOptionShown(optionId: number, selections: Record<number, Selection>): boolean {
  const { shownOptions } = processMenuRules(selections)
  return shownOptions.includes(optionId)
}

export function getAutoselectedOptions(selections: Record<number, Selection>): number[] {
  const { autoselectOptions } = processMenuRules(selections)
  return autoselectOptions
}

// Remove unused functions
// export function shouldHideSubcategory
// export function getAutoSelectedOptions
// export function isOptionDisabled 