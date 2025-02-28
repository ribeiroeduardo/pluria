
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, vi, beforeEach } from 'vitest'
import { Menu } from '../../components/Menu'

// Mock the context hook
vi.mock('@/contexts/GuitarConfigContext', () => ({
  useGuitarConfig: () => ({
    configuration: { selectedOptions: new Map(), totalPrice: 0, isValid: true, errors: [] },
    loading: true,
    error: null,
    categories: [],
    subcategories: [],
    getConfigurationErrors: () => [],
    getSubcategoryOptions: () => [],
    setOption: vi.fn(),
    isOptionHidden: () => false
  })
}))

// Mock the tanstack query hook
vi.mock('@tanstack/react-query', async () => {
  return {
    QueryClient: vi.fn(),
    QueryClientProvider: vi.fn(),
    useQuery: vi.fn(() => ({
      isLoading: true,
      data: null,
      error: null,
    })),
  }
})

describe('Menu Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  const renderMenu = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Menu />
      </QueryClientProvider>
    )
  }

  it('displays loading state when fetching data', () => {
    renderMenu()
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument()
  })
})
