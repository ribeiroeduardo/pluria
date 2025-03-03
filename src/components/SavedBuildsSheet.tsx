import React, { useState, useEffect } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, X, LogOut, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { ScrollArea } from '@/components/ui/scroll-area'
import html2canvas from 'html2canvas'
import { processImageLayers } from '@/utils/configurationUtils'
import { ImageLayer } from '@/types/guitar'

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
  const [downloadingBuildId, setDownloadingBuildId] = useState<number | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const canvasRef = React.useRef<HTMLDivElement>(null)

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
    // Prevent multiple simultaneous loads
    if (loadingBuildId !== null) {
      console.log('Already loading a build, ignoring request');
      return;
    }
    
    console.log('Starting to load build:', build.title || 'Untitled Build', build);
    setLoadingBuildId(build.id);
    
    // Safety timeout to ensure loading state is reset even if something goes wrong
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout triggered - resetting loading state');
      setLoadingBuildId(null);
      toast({
        title: 'Loading Timeout',
        description: 'Loading took too long and was cancelled. Please try again.',
        variant: 'destructive'
      });
    }, 20000); // 20 seconds safety timeout
    
    try {
      // Add timeout to prevent infinite loading
      const loadBuildPromise = loadBuild(build);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timed out after 15 seconds')), 15000)
      );
      
      // Race between the load operation and the timeout
      const result = await Promise.race([loadBuildPromise, timeoutPromise]) as any;
      
      console.log('Load build result:', result);
      
      if (result.success) {
        // Close the sheet immediately when build is loaded successfully
        onClose(); // Close the sheet
      } else {
        console.error('Failed to load build:', result.error);
        toast({
          title: 'Error Loading Build',
          description: result.error || 'Failed to load build',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Exception in handleLoadBuild:', error);
      toast({
        title: 'Error Loading Build',
        description: error.message || 'Failed to load build',
        variant: 'destructive'
      });
    } finally {
      // Clear the safety timeout since we're done
      clearTimeout(safetyTimeout);
      console.log('Resetting loading state');
      setLoadingBuildId(null);
    }
  };

  const handleDownloadBuild = async (e: React.MouseEvent, build: any) => {
    // Prevent the click from bubbling up to the parent (which would load the build)
    e.stopPropagation();
    
    if (!user) return;
    
    setDownloadingBuildId(build.id);
    
    try {
      // Get the build configuration
      console.log('Preparing to download build:', build.title || 'Untitled Build');
      console.log('Build data:', build);
      
      // Define the target dimensions with 5% margin
      const targetWidth = 1080;
      const targetHeight = 1920;
      const margin = 0.05; // 5% margin
      const contentWidth = targetWidth * (1 - 2 * margin); // Width minus margins
      const contentHeight = targetHeight * (1 - 2 * margin); // Height minus margins
      
      // Create a temporary container for rendering the guitar
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = `${targetWidth}px`;
      container.style.height = `${targetHeight}px`;
      container.style.backgroundColor = 'transparent';
      
      // Create a wrapper to maintain aspect ratio and center content with margin
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = `${targetHeight * margin}px`;
      wrapper.style.left = `${targetWidth * margin}px`;
      wrapper.style.width = `${contentWidth}px`;
      wrapper.style.height = `${contentHeight}px`;
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      
      container.appendChild(wrapper);
      document.body.appendChild(container);
      
      // We need to load the build first to get the configuration
      // This is a simplified version of loadBuild that doesn't update the UI
      const { data: optionsData } = await supabase
        .from('options')
        .select('*')
        .order('zindex');
      
      if (!optionsData) {
        throw new Error('Failed to load options data');
      }
      
      // Create a map of selected options
      const selectedOptions = new Map();
      
      // Process each field in the build that corresponds to a subcategory
      const subcategoryFields = [
        'body_color', 'body_wood', 'top_wood', 'top_color', 'burst', 'top_coat',
        'neck_wood', 'fretboard_wood', 'inlays', 'nut', 'frets', 'neck_construction',
        'side_dots', 'neck_reinforcements', 'neck_profile', 'fretboard_radius',
        'headstock_angle', 'bridge', 'tuners', 'hardware_color', 'pickups',
        'knobs', 'switch', 'pickups_finish', 'pickups_customization', 'plates',
        'strings', 'scale_length', 'case_type'
      ];
      
      // For each field that has a value, find the corresponding option
      for (const field of subcategoryFields) {
        const optionId = build[field];
        if (optionId) {
          // Find the option in the options data
          const option = optionsData.find(opt => opt.id.toString() === optionId.toString());
          if (option) {
            // Add the option to the selected options map using the subcategory ID as the key
            selectedOptions.set(option.id_related_subcategory, option);
          }
        }
      }
      
      console.log('Created selectedOptions map with size:', selectedOptions.size);
      
      // Process image layers for the front view
      const imageLayers = processImageLayers(selectedOptions, 'front');
      console.log('Generated image layers:', imageLayers.length);
      
      if (imageLayers.length === 0) {
        throw new Error('No image layers generated. The design may be incomplete.');
      }
      
      // Create a container for the guitar layers that will maintain aspect ratio
      const guitarContainer = document.createElement('div');
      guitarContainer.style.position = 'relative';
      guitarContainer.style.width = '100%';
      guitarContainer.style.height = '100%';
      guitarContainer.style.display = 'flex';
      guitarContainer.style.alignItems = 'center';
      guitarContainer.style.justifyContent = 'center';
      wrapper.appendChild(guitarContainer);
      
      // Create and append image elements for each layer
      const layerPromises = imageLayers.map((layer, index) => {
        return new Promise<void>((resolve, reject) => {
          if (!layer.url) {
            resolve();
            return;
          }
          
          const img = document.createElement('img');
          img.src = layer.url;
          img.alt = `Layer ${layer.optionId}`;
          img.style.position = 'absolute';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain'; // Maintain aspect ratio
          img.style.zIndex = layer.zIndex.toString();
          
          if (layer.mixBlendMode) {
            img.style.mixBlendMode = layer.mixBlendMode;
          }
          
          if (layer.opacity !== undefined) {
            img.style.opacity = layer.opacity.toString();
          }
          
          img.onload = () => resolve();
          img.onerror = () => {
            console.error(`Failed to load image: ${layer.url}`);
            resolve(); // Continue even if one image fails
          };
          
          guitarContainer.appendChild(img);
        });
      });
      
      // Add shadow lighting layer
      const shadowPromise = new Promise<void>((resolve) => {
        const shadowImg = document.createElement('img');
        shadowImg.src = '/images/omni-lighting-sombra-corpo.png';
        shadowImg.alt = 'Shadow lighting effect';
        shadowImg.style.position = 'absolute';
        shadowImg.style.maxWidth = '100%';
        shadowImg.style.maxHeight = '100%';
        shadowImg.style.objectFit = 'contain';
        shadowImg.style.zIndex = '998';
        shadowImg.style.mixBlendMode = 'multiply';
        shadowImg.style.opacity = '0.7';
        
        shadowImg.onload = () => resolve();
        shadowImg.onerror = () => {
          console.error('Failed to load shadow image');
          resolve(); // Continue even if shadow fails
        };
        
        guitarContainer.appendChild(shadowImg);
      });
      
      // Wait for all images to load
      await Promise.all([...layerPromises, shadowPromise]);
      
      // Small delay to ensure all images are rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas to capture the container
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: 1, // Use scale 1 to ensure exact pixel dimensions
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: targetWidth,
        height: targetHeight,
        imageTimeout: 0, // No timeout for image loading
      });
      
      // Create a new canvas with the exact dimensions we want
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        // Draw the captured canvas onto our final canvas to ensure exact dimensions
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      }
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${build.title || 'Guitar-Design'}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      document.body.removeChild(container);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Design Downloaded',
        description: 'Your design has been downloaded as a PNG image',
      });
    } catch (error: any) {
      console.error('Error downloading build:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download design',
        variant: 'destructive'
      });
    } finally {
      setDownloadingBuildId(null);
    }
  };

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

  const handleSignOut = async () => {
    setIsLoggingOut(true)
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
        onClose() // Close the sheet after successful logout
      }
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoggingOut(false)
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
          "flex flex-col bg-black border-t border-zinc-800 text-white p-0 gap-0",
          isMobile ? "w-full h-[100dvh]" : "left-0 w-[35%] h-[100vh]"
        )}
      >
        {/* Header - Fixed */}
        <div className="flex-none p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg">My Designs</SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
          <SheetDescription className="text-zinc-400">
          </SheetDescription>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-grow px-6 py-4 h-full">
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
                  onClick={() => loadingBuildId === null && deletingBuildId === null && downloadingBuildId === null && handleLoadBuild(build)}
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
                    
                    <div className="flex space-x-2">
                      {/* Download Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDownloadBuild(e, build)}
                        disabled={downloadingBuildId === build.id || deletingBuildId !== null || loadingBuildId !== null}
                        className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        title="Download design as image"
                      >
                        {downloadingBuildId === build.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleDeleteBuild(e, build.id)}
                        disabled={deletingBuildId === build.id || loadingBuildId !== null || downloadingBuildId !== null}
                        className="border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        title="Delete design"
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
        
        {/* Fixed Logout Button at Bottom */}
        <div className="flex-none p-4 border-t border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-700"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 