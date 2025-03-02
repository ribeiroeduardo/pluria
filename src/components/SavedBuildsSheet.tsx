import React, { useState, useEffect } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SavedBuildsSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function SavedBuildsSheet({ isOpen, onClose }: SavedBuildsSheetProps) {
  const { getUserBuilds, loadBuild } = useGuitarConfig()
  const { user } = useAuth()
  const { toast } = useToast()
  const { currentCurrency, convertPrice } = useCurrency()
  const isMobile = useIsMobile()
  
  const [builds, setBuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBuildId, setLoadingBuildId] = useState<number | null>(null)
  const [deletingBuildId, setDeletingBuildId] = useState<number | null>(null)

  // Fetch user builds when the sheet opens
  useEffect(() => {
    if (isOpen && user) {
      fetchBuilds()
    }
  }, [isOpen, user])

  const fetchBuilds = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userBuilds = await getUserBuilds(user.id)
      setBuilds(userBuilds)
    } catch (error) {
      console.error('Error fetching builds:', error)
      toast({
        title: 'Error',
        description: 'Failed to load your saved builds',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadBuild = async (build: any) => {
    setLoadingBuildId(build.id)
    try {
      const result = await loadBuild(build)
      
      if (result.success) {
        toast({
          title: 'Build Loaded',
          description: 'Your saved build has been loaded successfully',
        })
        onClose() // Close the sheet
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load build',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load build',
        variant: 'destructive'
      })
    } finally {
      setLoadingBuildId(null)
    }
  }

  const handleDeleteBuild = async (e: React.MouseEvent, buildId: number) => {
    // Prevent the click from bubbling up to the parent (which would load the build)
    e.stopPropagation()
    
    if (!user) return
    
    setDeletingBuildId(buildId)
    try {
      const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', buildId)
        .eq('id_user', user.id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Update the local state
      setBuilds(builds.filter(build => build.id !== buildId))
      
      toast({
        title: 'Build Deleted',
        description: 'Your saved build has been deleted',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete build',
        variant: 'destructive'
      })
    } finally {
      setDeletingBuildId(null)
    }
  }

  const formatPrice = (price: number) => {
    const currencySymbol = currentCurrency === 'USD' ? '$' : 'R$'
    return `${currencySymbol}${price.toLocaleString(currentCurrency === 'USD' ? 'en-US' : 'pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MMM dd, yyyy - HH:mm:ss')
    } catch (e) {
      return 'Unknown date'
    }
  }

  // Generate a summary of key specs for a build
  const getBuildSummary = (build: any) => {
    const specs = []
    
    if (build.body_wood) specs.push(build.body_wood)
    if (build.neck_wood) specs.push(`${build.neck_wood} Neck`)
    if (build.pickups) specs.push(build.pickups)
    
    return specs.join(', ') || 'Custom Build'
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "flex flex-col h-[80vh] bg-black border-t border-zinc-800 text-white p-0",
          isMobile ? "w-full" : "left-0 w-[35%] rounded-t-xl"
        )}
      >
        {/* Header - Fixed */}
        <div className="flex-none p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="text-white text-xl">My Saved Builds</SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <SheetDescription className="text-zinc-400">
            Click on a build to load it into the guitar configurator
          </SheetDescription>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-grow px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : builds.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p>You haven't saved any builds yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {builds.map(build => (
                <div 
                  key={build.id} 
                  className={cn(
                    "border border-zinc-800 rounded-lg p-4 relative",
                    "hover:bg-zinc-900 transition-colors cursor-pointer",
                    loadingBuildId === build.id && "opacity-70"
                  )}
                  onClick={() => loadingBuildId === null && deletingBuildId === null && handleLoadBuild(build)}
                >
                  {loadingBuildId === build.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">
                        {build.title || 'Untitled Build'}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {formatDate(build.created_at || build.updated_at)}
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        {formatPrice(build.preco || 0)}
                      </p>
                    </div>
                    
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDeleteBuild(e, build.id)}
                        disabled={deletingBuildId === build.id || loadingBuildId !== null}
                        className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
                      >
                        {deletingBuildId === build.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 