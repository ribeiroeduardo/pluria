import { useCallback } from 'react'
import { Option } from '@/types/guitar'
import { useGuitarStore } from '@/store/useGuitarStore'
import {
  PAIRED_OPTIONS,
  isHardwareColor,
  getHardwareComponentIds,
  HARDWARE_COLOR
} from '@/utils/menuUtils'

interface UsePreviewUpdatesProps {
  onOptionSelect: (option: Option) => void
  options: Option[]
}

export function usePreviewUpdates({ onOptionSelect, options }: UsePreviewUpdatesProps) {
  const { userSelections } = useGuitarStore()

  const findOptionById = useCallback((optionId: number) => {
    return options.find(opt => opt.id === optionId)
  }, [options])

  const getCurrentStringCount = useCallback((): '6' | '7' | null => {
    const sixStringsOption = options.find(opt => opt.strings === '6' && userSelections[opt.id_related_subcategory] === opt.id)
    const sevenStringsOption = options.find(opt => opt.strings === '7' && userSelections[opt.id_related_subcategory] === opt.id)
    
    if (sixStringsOption) return '6'
    if (sevenStringsOption) return '7'
    return null
  }, [options, userSelections])

  const updatePreview = useCallback((primaryOptionId: number) => {
    const primaryOption = findOptionById(primaryOptionId)
    if (!primaryOption) return

    // Update primary option in preview
    onOptionSelect(primaryOption)

    // Handle hardware color selection
    if (isHardwareColor(primaryOptionId)) {
      const stringCount = getCurrentStringCount()
      if (!stringCount) return

      const componentIds = getHardwareComponentIds(primaryOptionId, stringCount, userSelections)
      
      // Update each hardware component in preview
      componentIds.forEach(componentId => {
        const option = findOptionById(componentId)
        if (option) {
          onOptionSelect(option)
        }
      })
    }

    // Handle paired options
    const pairedOptionId = PAIRED_OPTIONS[primaryOptionId]
    if (pairedOptionId) {
      const pairedOption = findOptionById(pairedOptionId)
      if (pairedOption) {
        onOptionSelect(pairedOption)
      }
    }
  }, [findOptionById, getCurrentStringCount, onOptionSelect, userSelections])

  return { updatePreview }
} 