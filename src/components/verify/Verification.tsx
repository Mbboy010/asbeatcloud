"use client";

import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';


export default function Verification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('mbboy010@gmail.com');
  const [isLoading, setIsLoading] = useState<'verify' | 'resend' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('verify');
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      if (verificationCode === '123456') {
        setSuccess('Verification successful!');
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
    setResendDisabled(true);
    setTimeLeft(300);

    try {
      
      setSuccess('Verification code resent successfully!');
      console.log('Resend result:', result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification code');
      console.error('Error resending code:', error);
    } finally {
      setIsLoading(null);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div className="min-h-[65vh] flex p-4 justify-center items-center">
      <div className="w-full max-w-md p-6 mt-20">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Verify Your Account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              required
            />
          </div>
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
    </motion.div>
  );
}