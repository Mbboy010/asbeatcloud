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
  genre: string;
  href: string;
  userId: string;
}

// Shuffle function to randomize array order
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

const Tygenre = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistNames, setArtistNames] = useState<{ [key: string]: string }>({});
  
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '686a7cd100087c08444a';
  const COLLECTION_I = '6849aa4f000c032527a9';
  
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);

        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTION_ID,
          [
           
            Query.orderDesc("genre"),
            Query.limit(50),
          ]
        );

        const fetchedArtists: Artist[] = response.documents.map((doc) => ({
          $id: doc.$id,
          name: `${doc.title}`,
          imageUrl: doc.imageFileId,
          genre: doc.genre,
          userId: doc.userId,
          href: `/instrumental/${doc.postId}`,
        }));
      
        for (const beat of fetchedArtists) {
          fetchArtistName(beat.userId);
        }
        
        const shuffledArtists = shuffleArray(fetchedArtists).slice(0, 10); // Display 10 random ones
        setArtists(shuffledArtists);

      } catch (err) {
        console.error('Error fetching artists:', err);
        setError('Failed to load artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);
  
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

  if (loading) {
    return (

      <div className="p-6 rounded-lg ">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">genres for you</h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, index) => ( // Display 5 skeleton items
            <div
              key={index}
              className="flex-shrink-0 w-36 rounded-lg overflow-hidden" // Reduced width
            >
              <div className="w-full h-36 bg-gray-700 animate-pulse rounded-md"></div> {/* Reduced height */}
              <div className="flex flex-col mt-3">
                <div className="h-5 bg-gray-700 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 mb-2 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    );
  }

  if (error) return <div>{error}</div>;

  return (
 
    <div className="p-6 rounded-lg ">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">genres for you</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.$id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-36 rounded-lg overflow-hidden cursor-pointer transition duration-200" // Reduced width
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} cover`}
                className="w-full h-36 rounded-md object-cover" // Reduced height
              />
              <div className="flex flex-col mt-3">
                <p className="font-semibold text-gray-200 max-w-[8.5rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                  {artist.name}
                </p>
                <p className="text-sm text-gray-400">{artistNames[artist.userId]}</p>
                <p className="text-sm text-gray-400">{artist.genre}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>

  );
};

export default Tygenre;