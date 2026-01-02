import React, { useState } from 'react'
import UploadDropZone from './UploadDropZone';
import { estimateDurationFromSize, getAudioDuration } from '@/lib/audio-utils';
import type { UploadStatus } from '@/lib/types';


const TutorialUploader = () => {

    const MAXSIZE = 1000000000
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



  return (
    <div className="space-y-6">
        <UploadDropZone
        onFileSelect={handleFileSelect}
        maxSize={MAXSIZE}
        disabled={disabled}
        />
    </div>
  )
}

export default TutorialUploader
