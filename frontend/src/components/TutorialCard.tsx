import type { Tutorial } from "@/lib/types"
import { cn, formatDate, formatDuration, formatFileSize, getProcessingPhaseLabel, getStatusIcon } from "@/lib/utils"
import { Badge, FileAudio } from "lucide-react"


interface TutorialProps {
    tutorial: Tutorial
}


const TutorialCard = ({tutorial}: TutorialProps) => {
    const StatusIcon = getStatusIcon(tutorial.status);
    const processingPhase = getProcessingPhaseLabel(tutorial);
  return (
    <a href={`/tutorials/${tutorial._id}`} className="block">
      <div
        className={cn(
          "glass-card rounded-2xl group relative hover-lift cursor-pointer overflow-hidden transition-all",
          tutorial.status === "processing" &&
            "ring-2 ring-emerald-400 shadow-emerald-200 shadow-lg",
          tutorial.status === "failed" && "ring-2 ring-red-400",
        )}
      >
        <div className="p-6 md:p-7">
          <div className="flex items-start gap-5">
            {/* File Icon - larger, animated */}
            <div className="rounded-2xl gradient-emerald p-4 md:p-5 shrink-0 group-hover:scale-110 transition-transform shadow-lg">
              <FileAudio className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>

            {/* tutorial Info */}
            <div className="flex-1 min-w-0 overflow-hidden space-y-3">
              {/* Title + Status + Delete */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-extrabold text-lg md:text-xl lg:text-2xl wrap-break-word hyphens-auto group-hover:text-emerald-600 transition-colors leading-snug">
                    {tutorial.fileName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    {formatDate(tutorial.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {tutorial.status !== "failed" && (
                    <Badge
                      className={cn(
                        "flex items-center gap-2 h-9 md:h-10 text-sm md:text-base px-4 whitespace-nowrap font-bold shadow-md",
                        tutorial.status === "processing" &&
                          "gradient-emerald text-white animate-pulse-emerald",
                      )}
                    >
                      <StatusIcon
                        className={`h-4 w-4 md:h-5 md:w-5 ${tutorial.status === "processing" ? "animate-spin" : ""}`}
                      />
                      <span className="hidden md:inline">
                        {processingPhase}
                      </span>
                      <span className="md:hidden">
                        {tutorial.status === "processing"
                          ? tutorial.jobStatus?.transcription === "running"
                            ? "Trans"
                            : "Gen"
                          : tutorial.status}
                      </span>
                    </Badge>
                  )}
            </div>
            </div>

             <div className="flex items-center gap-3 flex-wrap">
                <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                  {formatFileSize(tutorial.fileSize)}
                </Badge>
                <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200 uppercase">
                  {tutorial.fileFormat}
                </Badge>
                {tutorial.fileDuration && (
                  <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                    {formatDuration(tutorial.fileDuration)}
                  </Badge>
                )}
              </div>
               




              {/* Error Message */}
              {tutorial.status === "failed" && tutorial.error && (
                <div className="mt-2 p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-700 font-semibold">
                    {tutorial.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

export default TutorialCard
