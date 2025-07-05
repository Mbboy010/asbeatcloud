'use client';

import { useState, useEffect } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { account, databases, ID } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { passwordChanged } from '@/utils/passwordChanged';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const router = useRouter();

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || '6849aa4f000c032527a9';

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  useEffect(() => {
    // Delay auth check to ensure auth state is initialized
    const checkAuth = async () => {
      try {
        await account.get(); // Verify session
        setIsInitialLoading(false);
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and contain both letters and numbers');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      setIsLoading(false);
      return;
    }

    try {
      await account.updatePassword(newPassword, currentPassword);

      if (authId && DATABASE_ID && COLLECTION_ID) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          authId,
          {
            password: newPassword,
          }
        );
      }

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          authId!
        );
    
    await passwordChanged({
        to: response.email,
        username: `${response.firstName} ${response.lastName}`,
        profileUrl: `${window.location.origin}/profile/${authId}`,
      });

      setTimeout(() => {
        router.push(`/profile/${authId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton UI component
  const SkeletonLoader = () => (
    <div className="w-full max-w-md p-6 rounded-lg mt-8 animate-pulse">
      <div className="h-8 bg-[#2A2A2A] rounded w-3/4 mx-auto mb-6"></div>
      <div className="space-y-4">
        <div className="relative">
          <div className="h-10 bg-[#2A2A2A] rounded w-full"></div>
        </div>
        <div className="h-4 bg-[#2A2A2A] rounded w-2/3"></div>
        <div className="relative">
          <div className="h-10 bg-[#2A2A2A] rounded w-full"></div>
        </div>
        <div className="relative">
          <div className="h-10 bg-[#2A2A2A] rounded w-full"></div>
        </div>
        <div className="h-10 bg-orange-500/20 rounded w-full"></div>
        <div className="h-4 bg-[#2A2A2A] rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-[#2A2A2A] rounded w-1/3 mx-auto"></div>
      </div>
    </div>
  );

  if (isInitialLoading) {
    return (
      <div className="min-h-[55vh] flex p-4 justify-center items-center">
        <div className="fixed top-0 left-0 w-full bg-[#121212] p-4 z-10">
          <div className="h-6 bg-[#2A2A2A] rounded w-32 animate-pulse"></div>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[55vh] flex p-4 justify-center items-center"
    >
      <div className="fixed top-0 left-0 w-full bg-[#121212] p-4 z-10">
        <h1 className="text-xl font-bold text-gray-200">AsbeatCloud</h1>
      </div>

      <div className="w-full max-w-md p-6 rounded-lg mt-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Change Password</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full pl-10 pr-10 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-[0.8rem] font-mono text-gray-300">password shall be 8+ chars, letters & numbers</p>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full pl-10 pr-10 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-10 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Change Password'}
          </motion.button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-sm">
          <Link href={`/forgot-password`} className="text-orange-500 hover:underline">
            Forgot password
          </Link>
        </p>
        <p className="text-center text-gray-400 mt-4 text-sm">
          <Link href={`/profile/${authId}`} className="text-orange-500 hover:underline">
            Back to Profile
          </Link>
        </p>
      </div>
    </motion.div>
  );
}