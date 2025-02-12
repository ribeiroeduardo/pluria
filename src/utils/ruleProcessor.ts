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
  const result: ProcessedRules = {
    hiddenOptions: [],
    shownOptions: [],
    autoselectOptions: [],
    hiddenSubcategories: [],
    shownSubcategories: []
  }

  const selectionEntries = Object.entries(selections)
    .map(([subcategoryId, selection]) => ({
      subcategoryId: parseInt(subcategoryId),
      optionId: selection.optionId,
      timestamp: selection.timestamp
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  selectionEntries.forEach(({ optionId }) => {
    const matchingRules = menuRules.rules.rules.filter(rule => rule.trigger === optionId)
    
    matchingRules.forEach(rule => {
      if (rule.actions?.hide) {
        result.hiddenOptions = [...new Set([...result.hiddenOptions, ...rule.actions.hide])]
        result.shownOptions = result.shownOptions.filter(
          id => !rule.actions.hide.includes(id)
        )
      }

      if (rule.actions?.show) {
        result.hiddenOptions = result.hiddenOptions.filter(
          id => !rule.actions.show.includes(id)
        )
        result.shownOptions = [...new Set([...result.shownOptions, ...rule.actions.show])]
      }

      if (rule.actions?.show_subcategories) {
        result.hiddenSubcategories = result.hiddenSubcategories.filter(
          id => !rule.actions.show_subcategories.includes(id)
        )
        result.shownSubcategories = [...new Set([...result.shownSubcategories, ...rule.actions.show_subcategories])]
      }

      if (rule.actions?.hide_subcategories) {
        result.shownSubcategories = result.shownSubcategories.filter(
          id => !rule.actions.hide_subcategories.includes(id)
        )
        result.hiddenSubcategories = [...new Set([...result.hiddenSubcategories, ...rule.actions.hide_subcategories])]
      }

      if (rule.conditions) {
        rule.conditions.forEach(condition => {
          const isConditionMet = selectionEntries.some(entry => entry.optionId === condition.if)
          
          if (isConditionMet) {
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

            if (condition.then.nested) {
              condition.then.nested.forEach(nestedRule => {
                const isHardwareColorRule = rule.trigger === 727 || rule.trigger === 728
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

export function shouldHideSubcategory(subcategoryId: number, selections: Record<number, Selection>): boolean {
  const { hiddenSubcategories } = processMenuRules(selections)
  return hiddenSubcategories.includes(subcategoryId)
}

export function getAutoselectedOptions(selections: Record<number, Selection>): number[] {
  const { autoselectOptions } = processMenuRules(selections)
  return autoselectOptions
}