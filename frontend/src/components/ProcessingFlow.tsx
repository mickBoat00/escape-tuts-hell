import { useCallback, useEffect, useMemo, useState } from 'react'
import PhaseCard from './PhaseCard'
import { ChevronDown, FileText } from 'lucide-react'
import type { PhaseStatus } from '@/lib/types';
import { estimateAssemblyAITime, formatTimeRange } from '@/lib/processing-time';

interface ProcessingFlowProps {
  transcriptionStatus: PhaseStatus;
  fileDuration?: number;
  createdAt: string;
}


const ProcessingFlow = ({
  transcriptionStatus,
  fileDuration,
  createdAt,
}: ProcessingFlowProps) => {

    const [transcriptionProgress, setTranscriptionProgress] = useState(0);

    const isTranscribing = transcriptionStatus === "running";
    const transcriptionComplete = transcriptionStatus === "completed";
    const transcriptionInProgress =
        transcriptionStatus === "pending" || transcriptionStatus === "running";


    const getTranscriptionDescription = useCallback(() => {
        if (isTranscribing) return "AI is analyzing your tutorial...";
        if (transcriptionComplete) return "Analysis complete!";
        return "Preparing analysis...";
    }, [isTranscribing, transcriptionComplete]);

    const timeEstimate = useMemo(
        () => estimateAssemblyAITime(fileDuration),
        [fileDuration],
    );

    const timeRangeText = useMemo(
        () => formatTimeRange(timeEstimate.bestCase, timeEstimate.conservative),
        [timeEstimate.bestCase, timeEstimate.conservative],
    );

    useEffect(() => {
        if (!isTranscribing) {
        setTranscriptionProgress(0);
        return;
        }

        const updateProgress = () => {
        const elapsedSeconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
        const progress = (elapsedSeconds / timeEstimate.conservative) * 100;
        setTranscriptionProgress(Math.min(95, progress));
        };

        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [isTranscribing, createdAt, timeEstimate.conservative]);


  return (
    <div className="space-y-6">
        <PhaseCard  
            icon={FileText}
            title="Phase 1: AI Analysis"
            description={getTranscriptionDescription()}
            status={transcriptionStatus}
            isActive={isTranscribing}
            progress={isTranscribing ? transcriptionProgress : undefined}
            timeEstimate={transcriptionInProgress ? timeRangeText : undefined}
        />

        <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-16 bg-border" />
                    <ChevronDown className="h-5 w-5" />
                <div className="h-px w-16 bg-border" />
            </div>
        </div>

        {/* <PhaseCard
            icon={Sparkles}
            title="Phase 2: AI Generation"
            description={"Generation different content from transcript"}
            status={"running"}
            isActive={true}
        >

            <div className="space-y-3 pt-2">

                <FeatureItem
                  name={"Q&As"}
                  description={"Question and Answers"}
                  icon={FileText}
                  isActive={true}
                />

                <FeatureItem
                  name={"Q&As"}
                  description={"Question and Answers"}
                  icon={FileText}
                  isActive={true}
                />


                <FeatureItem
                  name={"Q&As"}
                  description={"Question and Answers"}
                  icon={FileText}
                  isActive={false}
                />

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 text-center mt-6 border-2 border-emerald-200 shadow-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold text-emerald-600 text-base">
                        Using AWS Step functions
                        </span>{" "}
                        — AI is generating {3} output
                        {3 > 1 ? "s" : ""} simultaneously
                    </p>
                </div>

            </div>


            <div className="flex flex-wrap items-center gap-3 pt-4">
                <Badge
                    className="text-sm px-4 py-2 gradient-emerald text-white shadow-md"
                >
                    Summary
                </Badge>

                <Badge
                    className="text-sm px-4 py-2 gradient-emerald text-white shadow-md"
                >
                    Summary
                </Badge>


                <Badge
                    className="text-sm px-4 py-2 gradient-emerald text-white shadow-md"
                >
                    Summary
                </Badge>

            </div>
        </PhaseCard> */}

        
    </div>
  )
}

export default ProcessingFlow
