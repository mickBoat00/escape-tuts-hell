import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';


interface ErrorRetryCardProps {
  tutorialId: string
  job: string;
  errorMessage: string;
  isRetrying: boolean;
  onRetry: () => void;
}


const ErrorRetryCard = ({
  tutorialId,
  job,
  onRetry,
  isRetrying,
  errorMessage,
}: ErrorRetryCardProps) => {

  console.log(tutorialId)
  console.log(job)

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Generation Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button
          onClick={onRetry} 
          disabled={isRetrying}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
          />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ErrorRetryCard
