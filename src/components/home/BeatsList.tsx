'use client';

import BeatCard from '../instrumentalPag/BeatCard';
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

const BeatsList = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [artistNames, setArtistNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLLECTION_ID = '686a7cd100087c08444a';
  const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  const COLLECTION_I = '6849aa4f000c032527a9';
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const params = useParams();
  const useridparams = typeof params.userid === 'string' ? params.userid : null;

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

  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
  };

  const fetchArtistName = async (userId: string) => {
    try {
      if (!artistNames[userId]) {
        const response = await databases.getDocument(DATABASE_ID!, COLLECTION_I!, userId);
        const fullName = `${response.firstName} ${response.lastName}`;
        setArtistNames((prev) => ({ ...prev, [userId]: fullName }));
      }
    } catch (error) {
      console.error(`Failed to fetch artist name for userId ${userId}`, error);
    }
  };

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTION_ID!,
          [Query.orderDesc('$createdAt'), Query.limit(5)]
        );

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

        for (const beat of fetchedBeats) {
          fetchArtistName(beat.userId);
        }
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
              className="w-full rounded-lg p-3 flex items-center space-x-3"
            >
              <div className="w-20 h-20 bg-gray-700 animate-pulse rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-700 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
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

export default BeatsList;