'use client';

import Loading from '../loading/Loading';
import React, { useState,useEffect } from 'react';
import LoginAuth from '../authsign/LoginAuth';
import { useRouter, useParams } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { account , databases} from '@/lib/appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import type { OAuthProvider } from 'appwrite';
import { welcomeBack } from '@/utils/welcomeBack';
import { wellcomeMassage } from '@/utils/wellcomeMassage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<'login' | 'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);

 const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || '6849aa4f000c032527a9';


  const dispatch = useAppDispatch();
  
  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();
  const params = useParams();
  
  
  useEffect(()=>{
    if(isAuth){
      return router.push(`profile/${authId}`)
    }
  },[authId])
  

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

      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
    await  dispatch(setAuthId(user.$id));
    await  dispatch(setIsAuth(true));
    
    const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          user.$id
        );
    
    await welcomeBack({
        to: email,
        username: `${response.firstName} ${response.lastName}`,
        profileUrl: `${window.location.origin}/profile/${user.$id}`,
      });
    
    await  router.push(`profile/${user.$id}`)
    await  clearInterval(progressInterval);
    await  setProgress(100);
      // Optional redirect:
      // window.location.href = `/profile/${user.$id}`;
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      if (progressInterval) clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(provider);
    setProgress(0);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      

      clearInterval(progressInterval);
      setProgress(100);
    } catch (err: any) {
      setError(err?.message || `OAuth (${provider}) login failed`);
      if (progressInterval) clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsLoading(null);
      setProgress(0);
    }
  };
  
  const [loadi,setLoadi] = useState<boolean>(false)
  
useEffect(() => {
  setTimeout(() =>{
    setLoadi(true)
  },2000)
},[])

  return (
    <div>
    {
      loadi ?
      
    <motion.div
      
      className="flex p-4 min-h-[75vh] justify-center items-center"
    >
      {/* Appbar */}

      {/* Progress Bar */}
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

      {/* Login Form */}
      <div className="w-full max-w-md p-6 rounded-lg ">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Login to account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 my-8">
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

        {/* Social login */}
        <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm mb-2">Or login with</p>
          <div>
          <LoginAuth />
        </div>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-orange-500 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-orange-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div> :
        <div className=" p-4">
      <Loading />
    </div>
    }
   </div>
  );
}