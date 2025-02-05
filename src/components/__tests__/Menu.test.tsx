import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, vi, beforeEach } from 'vitest'
import { Menu } from '../../components/Menu'
import type { Option } from '@/types/menu'

// Mock the tanstack query hook
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    isLoading: true,
    data: null,
    error: null,
  })),
}))

describe('Menu Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  const mockOptionSelect = (option: Option) => {
    // Mock implementation
  }

  const mockInitialData = (options: Option[]) => {
    // Mock implementation
  }

  const renderMenu = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Menu 
          onOptionSelect={mockOptionSelect}
          onInitialData={mockInitialData}
        />
      </QueryClientProvider>
    )
  }

  it('displays loading state when fetching data', () => {
    renderMenu()
    expect(screen.getByText('Loading menu...')).toBeInTheDocument()
  })
})