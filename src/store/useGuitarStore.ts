import { create } from 'zustand'
import { Option } from '@/types/guitar'
import { type Category } from '@/utils/menuUtils'
import { getAutoselectedOptions } from '@/utils/ruleProcessor'

interface Selection {
  optionId: number
  timestamp: number
}

interface GuitarState {
  userSelections: Record<number, Selection>
  selectedOptionId: number | null
  linkedSelections: Record<number, number>
  expandedCategories: string[]
  categories: Category[]
  hasInitialized: boolean
  setSelection: (subcategoryId: number, optionId: number, skipAutoselect?: boolean) => void
  toggleCategory: (categoryId: string) => void
  setCategories: (categories: Category[]) => void
  setHasInitialized: (value: boolean) => void
  resetSelections: () => void
}

export const useGuitarStore = create<GuitarState>((set, get) => ({
  userSelections: {},
  selectedOptionId: null,
  linkedSelections: {},
  expandedCategories: [],
  categories: [],
  hasInitialized: false,

  setSelection: (subcategoryId: number, optionId: number, skipAutoselect = false) => {
    set((state) => {
      const newSelections = {
        ...state.userSelections,
        [subcategoryId]: {
          optionId,
          timestamp: Date.now()
        }
      };

      if (!skipAutoselect) {
        const autoselectedOptionIds = getAutoselectedOptions(newSelections);
        autoselectedOptionIds.forEach(optionId => {
          // Find the subcategory for this option
          const subcategory = state.categories
            .flatMap(cat => cat.subcategories)
            .find(sub => sub.options.some(opt => opt.id === optionId));

          if (subcategory) {
            newSelections[subcategory.id] = {
              optionId,
              timestamp: Date.now()
            };
          }
        });
      }

      return {
        userSelections: newSelections,
        selectedOptionId: optionId
      };
    });
  },

  toggleCategory: (categoryId: string) => {
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(categoryId)
        ? state.expandedCategories.filter(id => id !== categoryId)
        : [...state.expandedCategories, categoryId]
    }));
  },

  setCategories: (categories: Category[]) => {
    set({ categories });
  },

  setHasInitialized: (value: boolean) => {
    set({ hasInitialized: value });
  },

  resetSelections: () => {
    set({ userSelections: {}, selectedOptionId: null });
  }
})); 