'use client';

import { useState } from 'react';
import { Mail, User2, User, UserCheck, Calendar, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { account, databases, OAuthProvider } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState<'next' | 'submit' | 'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';

  // Check if username exists
  const checkUsernameExists = async (username: string) => {
    if (!DATABASE_ID) {
      setUsernameError('Database ID is not configured');
      return false;
    }
    try {
      console.log('Checking username with DATABASE_ID:', DATABASE_ID, 'COLLECTION_ID:', COLLECTION_ID);
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('username', username),
      ]);
      return response.documents.length > 0;
    } catch (err: any) {
      console.error('Error checking username:', err);
      setUsernameError('Error checking username. Please try again or contact support.');
      return false;
    }
  };

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading('next');
    setError('');
    setUsernameError('');
    setProgress(0);

    // Step 1: Validate first name and last name
    if (step === 1 && (!formData.firstName.trim() || !formData.lastName.trim())) {
      setError('Please fill in both first name and last name.');
      setIsLoading(null);
      setProgress(0);
      return;
    }

    // Step 2: Validate username and email, check username existence
    if (step === 2) {
      if (!formData.username.trim() || !formData.email.trim()) {
        setError('Please fill in both username and email.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      // Validate username format (e.g., alphanumeric and underscores, 3-20 chars)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(formData.username)) {
        setUsernameError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      // Check if username exists
      const usernameExists = await checkUsernameExists(formData.username);
      if (usernameExists) {
        setUsernameError('Username already taken.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
    }

    // Step 3: Validate gender, date of birth, and address
    if (step === 3 && (!formData.gender.trim() || !formData.dob.trim() || !formData.address.trim())) {
      setError('Please fill in gender, date of birth, and address.');
      setIsLoading(null);
      setProgress(0);
      return;
    }

    // Step 4: Validate password
    if (step === 4) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters with letters, numbers, and symbols (e.g., @$!%*#?&).');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
    }

    setError('');
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setStep(step + 1);
      setIsLoading(null);
      setProgress(0);
    }, 1000);
  };

  const handleBack = () => {
    if (isLoading) return;
    setStep(step - 1);
    setUsernameError('');
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading('submit');
    setError('');
    setUsernameError('');
    setPasswordError('');
    setProgress(0);

    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      setIsLoading(null);
      setProgress(0);
      return;
    }

    let progressInterval;
    try {
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      // Check and remove any active session
      try {
        const session = await account.getSession('current');
        if (session) {
          await account.deleteSession('current');
        }
      } catch (sessionErr) {
        console.warn('No active session or error deleting:', sessionErr);
      }

      // Create user account with username as userId
      await account.create(
        formData.username,
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`
      );

      // Log the user in after account creation
      await account.createEmailPasswordSession(formData.email, formData.password);

      // Save user data to database
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, formData.username, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        createdAt: new Date().toISOString(),
      });

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(100);
      await account
        .get()
        .then((user) => {
          dispatch(setAuthId(user.$id));
          dispatch(setIsAuth(true));
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
      // Replace with your redirect logic
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Something went wrong during signup.');
      if (err.message.includes('User already exists')) {
        setUsernameError('This username is already taken.');
      }
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleGoogleSignup = () => {
    if (isLoading) return;
    setIsLoading('google');
    setProgress(0);

    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/signup`
      );
    } catch (err: any) {
      setError(err.message || 'Google signup failed.');
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleFacebookSignup = () => {
    if (isLoading) return;
    setIsLoading('facebook');
    setProgress(0);
    console.log('Facebook signup not implemented. Enable Facebook OAuth in Appwrite Console.');
    setTimeout(() => {
      setProgress(100);
      setIsLoading(null);
      setProgress(0);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'username') setUsernameError('');
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') setPasswordError('');
  };

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeInOut' },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#121212] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Register an account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <AnimatePresence mode="wait" custom={step > 1 ? 1 : -1}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={-1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 my-16"
            >
              <h3 className="text-lg text-gray-400 mb-4">Step 1: Enter Your Personal Details</h3>
              <p className="text-sm text-gray-500 mb-2">Provide your basic personal information to get started.</p>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <motion.button
                onClick={handleNext}
                disabled={isLoading !== null}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 flex items-center justify-center"
              >
                Next
              </motion.button>
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm mb-2">Or sign up with</p>
                <div className="flex space-x-4">
                  <motion.button
                    onClick={handleGoogleSignup}
                    disabled={isLoading !== null}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-1/2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
                  >
                    <FaGoogle className="h-5 w-5 mr-2" />
                    Google
                  </motion.button>
                  <motion.button
                    onClick={handleFacebookSignup}
                    disabled={isLoading !== null}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-1/2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                  >
                    <FaFacebook className="h-5 w-5 mr-2" />
                    Facebook
                  </motion.button>
                </div>
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 hover:underline">
                  Login
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 my-16"
            >
              <h3 className="text-lg text-gray-400 mb-4">Step 2: Set Up Your Account Credentials</h3>
              <p className="text-sm text-gray-500 mb-2">Choose a unique username and provide a valid email address.</p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Choose a unique username for your account (3-20 chars, letters, numbers, underscores only).</p>
              {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="flex justify-between">
                <motion.button
                  onClick={handleBack}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 my-16"
            >
              <h3 className="text-lg text-gray-400 mb-4">Step 3: Add Additional Details</h3>
              <p className="text-sm text-gray-500 mb-2">Provide your gender, date of birth, and address.</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full Address"
                  className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="flex justify-between">
                <motion.button
                  onClick={handleBack}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 my-16"
            >
              <h3 className="text-lg text-gray-400 mb-4">Step 4: Set Your Password</h3>
              <p className="text-sm text-gray-500 mb-2">Create a secure password to protect your account.</p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters with letters, numbers, and symbols (e.g., @$!%*#?&).
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-10 py-2 bg-[#2A2A2A] text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              <div className="flex justify-between">
                <motion.button
                  onClick={handleBack}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading !== null}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200"
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}