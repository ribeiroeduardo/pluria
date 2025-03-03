import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        console.log('[DEBUG-AUTH] Checking for existing user session');
        const { data } = await supabase.auth.getUser()
        console.log('[DEBUG-AUTH] User session check result:', data.user ? `User found: ${data.user.email}` : 'No user found');
        setUser(data.user)
      } catch (error) {
        console.error('[DEBUG-AUTH] Error checking auth status:', error)
      } finally {
        console.log('[DEBUG-AUTH] Auth loading complete');
        setLoading(false)
      }
    }

    checkUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[DEBUG-AUTH] Auth state changed: ${event}`, session ? `User: ${session.user?.email}` : 'No session');
      setUser(session?.user || null)
      setLoading(false)
    })

    // Clean up subscription
    return () => {
      console.log('[DEBUG-AUTH] Cleaning up auth listener');
      authListener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 