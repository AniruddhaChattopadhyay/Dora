import React, { useState, useCallback } from 'react';

interface UploadReferenceProps {
  onUpload: (file: File) => void;
}

const UploadReference: React.FC<UploadReferenceProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    onUpload(file);
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
  };

  return (
    <div
      className={`flex-1 p-4 border-2 border-dashed rounded-lg text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-lg font-semibold mb-2">Reference Photo</h2>
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <img src={previewUrl} alt="Reference preview" className="w-32 h-32 object-cover rounded mb-2 border" />
          <button onClick={handleReplace} className="text-blue-500 hover:underline text-sm">Replace</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id="reference-upload" />
          <label htmlFor="reference-upload" className="cursor-pointer text-blue-500 hover:underline">Click here</label>
        </>
      )}
    </div>
  );
};

export default UploadReference; 