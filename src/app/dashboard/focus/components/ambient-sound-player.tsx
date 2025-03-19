"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

interface AmbientSoundPlayerProps {
  title: string;
  description: string;
  imageUrl: string;
  soundUrl: string;
}

export default function AmbientSoundPlayer({
  title,
  description,
  imageUrl,
  soundUrl,
}: AmbientSoundPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(soundUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Stop any other playing sounds first (global state would be better for a real app)
      document.querySelectorAll("audio").forEach((audio) => audio.pause());
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button
        className={`w-full ${isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
        onClick={togglePlay}
      >
        {isPlaying ? (
          <>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" /> Play
          </>
        )}
      </Button>

      <div className="flex items-center space-x-2">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(vals) => setVolume(vals[0])}
          className="flex-1"
        />
      </div>
    </div>
  );
}
