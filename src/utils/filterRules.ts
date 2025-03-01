import type { Option, Subcategory } from '@/types/guitar'

interface FilterRule {
  type: 'strings' | 'scale_length' | 'color_hardware' | 'buckeye_burl_filter' | 'flamed_maple_filter' | 'none_top_filter' | 'maple_burl_filter' | 'quilted_maple_filter' | 'mun_ebony_filter' | 'golden_camphor_filter' | 'hybrid_filter' | 'koa_filter' | 'mahogany_body_filter' | 'paulownia_body_filter' | 'freijo_body_filter' | 'hipshot_bridge_filter' | 'hipshot_multiscale_bridge_filter' | 'tremolo_bridge_filter'
  hideWhen: string | number[]
  showOnly?: {
    subcategories?: number[]
    options?: number[]
  }
  hiddenSubcategories?: number[]
  hiddenOptions?: number[]
  visibleOptions?: number[]
  autoSelectOption?: number
  getAutoSelectOption?: (selectedOptions: Map<number, Option>) => number | undefined
}

export const FILTER_RULES: Record<number, FilterRule> = {
  369: { // 6 Strings
    type: 'strings',
    hideWhen: '7',
    hiddenOptions: [243]
  },
  370: { // 7 Strings
    type: 'strings',
    hideWhen: '6',
    hiddenOptions: [242],
    autoSelectOption: 243
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
    },
    getAutoSelectOption: (selectedOptions: Map<number, Option>) => {
      // Check for hardware color in selected options
      const hasBlackHardware = Array.from(selectedOptions.values()).some(
        opt => opt.color_hardware === 'Preto'
      );
      const hasChromeHardware = Array.from(selectedOptions.values()).some(
        opt => opt.color_hardware === 'Cromado'
      );

      // Return appropriate option based on hardware color
      if (hasBlackHardware) return 120; // Hipshot Multiscale Preto
      if (hasChromeHardware) return 122; // Hipshot Multiscale Cromado
      return undefined;
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
  54: { // Golden Camphor
    type: 'golden_camphor_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [], // No subcategories to show
      options: [] // No options to show
    }
  },
  62: { // Hybrid (Burl & Resin)
    type: 'hybrid_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [], // No subcategories to show
      options: [] // No options to show
    }
  },
  64: { // Koa
    type: 'koa_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [], // No subcategories to show
      options: [] // No options to show
    }
  },
  94: { // Mahogany Body
    type: 'mahogany_body_filter',
    hideWhen: [],
    hiddenSubcategories: [46, 47],
    hiddenOptions: [
      // Paulownia colors
      1032, 1047, 1058, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038,
      // Freijo colors
      1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040
    ]
  },
  91: { // Paulownia Body
    type: 'paulownia_body_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [46],
      options: [1032, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038]
    },
    hiddenSubcategories: [47],
    hiddenOptions: [1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040],
    autoSelectOption: 1032
  },
  274: { // Freijo Body
    type: 'freijo_body_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [47],
      options: [1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1039, 1041, 1042, 1043, 1040]
    },
    hiddenSubcategories: [46],
    hiddenOptions: [1032, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1033, 1034, 1035, 1036, 1038],
    autoSelectOption: 1039
  },
  112: {
    type: 'hipshot_bridge_filter',
    hideWhen: [],
    hiddenOptions: [1153, 1156],
    autoSelectOption: 409
  },
  996: {
    type: 'hipshot_bridge_filter',
    hideWhen: [],
    hiddenOptions: [1153, 1156],
    autoSelectOption: 409
  },
  120: {
    type: 'hipshot_multiscale_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1153],
    autoSelectOption: 1156
  },
  122: {
    type: 'hipshot_multiscale_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1153],
    autoSelectOption: 1156
  },
  116: {
    type: 'tremolo_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1156],
    autoSelectOption: 1153
  },
  390: {
    type: 'tremolo_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1156],
    autoSelectOption: 1153
  },
  128: {
    type: 'tremolo_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1156],
    autoSelectOption: 1153
  },
  130: {
    type: 'tremolo_bridge_filter',
    hideWhen: [],
    hiddenOptions: [409, 1156],
    autoSelectOption: 1153
  },
}

export function shouldHideOption(option: Option, selectedOptions: Map<number, Option>): boolean {
  for (const [, selectedOption] of selectedOptions) {
    const rule = FILTER_RULES[selectedOption.id]
    if (!rule) continue

    switch (rule.type) {
      case 'strings':
        if (option.strings === rule.hideWhen) return true
        if (rule.hiddenOptions?.includes(option.id)) return true
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
      case 'golden_camphor_filter':
        if (selectedOption.id === 54) {
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
      case 'hybrid_filter':
        if (selectedOption.id === 62) {
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
      case 'koa_filter':
        if (selectedOption.id === 64) {
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
        if (selectedOption.id === 94 && rule.hiddenOptions?.includes(option.id)) {
          return true
        }
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
      case 'hipshot_bridge_filter':
        if ((selectedOption.id === 112 || selectedOption.id === 996) && rule.hiddenOptions?.includes(option.id)) {
          return true
        }
        break
      case 'hipshot_multiscale_bridge_filter':
        if ((selectedOption.id === 120 || selectedOption.id === 122) && rule.hiddenOptions?.includes(option.id)) {
          return true
        }
        break
      case 'tremolo_bridge_filter':
        if ([116, 390, 128, 130].includes(selectedOption.id) && rule.hiddenOptions?.includes(option.id)) {
          return true
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

    if (rule.type === 'golden_camphor_filter' && selectedOption.id === 54) {
      const hiddenSubcategories = [39, 40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'hybrid_filter' && selectedOption.id === 62) {
      const hiddenSubcategories = [39, 40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }

    if (rule.type === 'koa_filter' && selectedOption.id === 64) {
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
    case 'golden_camphor_filter':
      if (selectedOption.id === 54) {
        optionsToDeselect = [
          716, 1017, 718, 719, 720,
          734, 735, 736, 737, 738,
          1019, 1021, 1023, 1022, 1020,
          1024, 1025, 1026, 1027, 1028
        ]
      }
      break
    case 'hybrid_filter':
      if (selectedOption.id === 62) {
        optionsToDeselect = [
          716, 1017, 718, 719, 720,
          734, 735, 736, 737, 738,
          1019, 1021, 1023, 1022, 1020,
          1024, 1025, 1026, 1027, 1028
        ]
      }
      break
    case 'koa_filter':
      if (selectedOption.id === 64) {
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
    case 'mahogany_body_filter':
      if (selectedOption.id === 94) {
        optionsToDeselect = rule.hiddenOptions || []
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

export function getAutoSelectOption(selectedOption: Option): number | undefined {
  const rule = FILTER_RULES[selectedOption.id]
  if (!rule) return undefined

  return rule.autoSelectOption
} 