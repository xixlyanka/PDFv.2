import React, { createContext, useContext, useState } from 'react';
import { UploadedFile } from '../types';

interface FileHandlerContextType {
  pipelineFile: UploadedFile | null;
  setPipelineFile: (file: UploadedFile | null) => void;
  sourceTool: string | null;
  setSourceTool: (tool: string | null) => void;
  clearPipeline: () => void;
}

const FileHandlerContext = createContext<FileHandlerContextType | undefined>(undefined);

export const FileHandlerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pipelineFile, setPipelineFile] = useState<UploadedFile | null>(null);
  const [sourceTool, setSourceTool] = useState<string | null>(null);

  const clearPipeline = () => {
    setPipelineFile(null);
    setSourceTool(null);
  };

  return (
    <FileHandlerContext.Provider value={{ pipelineFile, setPipelineFile, sourceTool, setSourceTool, clearPipeline }}>
      {children}
    </FileHandlerContext.Provider>
  );
};

export const useFileHandler = () => {
  const context = useContext(FileHandlerContext);
  if (!context) {
    throw new Error('useFileHandler must be used within a FileHandlerProvider');
  }
  return context;
};