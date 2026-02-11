import { useCallback, useEffect, useMemo, useState } from 'react'
import PhaseCard from './PhaseCard'
import { Badge, ChevronDown, FileText, Sparkles, FileQuestionMark } from 'lucide-react'
import type { JobState } from '@/lib/types';
import { estimateAssemblyAITime, formatTimeRange } from '@/lib/processing-time';
import FeatureItem from './FeatureItem';



interface ProcessingFlowProps {
    
  transcriptionStatus: JobState;
  generationStatus: JobState;
  fileDuration?: number | null;
  createdAt: string;
}


const availableFeatures = [
    {
        "name": "Coding Challenge",
        "description": "Generating a simple Coding Challenge from video",
        "icon": FileQuestionMark, 
        "isActive": true
    },
    {
        "name": "Tutorial Q&A",
        "description": "Generating questions and answers from video",
        "icon": FileQuestionMark, 
        "isActive": true
    },
    {
        "name": "Follow-Along Guide",
        "description": "Generating a follow-along guide with code snippets",
        "icon": FileQuestionMark, 
        "isActive": true
    },
    {
        "name": "Summary",
        "description": "Generating a concise summary of the tutorial",
        "icon": FileQuestionMark, 
        "isActive": true
    }
]


const ProcessingFlow = ({
  transcriptionStatus,
  generationStatus,
  fileDuration,
  createdAt,
}: ProcessingFlowProps) => {

    console.log('generationStatus', generationStatus)

    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [currentOutputIndex, setCurrentOutputIndex] = useState(0);

    const isTranscribing = transcriptionStatus === "running";
    const transcriptionComplete = transcriptionStatus === "completed";
    const transcriptionInProgress =
        transcriptionStatus === "pending" || transcriptionStatus === "running";
    const isGenerating = generationStatus === "running";
    const generationComplete = generationStatus === "completed";
    const showPhase2 = transcriptionComplete;


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

    const getGenerationDescription = useCallback(() => {
        if (!transcriptionComplete) return "Waiting for analysis...";
        const unlockedCount = availableFeatures.length;
        if (isGenerating)
        return `Generating ${unlockedCount} AI output${unlockedCount !== 1 ? "s" : ""} in parallel...`;
        if (generationComplete) return "All content generated!";
        return "Starting generation...";
    }, [
        transcriptionComplete,
        isGenerating,
        generationComplete,
        availableFeatures.length,
    ]);

    useEffect(() => {
        if (!isGenerating || availableFeatures.length === 0) {
        setCurrentOutputIndex(0);
        return;
        }

        const interval = setInterval(() => {
        setCurrentOutputIndex((prev) => (prev + 1) % availableFeatures.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isGenerating, availableFeatures.length]);


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

        {
            showPhase2 && (
                <PhaseCard
                    icon={Sparkles}
                    title="Phase 2: AI Generation"
                    description={getGenerationDescription()}
                    status={generationStatus}
                    isActive={isGenerating}
                >
                    {isGenerating &&
                        (
                            <div className="space-y-3 pt-2">
                                {availableFeatures.map((feature, idx) => {
                                const isActive = idx === currentOutputIndex;

                                return (
                                    <FeatureItem
                                    key={feature.name}
                                    name={feature.name}
                                    description={feature.description}
                                    icon={feature.icon}
                                    isActive={isActive}
                                    />
                                );
                                })}

                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 text-center mt-6 border-2 border-emerald-200 shadow-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    <span className="font-bold text-emerald-600 text-base">
                                    Powered by AWS step functions
                                    </span>{" "}
                                    — AI is generating {availableFeatures.length} output
                                    {availableFeatures.length > 1 ? "s" : ""} simultaneously
                                </p>
                                </div>
                            </div>
                        )
                    }

                    {generationComplete && (
                    <div className="flex flex-wrap items-center gap-3 pt-4">
                        {availableFeatures.map((feature) => (
                        <Badge
                            key={feature.name}
                            className="text-sm px-4 py-2 gradient-emerald text-white shadow-md"
                        >
                            {feature.name}
                        </Badge>
                        ))}
                    </div>
                    )}
                </PhaseCard>

            )
        }
        

        
    </div>
  )
}

export default ProcessingFlow
