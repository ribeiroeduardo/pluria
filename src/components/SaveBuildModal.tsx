import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'

interface SaveBuildModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string) => Promise<void>
  isSaving: boolean
}

export function SaveBuildModal({ isOpen, onClose, onSave, isSaving }: SaveBuildModalProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()
  const { saveBuild, isConfigurationSaved } = useGuitarConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Please enter a name for your build')
      return
    }
    
    try {
      await onSave(title.trim())
      setTitle('')
      setError('')
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const handleClose = () => {
    setTitle('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black border border-zinc-800 text-white">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-zinc-400 hover:text-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Save Your Build</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Give your guitar build a name so you can easily identify it later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="build-title" className="block mb-2 text-zinc-300">
              Build Name
            </Label>
            <Input
              id="build-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              placeholder="e.g., My Dream Guitar, Blues Special, etc."
              className={cn(
                "w-full bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500",
                "focus-visible:ring-zinc-700 focus-visible:border-zinc-700"
              )}
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isSaving}
              className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={isSaving || !title.trim() || isConfigurationSaved}
              className="bg-zinc-100 text-black hover:bg-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isConfigurationSaved ? 'Build Saved' : 'Save Build'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 