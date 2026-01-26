export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again"


export type PhaseStatus =
  'pending'| 'running'| 'completed' | 'failed';

export interface JobStatus {
  transcription: PhaseStatus;
  contentGeneration: PhaseStatus;
}

export interface Tutorial {
  _id: string;
  inputUrl: string;
  fileName: string;
  fileSize: number;
  fileDuration?: number;
  fileFormat: string;
  mimeType: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  jobStatus: JobStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}


export const FEATURES = {
  CHALLENGE: "coding_challenge",
  QNA: "question_and_answers",
} as const;
