'use client';

import { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<'login' | 'google' | 'facebook' | null>(null); // Track which button is loading
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0); // Progress bar value (0-100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('login');
    setError('');
    setProgress(0);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (email === 'test@example.com' && password === 'password123') {
        console.log('Login successful');
      } else {
        throw new Error('Invalid email or password');
      }

      clearInterval(progressInterval);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (progressInterval) clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading('google');
    setProgress(0);
    console.log('Logging in with Google...');
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(null);
      setProgress(0);
      console.log('Google login successful');
    }, 1000);
  };

  const handleFacebookLogin = () => {
    setIsLoading('facebook');
    setProgress(0);
    console.log('Logging in with Facebook...');
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(null);
      setProgress(0);
      console.log('Facebook login successful');
    }, 1000);
  };

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="flex p-4 justify-center items-center"
    >
      <div className="fixed top-0 left-0 w-full bg-[#121212] p-4 z-10">
        <h1 className="text-xl font-bold text-gray-200">AsbeatCloud</h1>
      </div>

      {isLoading && (
        <div className="fixed top-[4.5rem] left-0 w-full h-1 z-20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="h-full bg-orange-500"
          />
        </div>
      )}

      <div className="w-full max-w-md p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Login to account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 my-16">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
          >
            {isLoading === 'login' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
          </motion.button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm mb-2">Or login with</p>
          <div className="flex space-x-4">
            <motion.button
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-1/2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
            >
              {isLoading === 'google' ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <FaGoogle className="h-5 w-5 mr-2" />
              )}
              Google
            </motion.button>
            <motion.button
              onClick={handleFacebookLogin}
              disabled={isLoading !== null}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-1/2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              {isLoading === 'facebook' ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <FaFacebook className="h-5 w-5 mr-2" />
              )}
              Facebook
            </motion.button>
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4 text-sm">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-orange-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}