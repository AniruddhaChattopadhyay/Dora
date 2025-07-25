import React, { useState, useCallback, useEffect } from 'react';

interface UploadReferenceProps {
  onUpload: (file: File, imageUrl: string) => void;
}

const UploadReference: React.FC<UploadReferenceProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFile = async (file: File) => {
    if (!mounted) return;
    
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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      
      // Call the onUpload callback with both the file and the image URL
      onUpload(file, url);
    } catch (error) {
      console.error('Error handling file:', error);
      setUploadError('Failed to upload image. Please try again.');
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadError(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 p-4 border-2 border-dashed rounded-lg text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isUploading ? 'opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-lg font-semibold mb-2">Reference Photo</h2>
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <img src={previewUrl} alt="Reference preview" className="w-32 h-32 object-cover rounded mb-2 border" />
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
            accept="image/*" 
            onChange={handleFileInput} 
            className="hidden" 
            id="reference-upload"
            disabled={isUploading}
          />
          <label 
            htmlFor="reference-upload" 
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

export default UploadReference; 