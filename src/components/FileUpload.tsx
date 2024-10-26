import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUpload: (content: string, fileType: 'html' | 'csv') => void;
}

function FileUpload({ onUpload }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [onUpload]
  );

  const handleFile = (file: File) => {
    const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'html';
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload(content, fileType);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-500 transition-colors"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-full">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium">Drop your PowerTop HTML report here</p>
          <p className="text-gray-400 mt-1">or</p>
        </div>
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block transition-colors">
            Browse Files
          </span>
          <input
            type="file"
            className="hidden"
            accept=".html,.csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        <p className="text-sm text-gray-400">HTML and CSV files exported from PowerTop are supported</p>
      </div>
    </div>
  );
}

export default FileUpload;
