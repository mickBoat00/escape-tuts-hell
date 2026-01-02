import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import UploadDropZone from './UploadDropZone';
import { estimateDurationFromSize, getAudioDuration } from '@/lib/audio-utils';
import type { UploadStatus } from '@/lib/types';
import { Button } from './ui/button';
import UploadProgress from './UploadProgress';

const TutorialUploader = () => {

    const [disabled, setDisabled] = useState(false)
    //  Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileDuration, setFileDuration] = useState<number | undefined>(
        undefined,
    );
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setUploadStatus("idle");
        setUploadProgress(0);
        setError(null);

        try {
            const duration = await getAudioDuration(file);
            setFileDuration(duration);
            console.log(`Audio duration extracted: ${duration} seconds`);
        } catch (err) {
            console.warn("Could not extract duration from audio file:", err);
            const estimated = estimateDurationFromSize(file.size);
            setFileDuration(estimated);
            console.log(`Using estimated duration: ${estimated} seconds`);
        }

    }


    const handleReset = () => {
        setSelectedFile(null);
        setFileDuration(undefined);
        setUploadStatus("idle");
        setUploadProgress(0);
        setError(null);
    };

    const handleUpload = () => {

        try {
            throw Error('It didnt work')
        } catch (err) {
            console.error("Upload error:", err);
            setUploadStatus("error");

            const errorMessage =
            err instanceof Error
            ? err.message
            : "Failed to upload file. Please try again.";

            setError(errorMessage);
            toast.error(errorMessage)

        }
        // setSelectedFile(null);
        // setFileDuration(undefined);
        // setUploadStatus("uploading");
        // setUploadProgress(50);
        
    };



  return (
    <div className="space-y-6">
        <ToastContainer />
        {!selectedFile && uploadStatus === "idle" && (
            <UploadDropZone
            onFileSelect={handleFileSelect}
            disabled={uploadStatus !== "idle"}
            />
        )}

        {selectedFile && (
        <>
          <UploadProgress
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            fileDuration={fileDuration}
            progress={uploadProgress}
            status={uploadStatus}
            error={error || undefined}
          />

          {/* Action buttons (show when idle or error) */}
          {(uploadStatus === "idle" || uploadStatus === "error") && (
            <div className="flex gap-3">
              <Button onClick={handleUpload} className="flex-1">
                {uploadStatus === "error" ? "Try Again" : "Start Upload"}
              </Button>
              <Button onClick={handleReset} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TutorialUploader
