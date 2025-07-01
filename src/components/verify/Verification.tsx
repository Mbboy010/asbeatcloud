"use client";

import { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { sendMessage } from '@/utils/sendMessage';

interface UserDocument {
  verified: boolean;
  verifyCode?: number;
  targetTimeV?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export default function Verification() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || '6849aa4f000c032527a9';

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();

  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState<'verify' | 'resend' | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // New state for initial fetch
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch user data and send verification code
  useEffect(() => {
    if (!isAuth || !authId) {
      return router.push('/login');
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      setIsInitialLoading(false);
      return;
    }

    const fetchFunc = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          authId
        );

        // Calculate timeLeft from currentTime and targetTimeV
        if (response.currentTime && response.targetTimeV) {
          const targetTimeMs = response.targetTimeV;
          const diffSeconds = Math.max(0, Math.floor((targetTimeMs - Date.now()) / 1000));
          setTimeLeft(diffSeconds);
          setResendDisabled(diffSeconds > 0);
        } else {
          // Send new verification code and start countdown
          const codeG = Math.floor(100000 + Math.random() * 900000);
          const dte = new Date();
          const vcurrentTime = dte.getTime();
          const vtargetTime = dte.getTime() + 5 * 60 * 1000;
          await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId, {
            verifyCode: codeG,
            currentTime: vcurrentTime,
            targetTimeV: vtargetTime,
          });

          await sendMessage({
            to: response.email,
            subject: 'Your verification code is',
            text1: `${response.firstName} ${response.lastName}`,
            text2: `${codeG}`,
          });

          setTimeLeft(5 * 60);
          setResendDisabled(true);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch user data');
      } finally {
        setIsInitialLoading(false); // Stop initial loading
      }
    };

    fetchFunc();
  }, [isAuth, authId]);

  // Real-time countdown for timeLeft
  useEffect(() => {
    if (resendDisabled && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          if (newTimeLeft <= 0) {
            setResendDisabled(false);
            return 0;
          }
          return newTimeLeft;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDisabled, timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('verify');
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Verification code must be 6 digits');
      setIsLoading(null);
      return;
    }

    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        authId!
      );

      if (response.targetTimeV && Date.now() > response.targetTimeV) {
        setError('Verification code has expired');
        setIsLoading(null);
        return;
      }

      const inputCode = Number(verificationCode);
      if (response.verifyCode === inputCode) {
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId!, {
          verified: true,
          verifyCode: null,
          currentTime: null,
          targetTimeV: null,
        });
        setSuccess('Verification successful!');
        setTimeout(() => router.push(`/profile/${authId}`), 2000);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsLoading(null);
    }
  };

  const handleResendCode = async () => {
    if (isLoading || resendDisabled) return;
    setIsLoading('resend');
    setError('');
    setSuccess('');

    try {
      const codeG = Math.floor(100000 + Math.random() * 900000);
      const dte = new Date();
      const vcurrentTime = dte.getTime();
      const vtargetTime = dte.getTime() + 5 * 60 * 1000;
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId!, {
        verifyCode: codeG,
        currentTime: vcurrentTime,
        targetTimeV: vtargetTime,
      });

      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        authId!
      );

      await sendMessage({
        to: response.email,
        subject: 'Your verification code is',
        text1: `${response.firstName} ${response.lastName}`,
        text2: `${codeG}`,
      });

      setSuccess('Verification code resent successfully!');
      setResendDisabled(true);
      setTimeLeft(5 * 60);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification code');
    } finally {
      setIsLoading(null);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Skeleton UI component
  const SkeletonLoader = () => (
    <div className="w-full max-w-md p-6 mt-20">
      <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
      <div className="space-y-4">
        <div className="relative">
          <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <motion.div className="min-h-[65vh] flex p-4 justify-center items-center">
      {isInitialLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="w-full max-w-md p-6 mt-20">
          <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Verify Your Account</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit verification code"
                maxLength={6}
                className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading !== null}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
            >
              {isLoading === 'verify' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify'}
            </motion.button>
          </form>
          <p className="text-center text-gray-400 mt-4 text-sm">
            Didn’t receive the code?{' '}
            <button
              onClick={handleResendCode}
              disabled={isLoading !== null || resendDisabled}
              className="text-orange-500 hover:underline"
            >
              {resendDisabled ? `Resend Code (${formatTime(timeLeft)})` : 'Resend Code'}
            </button>
          </p>
          <p className="text-center text-gray-400 mt-2 text-sm">
            <Link href="/logout" className="text-orange-500 hover:underline">
              Logout
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  );
}