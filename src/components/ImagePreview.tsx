"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  mediaUrl: string;
  isVideo: boolean;
  activeColor: string | null;
}

export default function ImagePreview({ mediaUrl, isVideo, activeColor }: ImagePreviewProps) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass-card group">
      {/* Base Media Layer */}
      {isVideo ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <Image
          src={mediaUrl}
          alt="Room Preview"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}

      {/* Color Overlay Layer using mix-blend-multiply */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-700 ease-in-out pointer-events-none mix-blend-multiply",
          activeColor ? "opacity-40" : "opacity-0"
        )}
        style={{ backgroundColor: activeColor || 'transparent' }}
      />
      
      {/* Decorative gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      
      {/* Placeholder State Indicator */}
      {!activeColor && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full text-sm font-medium text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Select a color to visualize
        </div>
      )}
    </div>
  );
}
