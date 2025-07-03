'use client';

import { useState, useEffect } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'; // Added Eye and EyeOff for toggle
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState<'change' | null>(null);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Simulate authenticated user email

  // Load from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('changePasswordEmail') || 'user@example.com'; // Default or from auth
    setUserEmail(savedEmail);
  }, []);
  
  useEffect(() =>{
    
  },[])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('change');
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      setIsLoading(null);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      setIsLoading(null);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      if (currentPassword === 'oldpassword123') { // Mock current password check
        console.log('Password changed successfully for email:', userEmail);
        localStorage.removeItem('changePasswordEmail'); // Clear localStorage
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully!');
      } else {
        throw new Error('Current password is incorrect.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }} // Start from the right
      animate={{ x: 0, opacity: 1 }} // Slide to center with fade-in
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="min-h-[70vh] flex p-4 justify-center items-center"
    >
      {/* Simulated Navigation (placeholder, adjust as needed) */}
      <div className="fixed top-0 left-0 w-full bg-[#121212] p-4 z-10">
        <h1 className="text-xl font-bold text-gray-200">AsbeatCloud</h1>
      </div>

      <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 mt-20">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Change Password</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
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
            disabled={isLoading !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
          >
            {isLoading === 'change' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Change Password'}
          </motion.button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-sm">
          <Link href="/profile" className="text-orange-500 hover:underline">
            Back to Profile
          </Link>
        </p>
        <p className="text-center text-gray-400 mt-2 text-sm">
          <Link href="/logout" className="text-orange-500 hover:underline">
            Logout
          </Link>
        </p>
      </div>
    </motion.div>
  );
}