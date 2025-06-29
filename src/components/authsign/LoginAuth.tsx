'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { account } from '@/lib/appwrite';
import { OAuthProvider } from 'appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import { useRouter } from 'next/navigation';

function LoginAuthContent() {
  const authId = useAppSelector((state) => state.authId.value);
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null); // Profile image
  const headerCanvasRef = useRef<HTMLCanvasElement>(null); // Header image

  const handleGoogleSignup = async () => {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        'https://asbeatcloud.vercel.app/provider', // ✅ Appwrite will redirect here
        'https://asbeatcloud.vercel.app/login'          // ❌ Appwrite will redirect here if failed
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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginAuthContent />
    </Suspense>
  );
}