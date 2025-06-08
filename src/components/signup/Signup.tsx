'use client';

import { useState, useEffect } from 'react';
import { Mail, User2,User, UserCheck, Calendar, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState<'next' | 'submit' | 'google' | 'facebook' | null>(null); // Track loading actions
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0); // Progress bar value (0-100)
  const [showPassword, setShowPassword] = useState(false); // Password visibility state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    password: '',
  });

  const handleNext = () => {
    if (isLoading) return;
    setIsLoading('next');
    setError('');
    setProgress(0);

    if (step === 1 && (!formData.firstName || !formData.lastName)) {
      setError('Please fill in both first name and last name.');
      setIsLoading(null);
      setProgress(0);
      return;
    }
    if (step === 2 && (!formData.username || !formData.email)) {
      setError('Please fill in both username and email.');
      setIsLoading(null);
      setProgress(0);
      return;
    }
    if (step === 3 && (!formData.gender || !formData.dob || !formData.address)) {
      setError('Please fill in gender, date of birth, and address.');
      setIsLoading(null);
      setProgress(0);
      return;
    }
    if (step === 4) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters with letters, numbers, and symbols (e.g., @$!%*#?&).');
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading('submit');
    setError('');
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      clearInterval(progressInterval);
      setProgress(100);
      console.log('Signup successful', formData);
      // Redirect or set auth state here
    } catch (err) {
      setError('An error occurred during signup.');
    } finally {
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleGoogleSignup = () => {
    if (isLoading) return;
    setIsLoading('google');
    setProgress(0);
    console.log('Signing up with Google...');
    setTimeout(() => {
      setProgress(100);
      setIsLoading(null);
      setProgress(0);
      console.log('Google signup successful');
      // Redirect or set auth state here
    }, 1000);
  };

  const handleFacebookSignup = () => {
    if (isLoading) return;
    setIsLoading('facebook');
    setProgress(0);
    console.log('Signing up with Facebook...');
    setTimeout(() => {
      setProgress(100);
      setIsLoading(null);
      setProgress(0);
      console.log('Facebook signup successful');
      // Redirect or set auth state here
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      className="min-h-[70vh] bg-[#121212] flex items-center justify-center p-4"
    >
      {/* Simulated Navigation (replace with actual Navbar if needed) */}
      <div className="fixed top-0 left-0 w-full bg-[#121212] p-4 z-10">
        <h1 className="text-xl font-bold text-gray-200">AsbeatCloud</h1>
      </div>

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

      <div className="w-full max-w-md  p-6 rounded-lg mt-20">
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
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Gmail"
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
              <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters with letters, numbers, and symbols (e.g., @$!%*#?&).</p>
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