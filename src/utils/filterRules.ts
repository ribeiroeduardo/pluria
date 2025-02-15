import type { Option, Subcategory } from '@/types/guitar'

interface FilterRule {
  type: 'strings' | 'scale_length' | 'color_hardware' | 'buckeye_burl_filter' | 'flamed_maple_filter' | 'none_top_filter' | 'maple_burl_filter' | 'quilted_maple_filter' | 'mun_ebony_filter' | 'mahogany_body_filter' | 'paulownia_body_filter' | 'freijo_body_filter'
  hideWhen: string | number[]
  showOnly?: {
    subcategories?: number[]
    options?: number[]
  }
  hiddenSubcategories?: number[]
  hiddenOptions?: number[]
  visibleOptions?: number[]
}

export const FILTER_RULES: Record<number, FilterRule> = {
  369: { // 6 Strings
    type: 'strings',
    hideWhen: '7'
  },
  242: { // 25.5 Scale
    type: 'scale_length',
    hideWhen: 'multiscale',
    showOnly: {
      subcategories: [],
      options: []
    },
    hiddenSubcategories: [34, 35],
    hiddenOptions: [434, 667]
  },
  243: { // 25.5-27 Scale
    type: 'scale_length',
    hideWhen: 'standard',
    showOnly: {
      subcategories: [34, 35],
      options: [434, 667]
    }
  },
  727: { // Black Hardware
    type: 'color_hardware',
    hideWhen: 'Cromado'
  },
  728: { // Chrome Hardware
    type: 'color_hardware',
    hideWhen: 'Preto'
  },
  55: { //buckeye burl
    type: 'buckeye_burl_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [39],
      options: [716, 1017, 718, 719, 720]
    }
  },
  244: { // Flamed Maple
    type: 'flamed_maple_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [40],
      options: [734, 735, 736, 737, 738]
    }
  },
  1045: { // Top Wood - None
    type: 'none_top_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [], // Hide all color subcategories
      options: [] // Hide all color options
    }
  },
  53: { // Maple Burl
    type: 'maple_burl_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [41],
      options: [1019, 1021, 1023, 1022, 1020]
    }
  },
  59: { // Quilted Maple
    type: 'quilted_maple_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [44],
      options: [1024, 1025, 1026, 1027, 1028]
    }
  },
  65: { // Mun Ebony
    type: 'mun_ebony_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [], // No subcategories to show
      options: [] // No options to show
    }
  },
  94: { // Mahogany Body Wood
    type: 'mahogany_body_filter',
    hideWhen: [],
    hiddenOptions: [1032, 1047, 1058, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040],
    hiddenSubcategories: [46, 47]
  },
  91: { // Paulownia Body Wood
    type: 'paulownia_body_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [46],
      options: [1032, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038]
    },
    hiddenOptions: [1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040],
    hiddenSubcategories: [47]
  },
  274: { // Freijo Body Wood
    type: 'freijo_body_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [47],
      options: [1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040]
    },
    hiddenOptions: [1032, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038],
    hiddenSubcategories: [46]
  },
}

