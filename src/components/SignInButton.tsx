import React from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SignInButtonProps {
  className?: string
}

export function SignInButton({ className }: SignInButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out',
          variant: 'default'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={user ? handleSignOut : handleSignIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {user ? 'Signing out...' : 'Signing in...'}
        </>
      ) : user ? (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In with Google
        </>
      )}
    </Button>
  )
} 