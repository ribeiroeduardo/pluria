import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, vi, beforeEach } from 'vitest'
import { Menu } from '../../components/Menu'

// Mock the tanstack query hook using async importOriginal
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
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
    expect(screen.getByText('Loading menu...')).toBeInTheDocument()
  })
})
