import bytes from "bytes";

export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    // Create temporary URL for file (revoked after use)
    const objectUrl = URL.createObjectURL(file);

    // Success: Metadata loaded, duration available
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl); // Clean up memory
      resolve(Math.floor(audio.duration)); // Return duration in whole seconds
    });

    // Error: File couldn't be decoded or is corrupted
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl); // Clean up memory
      reject(new Error("Failed to load audio file"));
    });

    // Start loading audio file
    audio.src = objectUrl;
  });
}


export function estimateDurationFromSize(fileSize: number): number {
  // Convert bytes to MB, multiply by 8 (minutes per MB), convert to seconds
  return Math.floor((fileSize / (1024 * 1024)) * 8 * 60);
}


export function formatFileSize(size: number): string {
  return bytes(size, { unitSeparator: " " }) || "";
}

/**
 * Format duration in MM:SS or HH:MM:SS format
 *
 * Examples:
 * - 65 seconds -> "1:05"
 * - 3665 seconds -> "1:01:05"
 *
 * Automatically includes hours only if needed
 * Always pads minutes and seconds with leading zeros
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
