import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ message, onRetry, retryLabel = "Retry", className }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center ${className ?? ""}`}>
      <AlertCircle className="h-6 w-6 text-destructive" />
      <p className="max-w-sm text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RotateCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
