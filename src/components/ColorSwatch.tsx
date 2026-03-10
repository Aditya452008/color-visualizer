"use client";

import { cn } from "@/lib/utils";

interface ColorRecommendation {
  hex: string;
  vibe: string;
  explanation: string;
}

interface ColorSwatchProps {
  color: ColorRecommendation;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export default function ColorSwatch({ color, isActive, onClick, index }: ColorSwatchProps) {
  // Ensuring readable text color depending on the hex bg luminance
  const hex = color.hex.startsWith('#') ? color.hex : `#${color.hex}`;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full text-left glass-card transition-all duration-500 overflow-hidden",
        "hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive ? "ring-2 ring-primary bg-white/10 shadow-[0_8px_32px_rgba(139,92,246,0.3)]" : "border-white/10"
      )}
      style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both" }}
    >
      <div className="animate-fade-in-up">
        {/* Color Header */}
        <div className="p-5 flex items-center gap-4 border-b border-white/5">
          <div 
            className="w-14 h-14 rounded-full shadow-inner border border-white/20 shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: hex }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-foreground truncate drop-shadow-sm">
              {color.vibe}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded uppercase tracking-wider">
                {hex}
              </span>
            </div>
          </div>
          
          {/* Active Indicator */}
          <div className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            isActive ? "bg-primary shadow-[0_0_10px_var(--color-primary)] opacity-100" : "opacity-0"
          )} />
        </div>
        
        {/* Explanation Body */}
        <div className="p-5 text-sm leading-relaxed text-foreground/80">
          {color.explanation}
        </div>
      </div>
      
      {/* Background Gradient matching the color slightly */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at right bottom, ${hex}, transparent)` }}
      />
    </button>
  );
}
