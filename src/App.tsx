import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GuitarConfigProvider } from '@/contexts/GuitarConfigContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { Menu } from '@/components/Menu'
import { GuitarPreview } from '@/components/GuitarPreview'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: false
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <GuitarConfigProvider>
          <main className="fixed inset-0 flex bg-black">
            <div className="w-[35%] border-r border-zinc-800">
              <Menu />
            </div>
            <div className="flex-1">
              <GuitarPreview />
            </div>
          </main>
        </GuitarConfigProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  )
}

export default App
