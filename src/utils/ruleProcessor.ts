import { MenuRules, Rule } from '@/types/menuRules'
import menuRules from '@/config/menuRules.json'

interface ProcessedRules {
  hiddenOptions: number[]
  autoSelectedOptions: number[]
  disabledOptions: number[]
  visibleSubcategories: number[]
  hiddenSubcategories: number[]
}

export function processMenuRules(
  selections: Record<number, number>,
  woodSelections: Record<string, boolean>
): ProcessedRules {
  const result: ProcessedRules = {
    hiddenOptions: [],
    autoSelectedOptions: [],
    disabledOptions: [],
    visibleSubcategories: [],
    hiddenSubcategories: []
  }

  // Process string selection rules
  const stringSelection = selections[1] // Assuming 1 is the subcategory ID for strings
  if (stringSelection) {
    const stringRules = Object.values(menuRules.categories.strings.rules)
      .find((rule: Rule) => rule.id === stringSelection)
    
    if (stringRules) {
      if (stringRules.hides) result.hiddenOptions.push(...stringRules.hides)
      if (stringRules.autoSelects && Array.isArray(stringRules.autoSelects)) {
        result.autoSelectedOptions.push(...stringRules.autoSelects)
      }
    }
  }

  // Process scale length rules
  const scaleSelection = selections[2] // Assuming 2 is the subcategory ID for scale length
  if (scaleSelection) {
    const scaleRules = Object.values(menuRules.categories.scale_length.rules)
      .find((rule: Rule) => rule.id === scaleSelection)
    
    if (scaleRules?.hides) {
      result.hiddenOptions.push(...scaleRules.hides)
    }
  }

  // Process wood selection rules
  Object.entries(woodSelections).forEach(([wood, isSelected]) => {
    if (!isSelected) return

    const woodType = wood.replace('is', '').replace('Selected', '').toLowerCase()
    const woodRules = (menuRules.categories.woods.rules as Record<string, Rule>)[woodType]
    
    if (woodRules) {
      if (woodRules.hides) result.hiddenOptions.push(...woodRules.hides)
      if (woodRules.showsSubcategories) result.visibleSubcategories.push(...woodRules.showsSubcategories)
      if (woodRules.hidesSubcategories) result.hiddenSubcategories.push(...woodRules.hidesSubcategories)
      if (woodRules.autoSelects && Array.isArray(woodRules.autoSelects)) {
        result.autoSelectedOptions.push(...woodRules.autoSelects)
      }
    }
  })

  // Process hardware color rules
  const hardwareColorIds = [727, 728] // Black and Chrome IDs
  const selectedHardwareColor = Object.values(selections).find(id => hardwareColorIds.includes(id))
  if (selectedHardwareColor) {
    const colorType = selectedHardwareColor === 727 ? 'black' : 'chrome'
    const hardwareRules = menuRules.categories.hardware.rules[colorType]
    
    if (hardwareRules) {
      if (hardwareRules.hides) result.hiddenOptions.push(...hardwareRules.hides)
      
      // Process auto-selections based on string count
      const stringCount = stringSelection === 369 ? '6_strings' : '7_strings'
      const autoSelects = hardwareRules.autoSelects?.[stringCount]
      if (Array.isArray(autoSelects)) {
        result.autoSelectedOptions.push(...autoSelects.map(comp => comp.id))
      }
    }
  }

  // Process knob rules
  Object.values(menuRules.categories.knobs.rules).forEach(knobTypes => {
    Object.values(knobTypes).forEach((knobRule: Rule) => {
      if (selections[knobRule.id] && knobRule.pairedWith) {
        result.autoSelectedOptions.push(knobRule.pairedWith)
      }
    })
  })

  // Process spokewheel rules
  Object.values(menuRules.categories.spokewheel.rules).forEach((spokewheelRule: Rule) => {
    if (selections[spokewheelRule.id] && spokewheelRule.pairedWith) {
      result.autoSelectedOptions.push(spokewheelRule.pairedWith)
    }
    
    // Check if this spokewheel is required by the current string selection
    if (spokewheelRule.requiredBy?.strings === stringSelection) {
      result.autoSelectedOptions.push(spokewheelRule.id)
    }
  })

  return result
}

export function shouldHideOption(optionId: number, selections: Record<number, number>, woodSelections: Record<string, boolean>): boolean {
  const { hiddenOptions } = processMenuRules(selections, woodSelections)
  return hiddenOptions.includes(optionId)
}

export function shouldHideSubcategory(subcategoryId: number, woodSelections: Record<string, boolean>): boolean {
  const { hiddenSubcategories } = processMenuRules({}, woodSelections)
  return hiddenSubcategories.includes(subcategoryId)
}

export function getAutoSelectedOptions(selections: Record<number, number>, woodSelections: Record<string, boolean>): number[] {
  const { autoSelectedOptions } = processMenuRules(selections, woodSelections)
  return autoSelectedOptions
}

export function isOptionDisabled(optionId: number, selections: Record<number, number>, woodSelections: Record<string, boolean>): boolean {
  const { disabledOptions } = processMenuRules(selections, woodSelections)
  return disabledOptions.includes(optionId)
} 