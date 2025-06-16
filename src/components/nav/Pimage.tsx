'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite'; // Make sure this path is correct

import { useAppSelector } from '@/store/hooks';

export default function Pimage() {
  const authId = useAppSelector(state => state.authId.value); // or wherever you're storing the user id
  const navImg = useAppSelector(state => state.nav.value); // or wherever you're storing the user id
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE; // Replace with your Database ID
  const COLLECTION_ID = '6849aa4f000c032527a9'; // Replace with your Collection ID for artists

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          authId as string
        );

        // 👇 Make sure these fields match the names in your Appwrite collection
        setUsername(response.username);
        setImageUrl(response.profileImageUrl);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };


      fetchUserData();
    
    
    
  },[authId,navImg]);
  
  
  
  

  return imageUrl && <img className="scale-[2]" src={imageUrl} alt="User profile" />
}