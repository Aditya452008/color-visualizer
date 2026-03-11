"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import Uploader from "@/components/Uploader";
import ImagePreview from "@/components/ImagePreview";
import ColorSwatch from "@/components/ColorSwatch";

interface ColorRecommendation {
  hex: string;
  vibe: string;
  explanation: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<ColorRecommendation[] | null>(null);
  const [activeColorHex, setActiveColorHex] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setApiError(null);
    // Create local object URL for instant preview
    const url = URL.createObjectURL(uploadedFile);
    setMediaUrl(url);
    setIsLoading(true);

    try {
      // Create FormData to send file to API
      const formData = new FormData();
      formData.append("media", uploadedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setColors(data.colors);
      // Auto-select the first color
      if (data.colors && data.colors.length > 0) {
        setActiveColorHex(data.colors[0].hex);
      }
    } catch (error: any) {
      console.error("Error analyzing:", error);
      setApiError(error.message || "Something went wrong while analyzing the room.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setColors(null);
    setActiveColorHex(null);
    setApiError(null);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-gradient font-semibold">AI Interior Design</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground drop-shadow-sm">
            Smart Home Color <br className="hidden md:block" />
            <span className="text-gradient">Palette Visualizer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a photo or video of your room, and our AI interior designer will 
            recommend perfect wall colors based on existing lighting, textures, and furniture.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto">
          {!mediaUrl ? (
            <div className="animate-fade-in-up">
              <Uploader onUpload={handleUpload} isLoading={isLoading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-fade-in">
              {/* Left Column: Preview */}
              <div className="lg:col-span-7 space-y-6">
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Try another room
                </button>
                
                <ImagePreview 
                  mediaUrl={mediaUrl} 
                  isVideo={file?.type.startsWith("video/") || false}
                  activeColor={activeColorHex}
                />
              </div>

              {/* Right Column: Recommendations */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                {isLoading ? (
                  <div className="glass-panel text-center py-16 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
                    <h3 className="text-xl font-medium mb-2">Analyzing your space...</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluating natural light, floor textures, and existing vibe.
                    </p>
                  </div>
                ) : colors ? (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        AI Recommendations
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Select a swatch to visualize the color on your walls.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {colors.map((color, idx) => (
                        <ColorSwatch
                          key={color.hex}
                          index={idx}
                          color={color}
                          isActive={activeColorHex === color.hex}
                          onClick={() => setActiveColorHex(color.hex)}
                        />
                      ))}
                    </div>
                  </div>
                ) : apiError ? (
                  <div className="glass-panel text-center py-12 px-6">
                    <p className="text-red-400 font-medium mb-2">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground">{apiError}</p>
                    <button 
                      onClick={() => file && handleUpload(file)}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel text-center py-12">
                    <p className="text-red-400">Failed to load recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
