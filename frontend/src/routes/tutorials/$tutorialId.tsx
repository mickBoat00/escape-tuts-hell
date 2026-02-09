import ProcessingFlow from '@/components/ProcessingFlow';
import TutorialStatusCard from '@/components/TutorialInfoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteTutorial, getTutorial, retryContentGeneration } from '@/lib/api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { JobState, Tutorial } from '@/lib/types';
import { Tabs, TabsContent, TabsList } from '@radix-ui/react-tabs';
import DesktopTabTrigger from '@/components/DesktopTabTrigger';
import CodingChallengeTab from '@/components/tabs/CodingChallengeTab';
import QuestionAndAnwsers from '@/components/tabs/QuestionAndAnwsers';
import TabContentWrapper from '@/components/tabs/TabContentWrapper';
import { toast } from 'react-toastify';

export interface TabConfig {
  value: string;
  label: string;
}

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
  const [activeTab, setActiveTab] = useState('challenge');

  const [retryingJobs, setRetryingJobs] = useState<Record<string, boolean>>({
    challenge: false,
    qnas: false,
    summary: false,
  });

  const handleRetry = async (jobName: string) => {
    setRetryingJobs(prev => ({ ...prev, [jobName]: true }));
    try {
      await retryContentGeneration(tutorialId, jobName);
    } catch {
      toast.error('Failed to retry. Please try again.');
      setRetryingJobs(prev => ({ ...prev, [jobName]: false }));
    }
  };

  const fetchTutorial = async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      const data = await getTutorial(tutorialId);
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
      tutorial.status === 'completed' || tutorial.status === 'failed';

    if (isTerminal) return;

    const interval = setInterval(async () => {
      const updated = await fetchTutorial(false);
      if (updated?.status === 'completed' || updated?.status === 'failed') {
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

  const transcriptionStatus: JobState =
    tutorial.jobStatus?.transcription ?? 'pending';

  const generationStatus: JobState = (() => {
    const jobs = [
      tutorial.jobStatus.codingChallenge,
      tutorial.jobStatus.tutorialQA,
      tutorial.jobStatus.summary,
    ];

    if (jobs.includes('running')) return 'running';
    if (jobs.includes('failed')) return 'failed';
    if (jobs.every(j => j === 'completed')) return 'completed';
    return 'pending';
  })();

  const isProcessing =
    tutorial.status === 'uploading' || tutorial.status === 'processing';

  const isCompleted = tutorial.status === 'completed';
  const hasFailed = tutorial.status === 'failed';

  const isCodingTutorial =
    tutorial.codingTutorialCheck?.isCodingTutorial === true;

  const hasCodingCheckResult =
    tutorial.codingTutorialCheck !== null &&
    tutorial.codingTutorialCheck !== undefined;

  const showGenerating = isProcessing && generationStatus === 'running';

  const PROJECT_TABS: TabConfig[] = [
    { value: 'challenge', label: 'Coding Challenge' },
    { value: 'qnas', label: 'Question And Answers' },
    { value: 'retry', label: 'Stimulate Retry' },
  ];

  console.log('Tutorial', tutorial)

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{tutorial.fileName}</h1>

        <Button
          size="lg"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gradient-emerald text-white"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      </div>

      <div className="grid gap-6">
        <TutorialStatusCard tutorial={tutorial} />

        {isProcessing && (
          <ProcessingFlow
            transcriptionStatus={transcriptionStatus}
            generationStatus={generationStatus}
            fileDuration={tutorial.fileDuration}
            createdAt={tutorial.createdAt}
          />
        )}

        {isCompleted && hasCodingCheckResult && !isCodingTutorial && (
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-700">
                Not a Coding Tutorial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-amber-800">
                This video was analyzed successfully, but it is not a
                coding-related tutorial.
              </p>
              <p className="text-sm italic text-muted-foreground">
                Reason: {tutorial.codingTutorialCheck?.reason}
              </p>
            </CardContent>
          </Card>
        )}

        {(showGenerating || (isCompleted && isCodingTutorial)) && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="hidden lg:block mb-6">
              <TabsList className="flex gap-2">
                {PROJECT_TABS.map(tab => (
                  <DesktopTabTrigger
                    key={tab.value}
                    tab={tab}
                    tutorial={tutorial}
                  />
                ))}
              </TabsList>
            </div>

            <TabsContent value="challenge">
              <TabContentWrapper
                tutorialId={tutorialId}
                jobName="challenge"
                isLoading={showGenerating}
                error={tutorial.jobError?.codingChallenge}
                isRetrying={retryingJobs.challenge}
                onRetry={() => handleRetry('challenge')}
              >
                <CodingChallengeTab challenge={tutorial.codingChallenge} />
              </TabContentWrapper>
            </TabsContent>

            <TabsContent value="qnas">
              <TabContentWrapper
                tutorialId={tutorialId}
                jobName="qnas"
                isLoading={showGenerating}
                error={tutorial.jobError?.tutorialQA}
                isRetrying={retryingJobs.qnas}
                onRetry={() => handleRetry('qnas')}
              >
                <QuestionAndAnwsers quiz={tutorial.tutorialQA} />
              </TabContentWrapper>
            </TabsContent>
          </Tabs>
        )}

        {hasFailed && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Processing Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please try again or contact support.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default RouteComponent;
