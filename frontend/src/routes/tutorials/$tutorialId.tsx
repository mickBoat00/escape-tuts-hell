import ProcessingFlow from '@/components/ProcessingFlow';
import TutorialStatusCard from '@/components/TutorialInfoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteTutorial, getTutorial } from '@/lib/api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Tutorial } from '@/lib/types';

export const Route = createFileRoute('/tutorials/$tutorialId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { tutorialId } = Route.useParams();
  const navigate = useNavigate();
  
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTutorial(tutorialId);
        setTutorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tutorial');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorial();
  }, [tutorialId]);

  const handleDelete = async () => {
    if (!tutorial) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this Tutorial? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteTutorial(tutorialId);
      navigate({ to: '/tutorials' }); 
    } catch (err) {
      alert('Failed to delete tutorial. Please try again.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600 mb-4" />
            <p className="text-gray-600">Loading tutorial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-10 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => navigate({ to: '/tutorials' })} 
              className="mt-4"
              variant="outline"
            >
              Back to Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tutorial) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      {/* Header with title and actions */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold wrap-break-word">
              {tutorial.fileName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gradient-emerald text-white hover-glow px-6 transition-all"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            <span className="font-semibold">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <TutorialStatusCard tutorial={tutorial} />

        <ProcessingFlow />

        {tutorial.status === 'failed' && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Processing failed</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try uploading again or contact support if the issue persists.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}