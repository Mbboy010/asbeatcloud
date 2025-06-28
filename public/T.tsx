'use client';

import { useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { account, databases } from '../../lib/appwrite';
import { OAuthProvider } from 'appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import { useRouter, useSearchParams } from 'next/navigation';


export default function LoginAuth() {
  const authId = useAppSelector((state) => state.authId.value);
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Define constants outside component
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';

  useEffect(() => {
    if (!isAuth || !searchParams.get('provider')) return;

    const handleOAuthCallback = async () => {
      try {
        const user = await account.get();
        dispatch(setAuthId(user.$id));
        
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const email = user.email || '';

        await databases.createDocument(DATABASE_ID!, COLLECTION_ID!, user.$id, {
          firstName,
          lastName,
          username: user.$id, // Use auth ID as username
          email,
          createdAt: new Date().toISOString(),
        });

        router.push(`/profile/${user.$id}`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/signup?error=auth_failed');
      }
    };

    handleOAuthCallback();
  }, [isAuth, searchParams, dispatch, router]);

  const handleGoogleSignup = async () => {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/signup?provider=google`,
        router.push(`/profile/${user.$id}`),
        `${window.location.origin}/signup?error=auth_failed`
      );
    } catch (error) {
      console.error('Google signup error:', error);
      router.push('/signup?error=google_auth_failed');
    }
  };

  return (
    <div className="flex justify-center">
      <motion.button
        onClick={handleGoogleSignup}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
      >
        <FaGoogle className="h-5 w-5 mr-2" />
        Sign up with Google
      </motion.button>
    </div>
  );
}