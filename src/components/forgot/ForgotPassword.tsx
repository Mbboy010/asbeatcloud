'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { databases, account } from '../../lib/appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { sendMessage } from '@/utils/sendMessage';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import { Query } from 'appwrite';

interface UserDocument {
  email?: string;
  firstName?: string;
  lastName?: string;
  resetCode?: number;
  resetTargetTime?: number;
}

export default function ForgotPassword() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || '6849aa4f000c032527a9';
  const gId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [authId, setAuthId] = useState<string>('');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<'submit' | 'verify' | 'reset' | 'resend' | 'login' | 'profile' | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Set to true initially
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize step and email from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem('resetStep');
    const savedEmail = localStorage.getItem('resetEmail');
    const savedResetTargetTime = localStorage.getItem('resetTargetTime');
    if (savedStep && savedEmail) {
      const stepNum = parseInt(savedStep, 10);
      if (stepNum === 2) {
        setStep(stepNum);
        setEmail(savedEmail);
        if (savedResetTargetTime) {
          const targetTime = Number(savedResetTargetTime);
          const diffSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
          setTimeLeft(diffSeconds);
          setResendDisabled(diffSeconds > 0);
        }
      }
    }
    // Simulate initial loading delay (e.g., 1 second) to mimic data fetching
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Save step and email to localStorage when they change
  useEffect(() => {
    if (step === 2) {
      localStorage.setItem('resetStep', step.toString());
      localStorage.setItem('resetEmail', email);
    }
  }, [step, email]);

  // Fetch authId based on email
  useEffect(() => {
    const fetchDb = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.equal('email', email),
        ]);
        if (response.documents.length > 0) {
          const document = response.documents[0];
          setAuthId(document.$id);
          setNewPassword(document.password || '');
        } else {
          setError('No account found with this email');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      }
    };

    if (email && step === 1) {
      fetchDb();
    }
  }, [email, step, DATABASE_ID, COLLECTION_ID]);

  // Check for existing reset code and timer on step 2
  useEffect(() => {
    if (step !== 2 || !authId || !isAuth) return;

    const fetchResetData = async () => {
      setIsInitialLoading(true);
      try {
        if (!DATABASE_ID || !COLLECTION_ID) {
          throw new Error('Database configuration is missing');
        }

        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId);
        const storedResetTargetTime = localStorage.getItem('resetTargetTime');
        let targetTime = response.resetTargetTime;

        if (!targetTime || Date.now() > targetTime) {
          const codeG = Math.floor(100000 + Math.random() * 900000);
          const dte = new Date();
          targetTime = dte.getTime() + 5 * 60 * 1000;

          await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId, {
            resetCode: codeG,
            resetTargetTime: targetTime,
          });

          await sendMessage({
            to: response.email,
            subject: 'Your password reset code',
            text1: `${response.firstName || ''} ${response.lastName || ''}`,
            text2: `${codeG}`,
          });

          setSuccessMessage('Reset code sent successfully!');
          localStorage.setItem('resetTargetTime', targetTime.toString());
        } else if (storedResetTargetTime && Number(storedResetTargetTime) === targetTime) {
          targetTime = Number(storedResetTargetTime);
        } else {
          localStorage.setItem('resetTargetTime', targetTime.toString());
        }

        const diffSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
        setTimeLeft(diffSeconds);
        setResendDisabled(diffSeconds > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize reset process');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchResetData();
  }, [step, authId, isAuth, DATABASE_ID, COLLECTION_ID]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendDisabled && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime <= 0) {
            setResendDisabled(false);
            localStorage.removeItem('resetTargetTime');
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendDisabled, timeLeft]);

  // Clear localStorage after 30 minutes
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.removeItem('resetStep');
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetTargetTime');
      setTimeLeft(0);
      setResendDisabled(false);
      setStep(1);
    }, 30 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('submit');
    setError('');
    setSuccessMessage('');

    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('email', email),
      ]);

      if (response.documents.length === 0) {
        throw new Error('No account found with this email');
      }

      const user = response.documents[0];
      const userId = user.$id;
      const codeG = Math.floor(100000 + Math.random() * 900000);
      const dte = new Date();
      const resetTargetTime = dte.getTime() + 5 * 60 * 1000;

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userId, {
        resetCode: codeG,
        resetTargetTime,
      });

      await sendMessage({
        to: user.email,
        subject: 'Your password reset code',
        text1: `${user.firstName || ''} ${user.lastName || ''}`,
        text2: `${codeG}`,
      });

      setAuthId(userId);
      setStep(2);
      setSuccessMessage('Recovery email sent! Check your inbox for the reset code.');
      setResendDisabled(true);
      setTimeLeft(5 * 60);
      localStorage.setItem('resetTargetTime', resetTargetTime.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send recovery email');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('verify');
    setError('');
    setSuccessMessage('');

    if (!/^\d{6}$/.test(code)) {
      setError('Verification code must be 6 digits');
      setIsLoading(null);
      return;
    }

    try {
      const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId);
      if (response.resetTargetTime && Date.now() > response.resetTargetTime) {
        setError('Reset code has expired');
        setIsLoading(null);
        return;
      }

      const inputCode = Number(code);
      if (response.resetCode === inputCode) {
        setStep(3);
        setSuccessMessage('Code verified successfully!');
      } else {
        throw new Error('Invalid reset code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('reset');
    setError('');
    setSuccessMessage('');

    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password?userId=${authId}&secret=[SECRET]`
      );

      setSuccessMessage('Password reset link sent! Check your email to complete the reset.');
      localStorage.removeItem('resetStep');
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetTargetTime');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate password reset');
    } finally {
      setIsLoading(null);
    }
  };

  const handleResendCode = async () => {
    if (isLoading || resendDisabled) return;
    setIsLoading('resend');
    setError('');
    setSuccessMessage('');

    try {
      const codeG = Math.floor(100000 + Math.random() * 900000);
      const dte = new Date();
      const resetTargetTime = dte.getTime() + 5 * 60 * 1000;

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId, {
        resetCode: codeG,
        resetTargetTime,
      });

      const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId);
      await sendMessage({
        to: response.email,
        subject: 'Your password reset code',
        text1: `${response.firstName || ''} ${response.lastName || ''}`,
        text2: `${codeG}`,
      });

      setSuccessMessage('Reset code resent successfully!');
      setResendDisabled(true);
      setTimeLeft(5 * 60);
      localStorage.setItem('resetTargetTime', resetTargetTime.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend reset code');
      setResendDisabled(false);
      setTimeLeft(0);
      localStorage.removeItem('resetTargetTime');
    } finally {
      setIsLoading(null);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Enhanced Skeleton Loader Component
  const SkeletonLoader = ({ step }: { step: number }) => (
    <div className="w-full max-w-md p-6 rounded-lg mt-8 ">
      <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-6 animate-pulse"></div>
      <div className="space-y-4">
        {step === 1 && (
          <>
            <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto animate-pulse"></div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-10 bg-gray-700 rounded w-full pl-10 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="h-10 bg-gray-700 rounded w-full pl-10 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-10 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ x: '0vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="min-h-[55vh] flex p-4 justify-center items-center"
    >
      {isInitialLoading ? (
        <SkeletonLoader step={step} />
      ) : (
        <div className="w-full max-w-md p-6 rounded-lg bg-[#2A2A2A] shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify Reset Code'}
            {step === 3 && 'Reset Your Password'}
          </h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-4 text-center">{successMessage}</p>}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-gray-400 text-sm mb-2 text-center">
                To reset your password enter your email for confirmation and we will send a reset code to your email
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                {isLoading === 'submit' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Reset Link'}
              </motion.button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleCodeVerify} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit reset code"
                  maxLength={6}
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading !== null}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale:0.95 }}
                className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
              >
                {isLoading === 'verify' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Code'}
              </motion.button>
              <p className="text-gray-400 text-sm mb-2 text-center">
                Check your reset code in this email <span className="text-gray-300 font-semibold">{email}</span>
              </p>
              <p className="text-center text-gray-400 mt-4 text-sm">
                Didn’t receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={isLoading !== null || resendDisabled}
                  aria-disabled={isLoading !== null || resendDisabled}
                  aria-label={resendDisabled ? `Resend code, disabled for ${formatTime(timeLeft)}` : 'Resend code'}
                  className="text-orange-500 hover:underline"
                >
                  {resendDisabled ? `Resend Code (${formatTime(timeLeft)})` : 'Resend Code'}
                </button>
              </p>
            </form>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="relative mb-3">
                {newPassword == '' || newPassword == null ? (
                  <p className="font-mono text-[0.8rem] text-gray-300">
                    Password not available! You may be using Google Auth.
                  </p>
                ) : (
                  <p className="font-mono text-[0.8rem] text-gray-300">
                    This is your password: <span className="text-green-500">{newPassword}</span>
                  </p>
                )}
              </div>
              {gId ? (
                <motion.button
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    router.push(`/profile/${gId}`);
                    setIsLoading('profile');
                  }}
                  className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
                >
                  {isLoading === 'profile' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Go to Profile'}
                </motion.button>
              ) : (
                <motion.button
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    router.push(`/login`);
                    setIsLoading('login');
                  }}
                  className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
                >
                  {isLoading === 'login' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Go to Login'}
                </motion.button>
              )}
              <p className="text-center text-gray-400 mt-4 text-sm">
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  disabled={isLoading !== null}
                  className="text-orange-500 hover:underline"
                >
                  Back
                </button>
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

