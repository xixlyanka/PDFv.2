import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon } from 'lucide-react';
import { UploadedFile, FileType } from '../types';

interface FileDropzoneProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  multiple?: boolean;
  accept?: string[];
  maxSizeMB?: number;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  multiple = false,
  accept = [],
  maxSizeMB = 25,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const determineFileType = (filename: string): FileType => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'docx' || ext === 'doc') return 'DOCX';
    if (ext === 'pptx') return 'PPTX';
    if (ext === 'jpg' || ext === 'jpeg') return 'JPG';
    if (ext === 'png') return 'PNG';
    return 'UNKNOWN';
  };

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = [];
    Array.from(fileList).forEach((file) => {
      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        return;
      }

      // Check type (simple extension check)
      const type = determineFileType(file.name);
      
      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        type,
        size: file.size,
        previewUrl: type === 'JPG' || type === 'PNG' ? URL.createObjectURL(file) : undefined,
      });
    });

    if (newFiles.length > 0) {
      if (!multiple) {
        onFilesSelected([newFiles[0]]);
      } else {
        onFilesSelected(newFiles);
      }
    }
  }, [maxSizeMB, multiple, onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input value to allow selecting same file again
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ease-in-out group ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 pulse-ring'
          : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept.join(',')}
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'}`}>
          <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
        </div>
        
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
            {isDragging ? 'Drop files here' : 'Click or Drag files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {multiple ? 'Select multiple files' : 'Select a file'} up to {maxSizeMB}MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;