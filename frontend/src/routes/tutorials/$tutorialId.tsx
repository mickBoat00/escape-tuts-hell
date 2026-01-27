import ProcessingFlow from '@/components/ProcessingFlow';
import TutorialStatusCard from '@/components/TutorialInfoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteTutorial, getTutorial } from '@/lib/api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PhaseStatus, Tutorial } from '@/lib/types';
import { Tabs, TabsContent, TabsList, } from '@radix-ui/react-tabs';
import DesktopTabTrigger from '@/components/DesktopTabTrigger';
import { Skeleton } from '@/components/ui/skeleton';
// import ErrorRetryCard from '@/components/ErrorRetryCard';
import CodingChallengeTab from '@/components/tabs/CodingChallengeTab';
import QuestionAndAnwsers from '@/components/tabs/QuestionAndAnwsers';


export interface TabConfig {
  value: string;
  label: string;
  // errorKey?: string;
  // feature?: FeatureName;
}

export const Route = createFileRoute('/tutorials/$tutorialId')({
  component: RouteComponent,
});

 function TabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { tutorialId } = Route.useParams();
  const navigate = useNavigate();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("challenge");

  const fetchTutorial = async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);

      const data = await getTutorial(tutorialId);
      console.log('tutorial obj', data)
      setTutorial(data);
      setError(null);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutorial');
      return null;
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorial(true);
  }, [tutorialId]);

  useEffect(() => {
    if (!tutorial) return;

    const isTerminal =
      tutorial.status === 'completed' ||
      tutorial.status === 'failed';

    if (isTerminal) return;

    const interval = setInterval(async () => {
      const updated = await fetchTutorial(false);

      if (
        updated?.status === 'completed' ||
        updated?.status === 'failed'
      ) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tutorialId, tutorial?.status]);

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
    } catch {
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

  if (!tutorial) return null;

  const transcriptionStatus: PhaseStatus =
    tutorial.jobStatus?.transcription ?? 'pending';
    const generationStatus: PhaseStatus = (() => {
      if (!tutorial.jobStatus) return "pending";

      const statuses = Object.values(tutorial.jobStatus);

      if (statuses.includes("running")) return "running";
      if (statuses.includes("failed")) return "failed";
      if (statuses.every(s => s === "completed")) return "completed";

      return "pending";
    })();


  const isProcessing = tutorial.status === "processing";
  const isCompleted = tutorial.status === "completed";
  const hasFailed = tutorial.status === "failed";
  const showGenerating = isProcessing && generationStatus === "running";
  
  
  const PROJECT_TABS: TabConfig[] = [
    {
      value: "challenge",
      label: "Coding Challenge",
    },

    {
      value: "qnas",
      label: "Question And Answers",
    },

  ];
    

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold wrap-break-word">
            {tutorial.fileName}
          </h1>
        </div>

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

      <div className="grid gap-6">
        <TutorialStatusCard tutorial={tutorial} />

        {
          isProcessing && (
            <ProcessingFlow
              transcriptionStatus={transcriptionStatus}
              generationStatus={generationStatus}
              fileDuration={tutorial.fileDuration}
              createdAt={tutorial.createdAt}
            />
          )
        }

        {hasFailed && tutorial.error && (
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

        {
          (showGenerating || isCompleted) && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >

              {/* Desktop Tabs */}
              <div className="glass-card rounded-2xl p-2 mb-6 hidden lg:block">
                <TabsList className="flex flex-wrap gap-2 bg-transparent min-w-max w-full">
                  {PROJECT_TABS.map((tab) => (
                    <DesktopTabTrigger
                      key={tab.value}
                      tab={tab}
                      tutorial={tutorial}
                    />
                  ))}
                </TabsList>
              </div>

              <TabsContent value="challenge" className="space-y-4">
                {showGenerating && (<TabSkeleton />)} 
                <CodingChallengeTab challenge={tutorial.codingChallenge}/>
                {/* <CodingChallengeTab/> */}
              </TabsContent>

              <TabsContent value="qnas" className="space-y-4">
                {showGenerating && (<TabSkeleton />)} 
                {/* <QuestionAndAnwsers quiz={tutorial.tutorialQA} /> */}
                <QuestionAndAnwsers/>
              </TabsContent>

            </Tabs>
          )
        }



      </div>
    </div>
  );
}

export default RouteComponent;
