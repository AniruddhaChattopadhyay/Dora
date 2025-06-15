import React, { useState, useCallback } from 'react';

interface UploadVideoProps {
  onUpload: (file: File, videoUrl: string) => void;
}

const UploadVideo: React.FC<UploadVideoProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Upload to Azure Blob Storage via API
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('response', response);
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      
      // Call the onUpload callback with both the file and the video URL
      onUpload(file, url);
    } catch (error) {
      console.error('Error handling file:', error);
      setUploadError('Failed to upload video. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleReplace = () => {
    setPreviewUrl(null);
    setUploadError(null);
  };

  return (
    <div
      className={`flex-1 p-4 border-2 border-dashed rounded-lg text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isUploading ? 'opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-lg font-semibold mb-2">Upload Video</h2>
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <video src={previewUrl} controls className="w-full max-h-40 rounded mb-2" />
          <button 
            onClick={handleReplace} 
            className="text-blue-500 hover:underline text-sm"
            disabled={isUploading}
          >
            Replace
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {isUploading ? 'Uploading...' : 'Drag and drop or click to upload'}
          </p>
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileInput} 
            className="hidden" 
            id="video-upload"
            disabled={isUploading}
          />
          <label 
            htmlFor="video-upload" 
            className={`cursor-pointer text-blue-500 hover:underline ${isUploading ? 'opacity-50' : ''}`}
          >
            Click here
          </label>
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </>
      )}
    </div>
  );
};

export default UploadVideo; 