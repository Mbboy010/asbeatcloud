'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite'; // Ensure this path is correct

const ArtistProfile = () => {
  const params = useParams();
  const userid = params.userid;

  // State for dynamic artist data
  const [artist, setArtist] = useState({
    name: '',
    imageUrl: '',
    hometown: '',
    birthDate: '',
    genre: '',
    username: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE; // Replace with your Database ID
  const COLLECTION_ID = '6849aa4f000c032527a9'; // Replace with your Collection ID for artists

  // Fetch artist data from Appwrite
  useEffect(() => {
    if (!userid) {
      setError('Artist ID not provided');
      setLoading(false);
      return;
    }

    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      setLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      try {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid as string);
        setArtist({
          name: response.name || 'Unknown Artist',
          imageUrl: response.profileImageUrl || 'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin',
          hometown: response.hometown || 'Location not available',
          birthDate: response.dob || 'dob not available',
          genre: response.genre || 'Genre not available',
          username: response.username || '',
        });
      } catch (err) {
        setError('Error fetching artist data');
        console.error('Failed to fetch artist data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [userid, DATABASE_ID]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="text-gray-200 p-6 rounded-xl max-w-md mx-auto my-6">
      <h1 className="text-[1.2rem] font-bold mb-4">{artist.username}</h1>
      <div className="relative mt-7">
        <img
          src={artist.imageUrl}
          alt={`${artist.username} profile`}
          className="w-full h-96 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 rounded-lg"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div>
          <h3 className="text-sm font-medium text-gray-400">Hometown</h3>
          <p className="text-md">{artist.hometown}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Born</h3>
          <p className="text-md">{artist.birthDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Genre</h3>
          <p className="text-md">{artist.genre}</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;