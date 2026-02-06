import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}


import {
  type LucideIcon,
  XCircle,
} from "lucide-react";

// import {
//   CheckCircle2,
//   Clock,
//   Loader2,
//   type LucideIcon,
//   XCircle,
// } from "lucide-react";
// import type { JobStatus, Tutorial, TutorialStatus } from "./types";
import type { Tutorial, TutorialStatus } from "./types";


export function getStatusVariant(
  status: TutorialStatus
): "default" | "secondary" | "destructive" {

  console.log('status', status)
 
  return "destructive";
  
}



// export function getStatusVariant(
//   status: TutorialStatus
// ): "default" | "secondary" | "destructive" {
//   switch (status) {
//     case "uploading":
//       return "default";
//     case "processing":
//       return "secondary";
//     case "completed":
//       return "default";
//     case "failed":
//       return "destructive";
//   }
// }


export function getStatusIcon(status: TutorialStatus): LucideIcon {
  console.log(status)
  
  return XCircle;
  
}


// export function getStatusIcon(status: TutorialStatus): LucideIcon {
//   switch (status) {
//     case "uploading":
//       return Clock;
//     case "processing":
//       return Loader2;
//     case "completed":
//       return CheckCircle2;
//     case "failed":
//       return XCircle;
//   }
// }

export function getProcessingPhaseLabel(tutorial: Tutorial): string {
  if (tutorial.status !== "processing") return tutorial.status;

  if (tutorial.jobStatus?.transcription === "running") {
    return "Transcribing";
  }

  // Generic "Generating" without showing count
  return "Generating";
}