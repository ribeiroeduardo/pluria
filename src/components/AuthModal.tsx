import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, LogIn, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black border border-zinc-800 text-white">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-zinc-400 hover:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader>
          <DialogTitle className="text-white">Sign In Required</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Please sign in with your Google account to save your guitar build.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignIn}
            disabled={loading}
            className={cn(
              "border-zinc-700 hover:bg-zinc-800 hover:text-white",
              "flex items-center justify-center w-full max-w-xs"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In with Google
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 