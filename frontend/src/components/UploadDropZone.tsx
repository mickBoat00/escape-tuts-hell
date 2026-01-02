import { cn } from '@/lib/utils'
import { FileAudio, Upload } from 'lucide-react'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface uploadDropZoneProps {
    onFileSelect: (file: File) => void
    maxSize: number
    disabled: boolean
}

const UploadDropZone = ({
    onFileSelect, 
    maxSize,
    disabled
}: uploadDropZoneProps) => {

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect],
    );

    // react-dropzone configuration and state
    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
        onDrop,
        // Accept configuration: Exhaustive list for cross-browser compatibility
        accept: {
            "audio/mpeg": [".mp3"], // MP3
            "audio/x-m4a": [".m4a"], // M4A (iOS/Apple)
            "audio/wav": [".wav", ".wave"], // WAV
            "audio/x-wav": [".wav", ".wave"], // WAV (alternate MIME)
            "audio/aac": [".aac"], // AAC
            "audio/ogg": [".ogg", ".oga"], // OGG Vorbis
            "audio/opus": [".opus"], // Opus
            "audio/webm": [".webm"], // WebM Audio
            "audio/flac": [".flac"], // FLAC
            "audio/x-flac": [".flac"], // FLAC (alternate MIME)
            "audio/3gpp": [".3gp"], // 3GP
            "audio/3gpp2": [".3g2"], // 3G2
        },
        maxSize, // File size limit (validates before upload)
        maxFiles: 1, // Only allow single file selection
        disabled, // Disable dropzone during upload
        });

    // Extract first rejection error for display
    const errorMessage = fileRejections[0]?.errors[0]?.message;
    
  return (
    <div className="w-full">
      <div {...getRootProps()} className={cn(
          // Base style
          "border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all",
          "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50",
          // Drag active state (file hovering over dropzone)
          isDragActive &&
            "border-emerald-600 bg-emerald-50 scale-[1.02] shadow-xl",
          // Disabled state
          disabled && "opacity-50 cursor-not-allowed",
          // Error state
          errorMessage && "border-red-400 bg-red-50/30",
          // Hover glow effect
          !disabled && "hover-glow",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-6">
          {/* Icon indicator */}
          <div
            className={cn(
              "rounded-3xl p-8 transition-all",
              isDragActive
                ? "gradient-emerald animate-pulse-emerald shadow-2xl scale-110"
                : "glass-card",
            )}
          >
            {isDragActive ? (
              <Upload className="h-16 w-16 text-white animate-bounce" />
            ) : (
              <FileAudio className="h-16 w-16 text-emerald-600" />
            )}
          </div>
        </div>

        {/* Instructions and info */}
        <div className="space-y-3">
            <p className="text-2xl font-bold text-gray-900">
                {isDragActive
                ? "Drop your coding tutorial file here"
                : "Drag & drop your coding tutorial file"}
            </p>
            <p className="text-base text-gray-600">or click to browse files</p>
            <div className="pt-2 space-y-1">
                <p className="text-sm text-gray-500 font-medium">
                Supports: MP3, WAV, M4A, FLAC, OGG, AAC, and more
                </p>
                <p className="text-sm text-gray-500 font-semibold">
                Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB
                </p>
            </div>
        </div>

        {/* Error message display */}
        {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            </div>
        )}
        
     </div>
    </div>
  );
}

export default UploadDropZone
