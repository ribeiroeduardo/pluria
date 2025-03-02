import React, { useState, useEffect } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2, X, Trash2, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface SavedBuildsSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function SavedBuildsSheet({ isOpen, onClose }: SavedBuildsSheetProps) {
  const { getUserBuilds, loadBuild } = useGuitarConfig()
  const { user } = useAuth()
  const { toast } = useToast()
  const { currentCurrency, convertPrice } = useCurrency()
  
  const [builds, setBuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBuildId, setLoadingBuildId] = useState<number | null>(null)
  const [deletingBuildId, setDeletingBuildId] = useState<number | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedBuild, setSelectedBuild] = useState<any>(null)

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

  const handleLoadBuild = (build: any) => {
    setSelectedBuild(build)
    setConfirmDialogOpen(true)
  }

  const confirmLoadBuild = async () => {
    if (!selectedBuild) return
    
    setLoadingBuildId(selectedBuild.id)
    try {
      const result = await loadBuild(selectedBuild)
      
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
      setConfirmDialogOpen(false)
    }
  }

  const handleDeleteBuild = async (buildId: number) => {
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
      return formatDistanceToNow(date, { addSuffix: true })
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
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>My Saved Builds</SheetTitle>
            <SheetDescription>
              View and load your previously saved guitar configurations
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : builds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't saved any builds yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {builds.map(build => (
                  <div 
                    key={build.id} 
                    className="border rounded-lg p-4 relative hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {build.title || 'Untitled Build'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getBuildSummary(build)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(build.created_at || build.updated_at)}
                        </p>
                        <p className="mt-2 font-semibold">
                          {formatPrice(build.preco || 0)}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteBuild(build.id)}
                          disabled={deletingBuildId === build.id}
                        >
                          {deletingBuildId === build.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => handleLoadBuild(build)}
                          disabled={loadingBuildId === build.id}
                        >
                          {loadingBuildId === build.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <SheetClose asChild>
            <Button 
              variant="outline" 
              className="mt-4 w-full"
            >
              Close
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Saved Build</AlertDialogTitle>
            <AlertDialogDescription>
              Loading this build will replace your current configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLoadBuild}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 