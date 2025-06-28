'use client';

import { useEffect, useState, useRef } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { account, databases, storage } from '../../lib/appwrite';
import { ID, OAuthProvider } from 'appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import { useRouter, useSearchParams } from 'next/navigation';
 function LoginAuthContent() {
  const authId = useAppSelector((state) => state.authId.value);
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For profile image
  const headerCanvasRef = useRef<HTMLCanvasElement>(null); // For header image

  // Define constants outside component
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  // Random color generator
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate profile image (768x768, 1:1 aspect ratio)
  const generateProfileImage = (firstName: string, lastName: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Profile canvas not found');
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Profile canvas context not available');
      }

      const text = `${firstName} ${lastName}`.trim();
      const [line1, line2] = text.includes(' ') ? text.split(/ (.+)/) : [text, ''];

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, getRandomColor());
      gradient.addColorStop(1, getRandomColor());

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 110px Arial';

      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 40);
      if (line2) {
        ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 80);
      }

      let quality = 0.6;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to generate profile image');
          }
          if (blob.size / 1024 > 50 && quality > 0.1) {
            quality -= 0.05;
            canvas.toBlob(
              (newBlob) => resolve(newBlob || blob),
              'image/jpeg',
              quality
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    });
  };

  // Generate header image (1000x500, 2:1 aspect ratio)
  const generateHeaderImage = (firstName: string, lastName: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = headerCanvasRef.current;
      if (!canvas) {
        throw new Error('Header canvas not found');
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Header canvas context not available');
      }

      const text = `${firstName} ${lastName}`.trim();

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, getRandomColor());
      gradient.addColorStop(1, getRandomColor());

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 80px Arial';

      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 30);

      let quality = 0.6;
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Failed to generate header image');
          if (blob.size / 1024 > 50 && quality > 0.1) {
            quality -= 0.05;
            canvas.toBlob(
              (newBlob) => resolve(newBlob || blob),
              'image/jpeg',
              quality
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    });
  };

  useEffect(() => {
    if (!isAuth || !searchParams.get('provider')) return;

    const handleOAuthCallback = async () => {
      try {
        // Validate environment variables
        if (!DATABASE_ID || !COLLECTION_ID || !BUCKET_ID) {
          throw new Error('Missing required environment variables: DATABASE_ID, COLLECTION_ID, or BUCKET_ID');
        }

        const user = await account.get();
        

        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const email = user.email || '';

        // Generate and upload profile image
        let profileImageUrl = '';
        try {
          const profileBlob = await generateProfileImage(firstName, lastName);
          const profileFile = new File([profileBlob], `${user.$id}-profile.jpg`, { type: 'image/jpeg' });
          const profileResponse = await storage.createFile(BUCKET_ID, ID.unique(), profileFile);
          profileImageUrl = storage.getFileView(BUCKET_ID, profileResponse.$id).toString();
        } catch (imageErr: any) {
          console.error('Error generating or uploading profile image:', imageErr);
          throw new Error('Failed to generate or upload profile image');
        }

        // Generate and upload header image
        let headerImageUrl = '';
        try {
          const headerBlob = await generateHeaderImage(firstName, lastName);
          const headerFile = new File([headerBlob], `${user.$id}-header.jpg`, { type: 'image/jpeg' });
          const headerResponse = await storage.createFile(BUCKET_ID, ID.unique(), headerFile);
          headerImageUrl = storage.getFileView(BUCKET_ID, headerResponse.$id).toString();
        } catch (imageErr: any) {
          console.error('Error generating or uploading header image:', imageErr);
          throw new Error('Failed to generate or upload header image');
        }

        // Create user document with image URLs
        await databases.createDocument(DATABASE_ID!, COLLECTION_ID!, user.$id, {
          firstName,
          lastName,
          username: user.$id, // Use auth ID as username
          email,
          profileImageUrl,
          headerImageUrl,
          createdAt: new Date().toISOString(),
        });
        dispatch(setAuthId(user.$id));
        dispatch(setIsAuth(true));
        router.push(`/profile/${user.$id}`);
      } catch (error: any) {
        console.error('OAuth callback error:', error.message || error);
        setError(error.message || 'Authentication failed. Please try again.');
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
        `${window.location.origin}/signup?error=auth_failed`
      );
    } catch (error: any) {
      console.error('Google signup error:', error.message || error);
      setError(error.message || 'Google signup failed. Please try again.');
      router.push('/signup?error=google_auth_failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-red-600 bg-red-100 px-4 py-2 rounded-md"
        >
          {error}
        </motion.div>
      )}
      <canvas ref={canvasRef} width="768" height="768" style={{ display: 'none' }} />
      <canvas ref={headerCanvasRef} width="1000" height="500" style={{ display: 'none' }} />
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

export default function LoginAuth() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <LoginAuthContent />
    </Suspense>
  );
}