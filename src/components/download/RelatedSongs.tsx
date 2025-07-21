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

interface Props {
  userId: string;
  genre: string;
  scale: string;
  title: string;
}

export default function RelatedSongs({ userId, genre, scale,title }: Props) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '686a7cd100087c08444a';

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(DATABASE_ID!, COLLECTION_ID, [
          Query.or([
            Query.equal('genre', genre),
            Query.equal('scale', scale),
            Query.equal('userId', userId),
            Query.notEqual('title', title),
          ]),
        ]);


        const fetchedArtists: Artist[] = response.documents.map((doc) => ({
          $id: doc.$id,
          name: doc.title,
          imageUrl: doc.imageFileId,
          scale: doc.scale,
          tempo: doc.tempo,
          key: doc.key,
          href: `/instrumental/${doc.postId}`,
          duration: doc.duration,
        }));

        // Shuffle and limit to 10 artists
        const shuffledArtists = fetchedArtists
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setArtists(shuffledArtists);
      } catch (err : any) {
        console.error('Error fetching artists:', err);
        setError('Failed to load artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [userId, genre, scale]);

  if (loading) {
    return (
      <div className="py-6 rounded-lg">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">Related Songs</h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-36 rounded-lg">
              <div className="w-36 h-36 bg-gray-700 animate-pulse rounded-md" />
              <div className="flex flex-col mt-3 space-y-2">
                <div className="h-5 bg-gray-700 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2" />
                <div className="h-4 bg-gray-700 animate-pulse rounded w-2/3" />
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="py-6 rounded-lg">
      <h2 className="text-[1.3rem] pt-4 pb-2 text-gray-200 font-bold mb-3 text-left">
        Related Songs
      </h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.$id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-36 rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} cover`}
                className="w-36 h-36 rounded-md object-cover"
                onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')}
              />
              <div className="flex flex-col mt-3">
                <p className="font-semibold text-gray-200 max-w-[8.5rem] overflow-hidden text-ellipsis whitespace-nowrap">
                  {artist.name}
                </p>
                <p className="text-sm text-gray-300">Tempo: {artist.tempo} BPM</p>
                <p className="text-sm text-gray-300">
                  Scale: {artist.key} {artist.scale}
                </p>
                <p className="text-sm text-gray-300">Duration: {artist.duration}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}