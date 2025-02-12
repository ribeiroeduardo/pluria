export interface HardwareComponent {
  id: number
  type: 'tuners' | 'knob_volume' | 'knob_volume_tone' | 'bridge' | 'spokewheel'
}

export interface DatabaseConfig {
  options: {
    imageUrl: {
      prefix: string
      useFilename: boolean
    }
  }
  sort: {
    fields: string[]
    direction: 'asc' | 'desc'
  }
  subcategories: {
    sort: {
      field: string
      direction: 'asc' | 'desc'
    }
  }
  categories: {
    exclude: string[]
    sort: {
      field: string
      direction: 'asc' | 'desc'
    }
  }
}

export interface Rule {
  trigger: number
  conditions?: Array<{
    if: number
    then: {
      show?: number[]
      hide?: number[]
      autoselect?: number[]
      nested?: Array<{
        if: number
        then: {
          show?: number[]
          autoselect?: number[]
          hide?: number[]
        }
      }>
    }
  }>
  actions?: {
    hide?: number[]
    show?: number[]
  }
}

export interface RulesConfig {
  rules: Rule[]
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
  database: DatabaseConfig
  rules: RulesConfig
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
    scale_length: number
    hardware_color: number
    spokewheel: number
    wood: number
    finish: number
    knob_type: number
    bridge: number
    tuners: number
  }
} 