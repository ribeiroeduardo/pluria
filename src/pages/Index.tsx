// Suppress console logs
const originalLog = console.log;
console.log = (...args: any[]) => {
  const suppressedMessages = [
    'Download the React DevTools',
    'Download the Vue Devtools extension',
    'You are running Vue in development mode',
  ];
  const shouldSuppress = suppressedMessages.some((message) =>
    args[0] && args[0].includes(message)
  );
  if (!shouldSuppress) {
    originalLog(...args);
  }
};

import React from 'react';
import { Menu } from '@/components/Menu';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useGuitarStore } from '@/store/useGuitarStore';

const Index = () => {
  const { hasInitialized } = useGuitarStore();
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (hasInitialized) {
      setIsInitialLoad(false);
      return;
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 10, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hasInitialized]);

  return (
    <div className="flex flex-row h-screen">
      <Menu />
      <div className="flex-1 relative">
        {isInitialLoad ? (
          <LoadingScreen loadingProgress={loadingProgress} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>Guitar preview has been removed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
