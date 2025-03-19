"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { createClient } from "@/utils/supabase-client";

interface PomodoroTimerProps {
  onSessionComplete?: (sessionData: {
    duration: number;
    type: "focus" | "short_break" | "long_break";
  }) => void;
}

export default function PomodoroTimer({
  onSessionComplete,
}: PomodoroTimerProps) {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState<
    "focus" | "short_break" | "long_break"
  >("focus");
  const [isMuted, setIsMuted] = useState(false);

  // Timer settings
  const timerSettings = {
    focus: 25 * 60, // 25 minutes
    short_break: 5 * 60, // 5 minutes
    long_break: 15 * 60, // 15 minutes
  };

  // Audio refs
  const timerCompleteSound = useRef<HTMLAudioElement | null>(null);
  const tickSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    timerCompleteSound.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3",
    );
    tickSound.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-clock-tick-1045.mp3",
    );

    return () => {
      if (timerCompleteSound.current) {
        timerCompleteSound.current.pause();
        timerCompleteSound.current = null;
      }
      if (tickSound.current) {
        tickSound.current.pause();
        tickSound.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          // Play tick sound every 15 seconds
          if (prevTime % 15 === 0 && !isMuted && tickSound.current) {
            tickSound.current
              .play()
              .catch((err) => console.error("Error playing tick sound:", err));
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      setIsActive(false);

      // Play completion sound
      if (!isMuted && timerCompleteSound.current) {
        timerCompleteSound.current
          .play()
          .catch((err) =>
            console.error("Error playing completion sound:", err),
          );
      }

      // Notify parent component
      if (onSessionComplete) {
        onSessionComplete({
          duration: timerSettings[timerType],
          type: timerType,
        });
      }

      // Save session to database if it was a focus session
      if (timerType === "focus") {
        saveSessionToDatabase(timerSettings[timerType] / 60);
      }

      // Show browser notification
      if (Notification.permission === "granted") {
        new Notification("Timer Complete", {
          body: `Your ${timerType.replace("_", " ")} session is complete!`,
          icon: "/favicon.ico",
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, timerType, isMuted, onSessionComplete]);

  // Request notification permission on component mount
  useEffect(() => {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Save session to database
  const saveSessionToDatabase = async (durationMinutes: number) => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const sessionData = {
        user_id: userData.user.id,
        start_time: new Date(
          Date.now() - durationMinutes * 60 * 1000,
        ).toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
        subject: "Focus Session",
        notes: `Completed a ${durationMinutes} minute focus session`,
      };

      const { error } = await supabase
        .from("study_sessions")
        .insert(sessionData);

      if (error) {
        console.error("Error saving study session:", error);
      }
    } catch (error) {
      console.error("Error in saveSessionToDatabase:", error);
    }
  };

  // Timer controls
  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerSettings[timerType]);
  };

  // Change timer type
  const changeTimerType = (type: "focus" | "short_break" | "long_break") => {
    setTimerType(type);
    setTimeLeft(timerSettings[type]);
    setIsActive(false);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle sound
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
        <p className="mt-2 text-sm text-muted-foreground">
          {timerType === "focus"
            ? "Focus Session"
            : timerType === "short_break"
              ? "Short Break"
              : "Long Break"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {!isActive ? (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 h-12 w-12 rounded-full p-0"
            onClick={startTimer}
          >
            <Play className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            className="bg-amber-600 hover:bg-amber-700 h-12 w-12 rounded-full p-0"
            onClick={pauseTimer}
          >
            <Pause className="h-6 w-6" />
          </Button>
        )}

        <Button
          variant="outline"
          className="h-12 w-12 rounded-full p-0"
          onClick={resetTimer}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="h-12 w-12 rounded-full p-0"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <Button
          variant={timerType === "focus" ? "default" : "outline"}
          className={
            timerType === "focus" ? "bg-indigo-600 hover:bg-indigo-700" : ""
          }
          onClick={() => changeTimerType("focus")}
        >
          Focus
        </Button>
        <Button
          variant={timerType === "short_break" ? "default" : "outline"}
          className={
            timerType === "short_break" ? "bg-green-600 hover:bg-green-700" : ""
          }
          onClick={() => changeTimerType("short_break")}
        >
          Short Break
        </Button>
        <Button
          variant={timerType === "long_break" ? "default" : "outline"}
          className={
            timerType === "long_break" ? "bg-blue-600 hover:bg-blue-700" : ""
          }
          onClick={() => changeTimerType("long_break")}
        >
          Long Break
        </Button>
      </div>
    </div>
  );
}
