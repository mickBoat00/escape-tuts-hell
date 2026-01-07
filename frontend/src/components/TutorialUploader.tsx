import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

import UploadDropZone from './UploadDropZone';
import { estimateDurationFromSize, getAudioDuration } from '@/lib/audio-utils';
import type { UploadStatus, UploadButtonState } from '@/lib/types';
import { Button } from './ui/button';
import UploadProgress from './UploadProgress';

import { useNavigate } from '@tanstack/react-router'

const TutorialUploader = () => {

    const navigate = useNavigate()

    const [disabled, setDisabled] = useState(false)
    //  Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileDuration, setFileDuration] = useState<number | undefined>(
        undefined,
    );
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [uploadBtnState, setUploadBtnState] = useState<UploadButtonState>("Start Upload");

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
        setUploadBtnState("Start Upload")
    };

    const getS3SignUrl = async (file: File, fileDuration:number | undefined) => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/upload`, {
          fileName: file.name,
          fileSize: file.size,
          fileDuration: fileDuration,
          contentType: file.type
      });

      return response.data;
    }

    const pushFiletoS3 = async (file: File, presignedUrl: string) => {
          const response = await axios.put(presignedUrl, file, {
              headers: {
                  'Content-Type': file.type || 'application/octet-stream',
              },
              transformRequest: [(data) => data], // Prevent axios from transforming the data
              onUploadProgress: (progressEvent) => {
                  if (progressEvent.total) {
                      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      setUploadProgress(percentCompleted);
                      console.log(`Upload progress: ${percentCompleted}%`);
                  }
              }
          });

          return response;
    }

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploadStatus("uploading");
            setUploadProgress(0);

            const data = await getS3SignUrl(selectedFile, fileDuration)

            let tutorialId = data.tutorialId;

            if(data.url){
              await pushFiletoS3(selectedFile, data.url);
            }

            setUploadProgress(100);
            setUploadStatus("completed");
            toast.success('File uploaded successfully!');

            navigate({ 
              to: '/tutorials/$tutorialId',
              params: { tutorialId },
            })
            
        } catch (err) {
            console.error("Upload error:", err);
            setUploadStatus("error");
            setUploadBtnState("Try Again")

            const errorMessage =
            err instanceof Error
            ? err.message
            : "Failed to upload file. Please try again.";

            setError(errorMessage);
            toast.error(errorMessage);
        }
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