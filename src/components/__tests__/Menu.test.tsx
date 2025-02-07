
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, vi, beforeEach } from 'vitest'
import { Menu } from '../../components/Menu'
import type { Option } from '@/types/guitar'

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
    const mockProps = {
      onOptionSelect: (option: Option) => {},
      onInitialData: (options: Option[]) => {}
    }
    
    return render(
      <QueryClientProvider client={queryClient}>
        <Menu {...mockProps} />
      </QueryClientProvider>
    )
  }

  it('displays loading state when fetching data', () => {
    renderMenu()
    expect(screen.getByText('Loading menu...')).toBeInTheDocument()
  })
})
