export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again"


export interface Tutorial {
  _id: string;
  inputUrl: string;
  fileName: string;
  fileSize: number;
  fileDuration?: number;
  fileFormat: string;
  mimeType: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}
