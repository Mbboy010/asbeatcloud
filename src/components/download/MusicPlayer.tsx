"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

const formatTime = (time) => {
  if (isNaN(time) || time === 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

interface Props {
  instrumental: { url: string };
}

const MusicPlayer = ({ instrumental }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      if (!isDragging) {
        setProgress(currentProgress || 0);
      }
    }
  };

  const handleSeekStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleSeek = (e: React.MouseEvent | React.TouchEvent) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const progressBarWidth = progressBar.offsetWidth;
    let seekPercentage = (clickPosition / progressBarWidth) * 100;

    // Clamp the percentage between 0 and 100
    seekPercentage = Math.max(0, Math.min(100, seekPercentage));

    const seekTime = (seekPercentage / 100) * audio.duration;
    if (!isNaN(seekTime)) {
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
      setProgress(seekPercentage);
    }
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      handleSeek(e as any); // TypeScript workaround for event compatibility
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      setProgress(0);
    };

    const handleError = (error: Event) => {
      console.error("Audio error:", error);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    // Add global event listeners for dragging
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("mouseup", handleSeekEnd);
    window.addEventListener("touchend", handleSeekEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("mouseup", handleSeekEnd);
      window.removeEventListener("touchend", handleSeekEnd);
    };
  }, [isDragging]);

  return (
    <div className="flex w-full mt-2 justify-center items-center p-4 sm:p-6 rounded-2xl text-white">
      <div className="w-full max-w-md space-y-4">
        {/* Track Info (Optional) */}
        <div className="text-center mb-8 mt-3">
          <h3 className="text-lg font-semibold">Listen Instrumental</h3>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full bg-gray-700 h-2 rounded-full overflow-hidden cursor-pointer"
          ref={progressBarRef}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
        >
          <motion.div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full relative"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
          </motion.div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center">
          <motion.button
            onClick={togglePlay}
            className="bg-gray-500 text-white p-4 rounded-full shadow-lg hover:bg-gray-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        <audio
          ref={audioRef}
          src={instrumental.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;