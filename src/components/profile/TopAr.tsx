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
  followers: number;
  href: string;
}

const TopArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(DATABASE_ID!, COLLECTION_ID, [
          Query.greaterThanEqual('views', 5),
          Query.orderDesc('views'),
          Query.limit(10),
        ]);

        const fetchedArtists: Artist[] = response.documents.map((doc) => ({
          $id: doc.$id,
          name: `${doc.firstName} ${doc.lastName}`,
          imageUrl: `${doc.profileImageUrl}`,
          href: `/profile/${doc.$id}`,
          followers: doc.followers,
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

  

  return (
    <div className="p-6 rounded-lg">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Featured Top Artists</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.$id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-32 mb-1 rounded-lg overflow-hidden cursor-pointer transition duration-200"
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} profile`}
                className="w-full h-32 border-4 border-gray-800 rounded-full object-cover"
                loading="lazy"
              />
              <div className="flex items-center mt-3 justify-center flex-row">
                <p className="font-bold font-semibold text-gray-200 max-w-[6rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                  {artist.name}
                </p>
                <span className="mt-[0.22rem]">{artist.followers >= 1000 && <VerificationIcon />}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;