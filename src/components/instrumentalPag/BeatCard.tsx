"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Music, Heart, Share2, Flag, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

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
  comments: string[];
  userId: string;
  postId: string;
  dateTime: string;
  duration: string;
}

interface BeatCardProps {
  beat: Beat;
}

export default function BeatCard({ beat }: BeatCardProps) {
  const [artistNames, setArtistNames] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = "6849aa4f000c032527a9";

  const formatRelativeTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return "";

    let relativeTime = "";
    if (diffInSeconds < 60) {
      relativeTime = `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      relativeTime = `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      relativeTime = `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 604800) {
      relativeTime = `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else if (diffInSeconds < 2592000) {
      relativeTime = `${Math.floor(diffInSeconds / 604800)}w ago`;
    } else if (diffInSeconds < 31536000) {
      relativeTime = `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    } else {
      relativeTime = `${Math.floor(diffInSeconds / 31536000)}y ago`;
    }

    return relativeTime;
  };

  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  const fetchArtistName = async (userId: string) => {
    try {
      if (!artistNames[userId] && DATABASE_ID) {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
        const fullName = `${response.firstName} ${response.lastName}`;
        setArtistNames((prev) => ({ ...prev, [userId]: fullName }));
      }
    } catch (error) {
      console.error(`Failed to fetch artist name for userId ${userId}`, error);
      setArtistNames((prev) => ({ ...prev, [userId]: "Unknown Artist" }));
    } finally {
      setIsLoading(false); // Set loading to false when fetch completes
    }
  };

  useEffect(() => {
    if (beat.userId) {
      fetchArtistName(beat.userId);
    } else {
      setIsLoading(false); // No userId, no need to fetch
    }
  }, [beat.userId]);

  // Skeleton UI component
  const Skeleton = () => (
    <div className="w-full rounded-lg p-3 flex items-center space-x-3 animate-pulse">
      <div className="w-24 h-24 bg-gray-600 rounded-md"></div>
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-600 rounded w-1/3"></div>
        <div className="h-3 bg-gray-600 rounded w-1/4"></div>
      </div>
    </div>
  );

  return (
    <div className="text-gray-200">
      {isLoading ? (
        <Skeleton />
      ) : (
        <Link href={`/instrumental/${beat.postId}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition duration-200 flex items-center space-x-3"
          >
            <img
              src={beat.imageUrl}
              alt={beat.title}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-medium text-[1rem] max-w-[200px] truncate">
                {truncateTitle(beat.title)}
              </h3>
              <p className="text-sm text-gray-300">
                Artist: {artistNames[beat.userId] || "Unknown Artist"}
              </p>
              <p className="text-sm text-gray-300">Genre: {beat.genre}</p>
              <p className="text-sm text-gray-300">Duration: {beat.duration}</p>
              <p className="text-sm text-gray-400">
                Added: {formatRelativeTime(beat.dateTime)}
              </p>
            </div>
          </motion.div>
        </Link>
      )}
    </div>
  );
}