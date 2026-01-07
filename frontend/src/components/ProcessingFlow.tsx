import React from 'react'
import PhaseCard from './PhaseCard'
import { Badge, ChevronDown, FileText, Sparkles } from 'lucide-react'

const ProcessingFlow = () => {
  return (
    <div className="space-y-6">
        <PhaseCard  
            icon={FileText}
            title="Phase 1: AI Analysis"
            description={"The AI is analysis the video file"}
            status={"completed"}
            isActive={true}
            progress={50}
            timeEstimate={"30 minutes"}
        />
    
        <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-16 bg-border" />
                    <ChevronDown className="h-5 w-5" />
                <div className="h-px w-16 bg-border" />
            </div>
        </div>

        <PhaseCard
            icon={Sparkles}
            title="Phase 2: AI Generation"
            description={"Generation different content from transcript"}
            status={"completed"}
            isActive={true}
        >

            <div className="space-y-3 pt-2">

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
        </PhaseCard>

        
    </div>
  )
}

export default ProcessingFlow
