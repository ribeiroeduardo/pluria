import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  loadingProgress: number;
}

export const LoadingScreen = ({ loadingProgress }: LoadingScreenProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 gap-4">
      <Progress value={loadingProgress} className="w-[60%] max-w-md" />
      <p className="text-sm text-muted-foreground">Loading guitar customizer...</p>
    </div>
  );
};