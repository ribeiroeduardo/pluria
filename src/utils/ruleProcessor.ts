import { MenuRules } from '@/types/menuRules'
import menuRulesJson from '@/config/menuRules.json'
import { useGuitarStore } from '@/store/useGuitarStore'

export const menuRules = menuRulesJson as unknown as MenuRules

interface ProcessedRules {
  hiddenOptions: number[]
  shownOptions: number[]
  autoselectOptions: number[]
  hiddenSubcategories: number[]
  shownSubcategories: number[]
}

interface Selection {
  optionId: number
  timestamp: number
}

export function processMenuRules(selections: Record<number, Selection>): ProcessedRules {
  console.log('Processing rules for selections:', selections);
  
  // Initialize empty result
  const result: ProcessedRules = {
    hiddenOptions: [],
    shownOptions: [],
    autoselectOptions: [],
    hiddenSubcategories: [],
    shownSubcategories: []
  }

  // Convert selections to array and sort by timestamp
  const selectionEntries = Object.entries(selections)
    .map(([subcategoryId, selection]) => ({
      subcategoryId: parseInt(subcategoryId),
      optionId: selection.optionId,
      timestamp: selection.timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  console.log('Selection entries:', selectionEntries);

  // Process each selection in chronological order
  selectionEntries.forEach(({ optionId }) => {
    // Find matching rules for this selection
    const matchingRules = menuRules.rules.rules.filter(rule => rule.trigger === optionId)
    
    // Only log for Buckeye Burl selection
    if (optionId === 55) {
      console.log('Processing Buckeye Burl rule:', {
        matchingRules,
        currentSelections: selectionEntries
      });
    }
    
    matchingRules.forEach(rule => {
      // Process base actions - these override any previous rules for the affected options
      if (rule.actions?.hide) {
        console.log('Hiding options:', rule.actions.hide);
        // Remove these options from shown list if they were previously shown
        result.shownOptions = result.shownOptions.filter(
          id => !rule.actions.hide.includes(id)
        )
        // Add to hidden list
        result.hiddenOptions = [...new Set([...result.hiddenOptions, ...rule.actions.hide])]
      }

      if (rule.actions?.show) {
        console.log('Showing options:', rule.actions.show);
        // Remove from hidden list if previously hidden
        result.hiddenOptions = result.hiddenOptions.filter(
          id => !rule.actions.show.includes(id)
        )
        // Add to shown list
        result.shownOptions = [...new Set([...result.shownOptions, ...rule.actions.show])]

        // Only log for Buckeye Burl rule
        if (rule.trigger === 55) {
          console.log('After processing Buckeye Burl show actions:', {
            shownOptions: result.shownOptions,
            hiddenOptions: result.hiddenOptions
          });
        }
      }

      if (rule.actions?.show_subcategories) {
        console.log('Showing subcategories:', rule.actions.show_subcategories);
        // Remove from hidden list if previously hidden
        result.hiddenSubcategories = result.hiddenSubcategories.filter(
          id => !rule.actions.show_subcategories.includes(id)
        )
        // Add to shown list
        result.shownSubcategories = [...new Set([...result.shownSubcategories, ...rule.actions.show_subcategories])]

        // Only log for Buckeye Burl rule
        if (rule.trigger === 55) {
          console.log('After processing Buckeye Burl subcategories:', {
            shownSubcategories: result.shownSubcategories
          });
        }
      }

      if (rule.actions?.hide_subcategories) {
        // Remove from shown list if previously shown
        result.shownSubcategories = result.shownSubcategories.filter(
          id => !rule.actions.hide_subcategories.includes(id)
        )
        // Add to hidden list
        result.hiddenSubcategories = [...new Set([...result.hiddenSubcategories, ...rule.actions.hide_subcategories])]
      }

      // Process conditional actions
      if (rule.conditions) {
        rule.conditions.forEach(condition => {
          // Check if the condition's "if" option is selected
          const isConditionMet = selectionEntries.some(entry => entry.optionId === condition.if)
          
          if (isConditionMet) {
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
            if (condition.then.show_subcategories) {
              result.hiddenSubcategories = result.hiddenSubcategories.filter(
                id => !condition.then.show_subcategories.includes(id)
              )
              result.shownSubcategories = [...new Set([...result.shownSubcategories, ...condition.then.show_subcategories])]
            }
            if (condition.then.hide_subcategories) {
              result.shownSubcategories = result.shownSubcategories.filter(
                id => !condition.then.hide_subcategories.includes(id)
              )
              result.hiddenSubcategories = [...new Set([...result.hiddenSubcategories, ...condition.then.hide_subcategories])]
            }

            // Process nested rules if they exist
            if (condition.then.nested) {
              condition.then.nested.forEach(nestedRule => {
                // For nested rules in hardware color conditions, apply them immediately if parent conditions are met
                const isHardwareColorRule = rule.trigger === 727 || rule.trigger === 728 // Hardware Color Black or Chrome
                const shouldApplyNestedRule = isHardwareColorRule || 
                  selectionEntries.some(entry => entry.optionId === nestedRule.if)

                if (shouldApplyNestedRule) {
                  if (nestedRule.then.hide) {
                    result.shownOptions = result.shownOptions.filter(
                      id => !nestedRule.then.hide.includes(id)
                    )
                    result.hiddenOptions = [...new Set([...result.hiddenOptions, ...nestedRule.then.hide])]
                  }
                  if (nestedRule.then.show) {
                    result.hiddenOptions = result.hiddenOptions.filter(
                      id => !nestedRule.then.show.includes(id)
                    )
                    result.shownOptions = [...new Set([...result.shownOptions, ...nestedRule.then.show])]
                  }
                  if (nestedRule.then.autoselect) {
                    result.autoselectOptions = [...new Set([...result.autoselectOptions, ...nestedRule.then.autoselect])]
                  }
                  if (nestedRule.then.show_subcategories) {
                    result.hiddenSubcategories = result.hiddenSubcategories.filter(
                      id => !nestedRule.then.show_subcategories.includes(id)
                    )
                    result.shownSubcategories = [...new Set([...result.shownSubcategories, ...nestedRule.then.show_subcategories])]
                  }
                  if (nestedRule.then.hide_subcategories) {
                    result.shownSubcategories = result.shownSubcategories.filter(
                      id => !nestedRule.then.hide_subcategories.includes(id)
                    )
                    result.hiddenSubcategories = [...new Set([...result.hiddenSubcategories, ...nestedRule.then.hide_subcategories])]
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

export function shouldShowSubcategory(subcategoryId: number, selections: Record<number, Selection>): boolean {
  const { shownSubcategories } = processMenuRules(selections)
  return shownSubcategories.includes(subcategoryId)
}

export function getAutoselectedOptions(selections: Record<number, Selection>): number[] {
  const { autoselectOptions } = processMenuRules(selections)
  return autoselectOptions
}