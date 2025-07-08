'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Query } from 'appwrite';
import { useParams } from 'next/navigation';
import { databases } from '@/lib/appwrite';

interface Beat {
  id: string;
  title: string;
  imageUrl: string;
  dateTime: string;
  duration: string;
  musicType: string;
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
    const now = new Date('2025-07-08T13:16:00+01:00'); // Current time: 01:16 PM WAT, July 08, 2025
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Get month in Africa/Lagos time zone
    const month = date.toLocaleString('en-NG', { month: 'short', timeZone: 'Africa/Lagos' });

    let relativeTime;
    if (diffInSeconds < 60) {
      relativeTime = `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      relativeTime = `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      relativeTime = `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      relativeTime = `${days}d ago`;
    } else if (diffInSeconds < 2592000) { // Approx. 30 days for a month
      const months = Math.floor(diffInSeconds / 2592000);
      relativeTime = `${months}mo ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      relativeTime = `${years}y ago`;
    }

    return `${month}, ${relativeTime}`;
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
          title: doc.title,
          imageUrl: doc.imageFileId || null,
          dateTime: doc.uploadDate,
          duration: doc.duration,
          musicType: doc.genre,
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

  if (loading) {
    return (
      <div className="text-gray-200 p-6 rounded-lg">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">Last Updated</h2>
        <div className="flex flex-col space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-full rounded-lg p-3  animate-pulse flex items-center space-x-3"
            >
              <div className="w-20 h-20 bg-gray-700 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          beats.slice(0, 5).map((beat) => (
            <Link key={beat.id} href={`/profile/${useridparams}/${beat.id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-full rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition duration-200 flex items-center space-x-3"
              >
                <img
                  src={beat.imageUrl}
                  alt={beat.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-lg max-w-[200px] truncate">
                    {truncateTitle(beat.title)}
                  </h3>
                  <p className="text-sm text-gray-300">Genre: {beat.musicType}</p>
                  <p className="text-sm text-gray-300">Duration: {beat.duration}</p>
                  <p className="text-sm text-gray-400">Added: {formatRelativeTime(beat.dateTime)}</p>
                </div>
              </motion.div>
            </Link>
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