export function shouldHideOption(option: Option, selectedOptions: Map<number, Option>): boolean {
  for (const [, selectedOption] of selectedOptions) {
    const rule = FILTER_RULES[selectedOption.id]
    if (!rule) continue

    switch (rule.type) {
      case 'strings':
        if (option.strings === rule.hideWhen) return true
        break
      case 'scale_length':
        if (option.scale_length === rule.hideWhen) return true
        if (selectedOption.id === 242 && rule.hiddenOptions?.includes(option.id)) return true
        if (selectedOption.id === 243 && rule.showOnly) {
          if (rule.showOnly.options?.includes(option.id)) return false
        }
        break
      case 'color_hardware':
        if (option.color_hardware === rule.hideWhen) return true
        break
      case 'buckeye_burl_filter':
        if (selectedOption.id === 55) {
          const hiddenOptions = [734, 735, 736, 737, 738, 1019, 1021, 1023, 1022, 1020, 1024, 1025, 1026, 1027, 1028]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [40, 41, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'flamed_maple_filter':
        if (selectedOption.id === 244) {
          const hiddenOptions = [716, 1017, 718, 719, 720, 1019, 1021, 1023, 1022, 1020, 1024, 1025, 1026, 1027, 1028]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [39, 41, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'none_top_filter':
        if (selectedOption.id === 1045) {
          const hiddenOptions = [
            716, 1017, 718, 719, 720,
            734, 735, 736, 737, 738,
            1019, 1021, 1023, 1022, 1020,
            1024, 1025, 1026, 1027, 1028
          ]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [39, 40, 41, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'maple_burl_filter':
        if (selectedOption.id === 53) {
          const hiddenOptions = [716, 1017, 718, 719, 720, 734, 735, 736, 737, 738, 1024, 1025, 1026, 1027, 1028]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [39, 40, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'quilted_maple_filter':
        if (selectedOption.id === 59) {
          const hiddenOptions = [716, 1017, 718, 719, 720, 734, 735, 736, 737, 738, 1019, 1021, 1023, 1022, 1020]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [39, 40, 41]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'mun_ebony_filter':
        if (selectedOption.id === 65) {
          const hiddenOptions = [
            716, 1017, 718, 719, 720,
            734, 735, 736, 737, 738,
            1019, 1021, 1023, 1022, 1020,
            1024, 1025, 1026, 1027, 1028
          ]
          if (hiddenOptions.includes(option.id)) return true

          const hiddenSubcategories = [39, 40, 41, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
      case 'mahogany_body_filter':
        if (selectedOption.id === 94 && rule.hiddenOptions?.includes(option.id)) return true
        break
      case 'paulownia_body_filter':
        if (selectedOption.id === 91) {
          if (rule.showOnly?.options?.includes(option.id)) return false
          if (rule.hiddenOptions?.includes(option.id)) return true
        }
        break
      case 'freijo_body_filter':
        if (selectedOption.id === 274) {
          if (rule.showOnly?.options?.includes(option.id)) return false
          if (rule.hiddenOptions?.includes(option.id)) return true
        }
        break
    }
  }
  return false
}

export function shouldHideSubcategory(subcategory: Subcategory, selectedOptions: Map<number, Option>): boolean {
  for (const [, selectedOption] of selectedOptions) {
    const rule = FILTER_RULES[selectedOption.id]
    if (!rule) continue

    if (selectedOption.id === 242 && rule.hiddenSubcategories?.includes(subcategory.id)) {
      return true
    }

    if (selectedOption.id === 243 && rule.showOnly?.subcategories) {
      if (rule.showOnly.subcategories.includes(subcategory.id)) return false
    }

    if (rule.type === 'buckeye_burl_filter' && selectedOption.id === 55) {
      const hiddenSubcategories = [40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'flamed_maple_filter' && selectedOption.id === 244) {
      const hiddenSubcategories = [39, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'none_top_filter' && selectedOption.id === 1045) {
      const hiddenSubcategories = [39, 40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'maple_burl_filter' && selectedOption.id === 53) {
      const hiddenSubcategories = [39, 40, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'quilted_maple_filter' && selectedOption.id === 59) {
      const hiddenSubcategories = [39, 40, 41]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'mun_ebony_filter' && selectedOption.id === 65) {
      const hiddenSubcategories = [39, 40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'mahogany_body_filter' && selectedOption.id === 94) {
      if (rule.hiddenSubcategories?.includes(subcategory.id)) return true
    }

    if (rule.type === 'paulownia_body_filter' && selectedOption.id === 91) {
      if (rule.showOnly?.subcategories?.includes(subcategory.id)) return false
      if (rule.hiddenSubcategories?.includes(subcategory.id)) return true
    }

    if (rule.type === 'freijo_body_filter' && selectedOption.id === 274) {
      if (rule.showOnly?.subcategories?.includes(subcategory.id)) return false
      if (rule.hiddenSubcategories?.includes(subcategory.id)) return true
    }
  }
  return false
}

export function getOptionsToDeselect(selectedOption: Option, currentSelections: Map<number, Option>): number[] {
  const rule = FILTER_RULES[selectedOption.id]
  if (!rule) return []

  let optionsToDeselect: number[] = []

  switch (rule.type) {
    case 'none_top_filter':
      if (selectedOption.id === 1045) {
        optionsToDeselect = [
          716, 1017, 718, 719, 720,
          734, 735, 736, 737, 738,
          1019, 1021, 1023, 1022, 1020,
          1024, 1025, 1026, 1027, 1028
        ]
      }
      break
    case 'flamed_maple_filter':
      if (selectedOption.id === 244) {
        optionsToDeselect = [716, 1017, 718, 719, 720, 1019, 1021, 1023, 1022, 1020, 1024, 1025, 1026, 1027, 1028]
      }
      break
    case 'maple_burl_filter':
      if (selectedOption.id === 53) {
        optionsToDeselect = [716, 1017, 718, 719, 720, 734, 735, 736, 737, 738, 1024, 1025, 1026, 1027, 1028]
      }
      break
    case 'quilted_maple_filter':
      if (selectedOption.id === 59) {
        optionsToDeselect = [716, 1017, 718, 719, 720, 734, 735, 736, 737, 738, 1019, 1021, 1023, 1022, 1020]
      }
      break
    case 'mun_ebony_filter':
      if (selectedOption.id === 65) {
        optionsToDeselect = [
          716, 1017, 718, 719, 720,
          734, 735, 736, 737, 738,
          1019, 1021, 1023, 1022, 1020,
          1024, 1025, 1026, 1027, 1028
        ]
      }
      break
    case 'buckeye_burl_filter':
      if (selectedOption.id === 55) {
        optionsToDeselect = [734, 735, 736, 737, 738, 1019, 1021, 1023, 1022, 1020, 1024, 1025, 1026, 1027, 1028]
      }
      break
    case 'paulownia_body_filter':
      if (selectedOption.id === 91) {
        optionsToDeselect = rule.hiddenOptions || []
      }
      break
    case 'freijo_body_filter':
      if (selectedOption.id === 274) {
        optionsToDeselect = rule.hiddenOptions || []
      }
      break
  }

  return optionsToDeselect
} 