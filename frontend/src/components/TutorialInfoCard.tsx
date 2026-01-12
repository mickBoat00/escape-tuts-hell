import type { Tutorial } from '@/lib/types';
import { formatDate, formatDuration, formatFileSize } from '@/lib/utils';
import { Calendar, Clock, FileType, HardDrive } from 'lucide-react';
import React from 'react'


interface TutorialStatusCardProps {
  tutorial: Tutorial;
}

const TutorialInfoCard = ({tutorial}: TutorialStatusCardProps) => {
   return (
    <div className="glass-card-strong rounded-2xl p-8 hover-lift">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Tutorial Info */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Created</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(tutorial.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <HardDrive className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">File Size</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatFileSize(tutorial.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <FileType className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Format</p>
                <p className="text-sm font-semibold text-gray-900 uppercase">
                  {tutorial.fileFormat}
                </p>
              </div>
            </div>
            {tutorial.fileDuration && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDuration(tutorial.fileDuration)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialInfoCard
