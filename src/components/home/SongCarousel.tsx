 'use client';

import VerificationIcon from '../icons/VerificationIcon';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { databases } from '../../lib/appwrite';
import { useState, useEffect } from 'react';
import { Query } from 'appwrite';

interface Artist {
  $id: string;
  name: string;
  imageUrl: string;
  duration: string;
  scale: string;
  key: string;
  tempo: number;
  href: string;
}

const SongCarousel = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '686a7cd100087c08444a';

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTION_ID,
          [
            Query.greaterThanEqual("tempo", 5),
            Query.orderDesc("tempo"),
            Query.limit(10),
          ]
        );

        const fetchedArtists: Artist[] = response.documents.map((doc) => ({
          $id: doc.$id,
          name: `${doc.title}`,
          imageUrl: doc.imageFileId,
          scale: doc.scale,
          tempo: doc.tempo,
          key: doc.key,
          href: `/instrumental/${doc.$id}`,
          duration: doc.duration,
        }));

        setArtists(fetchedArtists);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError('Failed to load artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-lg">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">Top International</h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 mb-1 w-48 rounded-lg overflow-hidden"
            >
              <div className="w-full h-48 bg-gray-700 animate-pulse rounded-md"></div>
              <div className="flex flex-col mt-3 space-y-2">
                <div className="h-5 bg-gray-700 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-2/3"></div>
                <div className="h-4  bg-gray-700 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 rounded-lg">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Top International</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.$id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 mb-1 w-48 rounded-lg overflow-hidden cursor-pointer transition duration-200"
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} cover`}
                className="w-full h-48 rounded-md object-cover"
              />
              <div className="flex flex-col mt-3">
                <p className="font-semibold text-gray-200 max-w-[8.5rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap">{artist.name}</p>
                <p className="text-sm text-gray-300">tempo: {artist.tempo}BPM</p>
                <p className="text-sm text-gray-300">scale: {artist.key} {artist.scale}</p>
                <p className="text-sm text-gray-300">duration: {artist.duration}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SongCarousel;