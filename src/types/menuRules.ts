export interface HardwareComponent {
  id: number
  type: 'tuners' | 'knob_volume' | 'knob_volume_tone' | 'bridge' | 'spokewheel'
}

export interface Rule {
  id: number
  hides?: number[]
  autoSelects?: number[] | {
    [key: string]: HardwareComponent[]
  }
  showsSubcategories?: number[]
  hidesSubcategories?: number[]
  dependencies?: number[]
  pairedWith?: number
  requiredBy?: {
    [key: string]: number
  }
}

export interface CategoryRules {
  id?: number
  rules: {
    [key: string]: Rule | {
      [key: string]: Rule
    }
  }
}

export interface SubcategoryVisibility {
  visibleWhen: {
    wood: 'buckeye_burl' | 'flamed_maple' | 'maple_burl' | 'quilted_maple' | 'paulownia'
  }
}

export interface MenuRules {
  categories: {
    strings: CategoryRules
    scale_length: CategoryRules
    woods: CategoryRules
    hardware: CategoryRules
    knobs: CategoryRules
    spokewheel: CategoryRules
  }
  subcategories: {
    [key: string]: SubcategoryVisibility
  }
  defaults: {
    strings: number
    hardware_color: number
    spokewheel: number
    wood: number
    finish: number
  }
} 