'use client';

import { useEffect, useState } from 'react';
import { account, databases } from '@/lib/appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { Models } from 'appwrite';
import { useRouter, useParams, usePathname } from 'next/navigation';

export default function Verified() {
  const authId = useAppSelector((state) => state.authId.value);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = '6849aa4f000c032527a9';

  useEffect(() => {
    if (!authId) {
      router.push('/login'); // Redirect to login if no authId
      return;
    }

    const fetchDb = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          authId
        );

        if (!response.verified && pathname !== '/verification') {
          router.push('/verification');
        } else if (response.verified && pathname === '/verification') {
          router.push(`/profile/${authId}`);
        } else if(response.verified == null){
          await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId!, {
            verified: true,
        });
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        // Handle error appropriately
        router.push('/error'); // Optional: redirect to error page
      }
    };

    fetchDb();
  }, [authId, pathname, router]); // Added pathname to dependencies

  return null; // Return null since component doesn't render anything visible
}