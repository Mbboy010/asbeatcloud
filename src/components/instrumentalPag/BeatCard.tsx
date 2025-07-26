"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BeatModal from "./BeatModal";

interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  key: string;
  scale: string;
  imageUrl: string;
  downloads: number;
  likes: number;
  likers: string[]; // Array of user IDs who liked the beat
  comments: string[];
  userId: string;
  postId: string;
  dateTime: string;
  duration: string;
  fileUrl: string;
  downloadUrl: string;
}

interface BeatCardProps {
  beat: Beat;
}

export default function BeatCard({ beat: initialBeat }: BeatCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [beat, setBeat] = useState<Beat>({
    ...initialBeat,
    likers: Array.isArray(initialBeat.likers) ? initialBeat.likers : [], // Normalize likers
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle body overflow for modal
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Update beat state
  const updateBeat = (newBeat: Partial<Beat>) => {
    setBeat((prev) => ({
      ...prev,
      ...newBeat,
      likers: Array.isArray(newBeat.likers) ? newBeat.likers : prev.likers, // Ensure likers remains an array
    }));
  };

  const truncateTitle = (title: string | null | undefined, maxLength: number = 20) => {
    if (!title) return "Untitled";
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  const closeModal = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative p-4 hover:bg-gray-900 hover:bg-opacity-50 rounded-lg  transition-shadow duration-200 text-gray-200"
    >
      <Link
        href={`/instrumental/${beat.postId}`}
        className="flex items-center space-x-4"
        aria-label={`View details for ${beat.title || "Untitled"} by ${beat.artist || "Unknown Artist"}`}
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={beat.imageUrl || "/placeholder-image.jpg"}
          alt={beat.title || "Beat cover"}
          className="w-24 h-24 sm:w-24 sm:h-24 object-cover rounded-md flex-shrink-0"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">
            {truncateTitle(beat.title)}
          </h3>
          <p className="text-sm text-gray-300 truncate">
            Artist: {beat.artist || "Unknown Artist"}
          </p>
          <p className="text-sm text-gray-300 truncate">Genre: {beat.genre || "N/A"}</p>
          <p className="text-sm text-gray-300">Duration: {beat.duration || "N/A"}</p>
          <p className="text-sm text-gray-400">
            Added: {formatRelativeTime(beat.dateTime)}
          </p>
        </div>
      </Link>

      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="More actions"
        >
          <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-200" />
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="beat-modal-title"
            >
              <BeatModal
                beat={beat}
                isOpen={isMenuOpen}
                closeModal={closeModal}
                updateBeat={updateBeat}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatRelativeTime(dateTime: string) {
  if (!dateTime) return "N/A";

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "N/A";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return "Just now";

    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "w", seconds: 604800 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 },
      { label: "s", seconds: 1 },
    ];

    for (const interval of intervals) {
      const value = Math.floor(diffInSeconds / interval.seconds);
      if (value >= 1) {
        return `${value}${interval.label} ago`;
      }
    }

    return "Just now";
  } catch {
    return "N/A";
  }
}