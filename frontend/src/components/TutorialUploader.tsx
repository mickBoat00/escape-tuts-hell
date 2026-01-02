import React, { useState } from 'react'
import UploadDropZone from './UploadDropZone';

const TutorialUploader = () => {

    const MAXSIZE = 1000000000
    const [disabled, setDisabled] = useState(false)
    const handleFileSelect = async (file: File) => {

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
