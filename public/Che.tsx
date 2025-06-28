'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, User2, UserCheck, Calendar, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { account, databases, storage } from '../../lib/appwrite';
import { ID, Query, OAuthProvider } from 'appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState<'next' | 'submit' | 'google' | null>(null);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For profile image
  const headerCanvasRef = useRef<HTMLCanvasElement>(null); // For header image

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();
  const searchParams = useSearchParams();

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
    provider: '',
  });

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  

  // Check if username or email exists
  const checkUsernameAndEmailExists = async (username: string, email: string) => {
    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      return { usernameExists: false, emailExists: false };
    }
    try {
      const queries = [];
      if (username) queries.push(Query.equal('username', username));
      if (email) queries.push(Query.equal('email', email));
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
      return {
        usernameExists: username ? response.documents.some((doc) => doc.username === username) : false,
        emailExists: email ? response.documents.some((doc) => doc.email === email) : false,
      };
    } catch (err: any) {
      console.error('Error checking username or email:', err);
      setError('Error checking username or email. Please try again or contact support.');
      return { usernameExists: false, emailExists: false };
    }
  };

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Random color generator
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate profile image (768x768, 1:1 aspect ratio)
  const generateProfileImage = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Profile canvas not found');
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Profile canvas context not available');
      }

      const text = `${formData.firstName} ${formData.lastName}`.trim();
      const [line1, line2] = text.includes(' ') ? text.split(/ (.+)/) : [text, ''];

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, getRandomColor());
      gradient.addColorStop(1, getRandomColor());

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 110px Arial';

      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 40);
      if (line2) {
        ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 80);
      }

      let quality = 0.6;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to generate profile image');
          }
          if (blob.size / 1024 > 50 && quality > 0.1) {
            quality -= 0.05;
            canvas.toBlob(
              (newBlob) => resolve(newBlob || blob),
              'image/jpeg',
              quality
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    });
  };

  // Generate header image (1000x500, 2:1 aspect ratio)
  const generateHeaderImage = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = headerCanvasRef.current;
      if (!canvas) {
        throw new Error('Header canvas not found');
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Header canvas context not available');
      }

      const text = `${formData.firstName} ${formData.lastName}`.trim();

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, getRandomColor());
      gradient.addColorStop(1, getRandomColor());

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 80px Arial';

      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 30);

      let quality = 0.6;
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Failed to generate header image');
          if (blob.size / 1024 > 50 && quality > 0.1) {
            quality -= 0.05;
            canvas.toBlob(
              (newBlob) => resolve(newBlob || blob),
              'image/jpeg',
              quality
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        quality
      );
    });
  };

  // Save user data to database
  const saveUserData = async (userId: string) => {
    if (!DATABASE_ID || !BUCKET_ID) {
      setError('Database or storage bucket ID is not configured');
      return false;
    }

    try {
      let profileImageUrl = '';
      try {
        const profileBlob = await generateProfileImage();
        const profileFile = new File([profileBlob], `${userId}-profile.jpg`, { type: 'image/jpeg' });
        const profileResponse = await storage.createFile(BUCKET_ID, ID.unique(), profileFile);
        profileImageUrl = storage.getFileView(BUCKET_ID, profileResponse.$id).toString();
      } catch (imageErr: any) {
        console.error('Error generating or uploading profile image:', imageErr);
        setError('Failed to generate or upload profile image. Please try again.');
        return false;
      }

      let headerImageUrl = '';
      try {
        const headerBlob = await generateHeaderImage();
        const headerFile = new File([headerBlob], `${userId}-header.jpg`, { type: 'image/jpeg' });
        const headerResponse = await storage.createFile(BUCKET_ID, ID.unique(), headerFile);
        headerImageUrl = storage.getFileView(BUCKET_ID, headerResponse.$id).toString();
      } catch (imageErr: any) {
        console.error('Error generating or uploading header image:', imageErr);
        setError('Failed to generate or upload header image. Please try again.');
        return false;
      }

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: userId,
        email: formData.email,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        profileImageUrl,
        headerImageUrl,
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (err: any) {
      console.error('Error saving user data:', err);
      setError(err.message || 'Something went wrong during signup.');
      return false;
    }
  };

  // Handle Google OAuth signup and auto-save
  useEffect(() => {
    if (isAuth && authId) {
      return router.push(`profile/${authId}`);
    }

    const provider = searchParams.get('provider');
    if (provider === 'google') {
      setIsLoading('google');
      setProgress(0);
      account.get().then(async (user) => {
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const email = user.email || '';
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        const username = await generateUniqueUsername(baseUsername);

        
        
       await databases.createDocument(DATABASE_ID, COLLECTION_ID, user.$id, {
        firstName: firstName,
        lastName: lastName,
        username: user.$id,
        email: email,

        createdAt: new Date().toISOString(),
      });

        try {
          const progressInterval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
          }, 200);

          try {
            const session = await account.getSession('current');
            if (session) {
              await account.deleteSession('current');
            }
          } catch (sessionErr) {
            console.warn('No active session or error deleting:', sessionErr);
          }

          await account.create(
            username,
            email,
            undefined,
            `${firstName} ${lastName}`
          );

          await account.createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/signup?provider=google`,
            `${window.location.origin}/signup`
          );

          const success = await saveUserData(username);
          if (!success) {
            clearInterval(progressInterval);
            setIsLoading(null);
            setProgress(0);
            setError('Failed to save user data.');
            return;
          }

          clearInterval(progressInterval);
          setProgress(100);
          dispatch(setAuthId(username));
          dispatch(setIsAuth(true));
          router.push(`/profile/${username}`);
        } catch (err: any) {
          console.error('Error during Google signup:', err);
          setError(err.message || 'Google signup failed.');
          setIsLoading(null);
          setProgress(0);
        }
      }).catch((err) => {
        console.error('Error fetching OAuth user:', err);
        setError('Failed to retrieve OAuth user data.');
        setIsLoading(null);
        setProgress(0);
      });
    }
  }, [isAuth, authId, searchParams]);

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading('next');
    setError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setProgress(0);

    if (step === 1 && (!formData.firstName.trim() || !formData.lastName.trim())) {
      setError('Please fill in both first name and last name.');
      setIsLoading(null);
      setProgress(0);
      return;
    }

    if (step === 2) {
      if (!formData.username.trim() || !formData.email.trim()) {
        setError('Please fill in both username and email.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(formData.username)) {
        setUsernameError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      const { usernameExists, emailExists } = await checkUsernameAndEmailExists(formData.username, formData.email);
      if (usernameExists) {
        setUsernameError('Username already taken.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      if (emailExists) {
        setEmailError('Email already in use.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
    }

    if (step === 3) {
      if (!formData.gender.trim() || !formData.dob.trim() || !formData.address.trim()) {
        setError('Please fill in gender, date of birth, and address.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
      const age = calculateAge(formData.dob);
      if (age < 18) {
        setError('You must be at least 18 years old to register.');
        setIsLoading(null);
        setProgress(0);
        return;
      }
    }

    if (step === 4) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#_?&])[A-Za-z\d@$!%*#_?&]{8,}$/;
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
    setEmailError('');
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading('submit');
    setError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      try {
        const session = await account.getSession('current');
        if (session) {
          await account.deleteSession('current');
        }
      } catch (sessionErr) {
        console.warn('No active session or error deleting:', sessionErr);
      }

      await account.create(
        formData.username,
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`
      );

      await account.createEmailPasswordSession(formData.email, formData.password);

      const success = await saveUserData(formData.username);
      if (!success) {
        clearInterval(progressInterval);
        setIsLoading(null);
        setProgress(0);
        return;
      }

      clearInterval(progressInterval);
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
      router.push(`/profile/${formData.username}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during signup.');
      if (err.message.includes('User already exists')) {
        setUsernameError('This username is already taken.');
        setEmailError('This email is already in use.');
      }
    } finally {
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
        `${window.location.origin}/signup?provider=google`,
        `${window.location.origin}/signup`
      );
    } catch (err: any) {
      setError(err.message || 'Google signup failed.');
      setIsLoading(null);
      setProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'username') setUsernameError('');
    if (e.target.name === 'email') setEmailError('');
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') setPasswordError('');
    if (e.target.name === 'dob') setError('');
  };

  const today = new Date().toISOString().split('T')[0];

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
      className="bg-[#121212] flex items-center justify-center min-h-[75vh] p-4"
    >
      <div className="w-full max-w-md p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Register an account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <canvas ref={canvasRef} width="768" height="768" style={{ display: 'none' }} />
        <canvas ref={headerCanvasRef} width="1000" height="500" style={{ display: 'none' }} />

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
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleGoogleSignup}
                    disabled={isLoading !== null}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center"
                  >
                    <FaGoogle className="h-5 w-5 mr-2" />
                    Google
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
                <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
              {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
              <p className="text-xs text-gray-400 mt-1">Choose a unique username for your account (3-20 chars, letters, numbers, underscores only).</p>
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
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
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
              <p className="text-sm text-gray-500 mb-2">Provide your gender, date of birth, and address. You must be at least 18 years old.</p>
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
                  max={today}
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