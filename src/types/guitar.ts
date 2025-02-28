
import { type Tables } from '@/integrations/supabase/types'

export interface Option extends Tables<'options'> {
  image_url: string | null
}

export interface Category extends Tables<'categories'> {
  category: string
  sort_order: number
}

export interface Subcategory extends Tables<'subcategories'> {
  id_related_category: number
  subcategory: string
  sort_order: number
  hidden: boolean | null
  options?: Option[]
}

export interface GuitarConfiguration {
  selectedOptions: Map<number, Option>
  totalPrice: number
  isValid: boolean
  errors: ConfigurationError[]
}

export interface ConfigurationError {
  type: 'incompatible_options' | 'missing_required' | 'invalid_combination'
  message: string
  subcategoryId?: number
  optionId?: number
}

export type HardwareColor = 'Preto' | 'Cromado'
export type StringCount = '6' | '7'
export type ScaleLength = '25,5' | '25,5 - 27 (Multiscale)'
export type GuitarView = 'front' | 'back' | 'both'

export interface OptionValidation {
  isValid: boolean
  error?: ConfigurationError
}

export interface OptionDependency {
  subcategoryId: number
  requiredOptionIds: number[]
  incompatibleOptionIds: number[]
}

export interface ImageLayer {
  url: string
  zIndex: number
  optionId: number
  view: GuitarView | null
  isVisible: boolean
}

export interface ConfigurationState {
  configuration: GuitarConfiguration
  loading: boolean
  error: Error | null
  categories: Category[]
  subcategories: Subcategory[]
  availableOptions: Option[]
  imageLayers: ImageLayer[]
  currentView: GuitarView
  setCurrentView: (view: GuitarView) => void
}
