import { create } from 'zustand'
import { Option } from '@/types/guitar'
import { type Category } from '@/utils/menuUtils'
import { processMenuRules } from '@/utils/ruleProcessor'

interface GuitarState {
  userSelections: Record<number, number>
  selectedOptionId: number | null
  linkedSelections: Record<number, number>
  expandedCategories: string[]
  categories: Category[]
  woodSelections: {
    isBuckeyeBurlSelected: boolean
    isFlamedMapleSelected: boolean
    isMapleBurlSelected: boolean
    isQuiltedMapleSelected: boolean
    isPaulowniaSelected: boolean
  }
  setSelection: (subcategoryId: number, optionId: number) => void
  toggleCategory: (categoryId: string) => void
  setWoodSelection: (wood: keyof GuitarState['woodSelections'], value: boolean) => void
  setCategories: (categories: Category[]) => void
  resetSelections: () => void
}

export const useGuitarStore = create<GuitarState>()((set, get) => ({
  userSelections: {},
  selectedOptionId: null,
  linkedSelections: {},
  expandedCategories: [],
  categories: [],
  woodSelections: {
    isBuckeyeBurlSelected: false,
    isFlamedMapleSelected: false,
    isMapleBurlSelected: false,
    isQuiltedMapleSelected: false,
    isPaulowniaSelected: false,
  },

  setSelection: (subcategoryId: number, optionId: number) => {
    set((state) => {
      const newSelections = { ...state.userSelections, [subcategoryId]: optionId }
      
      // Process rules to get auto-selections
      const { autoSelectedOptions } = processMenuRules(newSelections, state.woodSelections)
      
      // Apply auto-selections
      autoSelectedOptions.forEach(autoSelectId => {
        const category = state.categories.find(cat => 
          cat.subcategories.some(sub => 
            sub.options.some(opt => opt.id === autoSelectId)
          )
        )
        
        if (category) {
          const subcategory = category.subcategories.find(sub => 
            sub.options.some(opt => opt.id === autoSelectId)
          )
          
          if (subcategory) {
            newSelections[subcategory.id] = autoSelectId
          }
        }
      })
      
      return {
        userSelections: newSelections,
        selectedOptionId: optionId,
      }
    })
  },

  toggleCategory: (categoryId: string) => {
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(categoryId)
        ? state.expandedCategories.filter(id => id !== categoryId)
        : [...state.expandedCategories, categoryId]
    }))
  },

  setWoodSelection: (wood: keyof GuitarState['woodSelections'], value: boolean) => {
    set((state) => ({
      woodSelections: {
        ...state.woodSelections,
        [wood]: value,
        // Reset other wood selections when setting a new one
        ...(value ? {
          isBuckeyeBurlSelected: wood === 'isBuckeyeBurlSelected' ? value : false,
          isFlamedMapleSelected: wood === 'isFlamedMapleSelected' ? value : false,
          isMapleBurlSelected: wood === 'isMapleBurlSelected' ? value : false,
          isQuiltedMapleSelected: wood === 'isQuiltedMapleSelected' ? value : false,
          isPaulowniaSelected: wood === 'isPaulowniaSelected' ? value : false,
        } : {})
      }
    }))
  },

  setCategories: (categories: Category[]) => {
    set({ categories })
  },

  resetSelections: () => {
    set({
      userSelections: {},
      selectedOptionId: null,
      linkedSelections: {},
      expandedCategories: [],
      woodSelections: {
        isBuckeyeBurlSelected: false,
        isFlamedMapleSelected: false,
        isMapleBurlSelected: false,
        isQuiltedMapleSelected: false,
        isPaulowniaSelected: false,
      }
    })
  }
})) 