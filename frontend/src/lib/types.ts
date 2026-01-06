export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export type UploadButtonState =
  | "Start Upload"
  | "Try Again"