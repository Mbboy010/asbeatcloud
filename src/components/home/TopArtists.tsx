'use client';

import VerificationIcon from '../icons/VerificationIcon';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { databases } from '../../lib/appwrite'; // Ensure this path is correct
import { useState, useEffect } from 'react';
import { Query } from 'appwrite';

interface Artist {
  $id: string; // Appwrite uses $id for document ID
  name: string;
  imageUrl: string;
  followers: number;
  href: string; // Link to artist page
}

const TopArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE; // Your Database ID
  const COLLECTION_ID = '6849aa4f000c032527a9'; // Your Collection ID for artists

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        // Fetch documents from the Appwrite collection
        const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_ID,
        [
          Query.greaterThanEqual("views", 5),   // Only where views >= 5
          Query.orderDesc("views"),             // Sort by most viewed
          Query.limit(10),                       // Limit to 2 results
        ]
      );

        // Map the response to match the Artist interface
        const fetchedArtists: Artist[] = response.documents.map((doc) => ({
          $id: doc.$id,
          name: `${doc.firstName} ${doc.lastName}`,
          imageUrl: doc.profileImageUrl,
          href: `/profile/${doc.$id}`, // Assuming artist page URL uses document ID
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 rounded-lg">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Featured Top Artists</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.$id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-48 rounded-lg overflow-hidden cursor-pointer transition duration-200"
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} profile`}
                className="w-full h-48 object-cover"
              />
              <div className="flex items-center justify-center flex-row ">
                <p className="font-bold font-semibold text-gray-200 max-w-[6rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap">{artist.name}    </p>
                <span className="mt-[0.22rem]">{artist.followers >= 1000 && (<VerificationIcon />) }</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;