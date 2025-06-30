'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';

export default function Pimage() {
  const router = useRouter();
  const authId = useAppSelector((state) => state.authId.value);
  const navImg = useAppSelector((state) => state.nav.value);
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const DEFAULT_IMAGE_URL = 'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin';

  useEffect(() => {
    const fetchUserData = async () => {
      if (!DATABASE_ID) {
        console.error('DATABASE_ID is not defined');
        return;
      }

      if (!authId) {
        console.warn('No authId provided');
        router.push('/login'); // Redirect to login if no authId
        return;
      }

      try {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId);

        setUsername(response.username || '');
        setImageUrl(response.profileImageUrl || DEFAULT_IMAGE_URL);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setImageUrl(DEFAULT_IMAGE_URL); // Fallback to default image on error
      }
    };

    fetchUserData();
  }, [authId, router]);

  return (
    <>
      {imageUrl && (
        <img
          className="scale-[2]"
          src={imageUrl}
          alt={`${username}'s profile`}
          onError={() => setImageUrl(DEFAULT_IMAGE_URL)} // Fallback on image load error
        />
      )}
    </>
  );
}