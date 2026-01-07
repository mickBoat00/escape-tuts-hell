import ProcessingFlow from '@/components/ProcessingFlow';
import TutorialStatusCard from '@/components/TutorialStatusCard';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router'
import { Edit2, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react';

export const Route = createFileRoute('/tutorials/$tutorialId')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Tutorial? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    setTimeout(() => {
      setIsDeleting(false)
    }, 3000)

  };

  return <>
    <div className="container max-w-6xl mx-auto py-10 px-4 ">
      {/* Header with title and actions */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold wrap-break-word">
                Programming with python.mp4
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
        <TutorialStatusCard/>

        <ProcessingFlow />

          {/* <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is not a coding tutorial</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Failed at: Verify coding tutorial step
                  </p>
              </CardContent>
            </Card> */}
      </div>
    </div>
  </>
}
