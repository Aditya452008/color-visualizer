"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Video, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function Uploader({ onUpload, isLoading }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateAndProcessFile = (file: File) => {
    setError(null);
    const isValidType = file.type.startsWith("image/") || file.type.startsWith("video/");
    
    // Check max size (e.g. 50MB for video, 10MB for image)
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (!isValidType) {
      setError("Please upload a valid image (JPG, PNG) or video (MP4) file.");
      return;
    }
    
    if (file.size > maxSize) {
      setError(`File is too large. Max size is ${isVideo ? '50MB' : '10MB'}.`);
      return;
    }

    onUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative glass-panel group flex flex-col items-center justify-center p-12 text-center",
          "border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-[1.02]" 
            : "border-white/20 hover:border-primary/50 hover:bg-white/5",
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept="image/jpeg, image/png, video/mp4, video/quicktime"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse-slow"></div>
          <div className="bg-white/10 p-5 rounded-full border border-white/10 relative z-10 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-10 h-10 text-primary-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2 text-foreground">
          {isDragging ? "Drop your room photo here" : "Upload Room Image or Video"}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Drag and drop your file here, or click to browse. We'll analyze the space and lighting.
        </p>

        <div className="flex items-center gap-6 text-xs text-muted-foreground/80 font-medium tracking-wide uppercase">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>JPG / PNG</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span>MP4</span>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-full flex items-center gap-2 w-[calc(100%-2rem)] max-w-md">
            <FileWarning className="w-4 h-4 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
