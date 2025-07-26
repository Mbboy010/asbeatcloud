'use client';

import BeatCard from '../../instrumentalPag/BeatCard';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Query } from 'appwrite';
import { useParams } from 'next/navigation';
import { databases } from '@/lib/appwrite';

interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  key: string;
  postId: string;
  scale: string;
  duration: string;
  userId: string;
  beatId: string;
  dateTime: string;
  fileUrl: string;
  downloadUrl: string;
  imageUrl: string; // Directly uses imageField
  downloads: number;
  likes: number;
  comments: string[];
  likers: string[];
  
}

const UserBeat = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '686a7cd100087c08444a';
  const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

  const params = useParams();
  const useridparams = typeof params.userid === 'string' ? params.userid : null;

  // Function to format dateTime as month + relative time (e.g., "Jul, 1m ago")
  const formatRelativeTime = (dateTime: string) => {
  const date = new Date(dateTime);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Skip future dates
  if (diffInSeconds < 0) return '';

  let relativeTime = '';
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

  // Function to truncate title
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length > maxLength) {
      return `${title.slice(0, maxLength)}...`;
    }
    return title;
  };

  useEffect(() => {
    const fetchBeats = async () => {
      if (!useridparams) {
        setError('No user ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query documents by userId, sorted by uploadDate descending, limit to 5
        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTION_ID!,
          [Query.equal('userId', useridparams), Query.orderDesc('uploadDate'), Query.limit(5)]
        );

        // Map Appwrite documents to Beat interface
        const fetchedBeats: Beat[] = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title || '',
      artist: doc.name || '', // Assuming 'name' is the artist
      genre: doc.genre || '',
      dateTime: doc.uploadDate || '',
      tempo: doc.tempo || 0,
      key: doc.key || '',
      fileUrl: doc.fileUrl || '',
      postId: doc.postId || '',
      downloadUrl: doc.downloadUrl || '',
      scale: doc.scale || '',
      userId: doc.userId || '',
      beatId: doc.beatId || '',
      imageUrl: doc.imageFileId || '', // Use imageField directly as imageUrl
      downloads: doc.downloads || 0,
      duration: doc.duration || "00:00",
      likes: doc.likes || 0,
      comments: doc.comments || [],
      likers: doc.likers || [],
        }));

        setBeats(fetchedBeats);
      } catch (err) {
        console.error('Error fetching beats:', err);
        setError('Failed to load beats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, [useridparams]);

  

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="text-gray-200 p-6 rounded-lg">

      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Last Updated</h2>
      <div className="flex flex-col space-y-3">
        {beats.length === 0 ? (
          <p className="text-gray-400">No beats found for this user.</p>
        ) : (
         beats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))
        )}
      </div>
      {beats.length >= 5 && (
        <div className="mt-4 ml-[0.7rem] text-left">
          <Link href="/beats">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
            >
              See More
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserBeat;