'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, ID, account } from '../../lib/appwrite';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setNav } from '@/store/slices/navpic';

const EditProfile = () => {
  const router = useRouter();
  const userid = useAppSelector((state) => state.authId.value);
  const dispatch = useAppDispatch();

  // State for profile data, image previews, and upload indicators
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    gender: '',
    bio: '',
    address: '',
    email: '',
    profileImageUrl: '',
    headerImageUrl: '',
    profileImageId: '',
    bannerImageId: '',
    hometown: '',
    dob: '',
    genre: '',
  });
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYearError, setDobYearError] = useState('');
  const [dobMonthError, setDobMonthError] = useState('');
  const [dobDayError, setDobDayError] = useState('');
  const [dobAgeError, setDobAgeError] = useState('');
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null);
  const [previewBannerImage, setPreviewBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [isCroppingProfile, setIsCroppingProfile] = useState(false);
  const [isCroppingBanner, setIsCroppingBanner] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewProfileImage) URL.revokeObjectURL(previewProfileImage);
      if (previewBannerImage) URL.revokeObjectURL(previewBannerImage);
    };
  }, [previewProfileImage, previewBannerImage]);

  // Fetch profile data from Appwrite and split DOB
  useEffect(() => {
    if (!userid) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid as string);
        const dob = response.dob || '';
        let year = '',
          month = '',
          day = '';
        if (dob) {
          [year, month, day] = dob.split('-');
        }
        setProfile({
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          username: response.username || '',
          gender: response.gender || '',
          bio: response.bio || '',
          address: response.address || '',
          email: response.email || '',
          profileImageUrl: response.profileImageUrl || '',
          headerImageUrl: response.headerImageUrl || '',
          profileImageId: response.profileImageId || '',
          bannerImageId: response.bannerImageId || '',
          hometown: response.hometown || '',
          dob: dob,
          genre: response.genre || '',
        });
        setDobYear(year);
        setDobMonth(month);
        setDobDay(day);
        setPreviewProfileImage(response.profileImageUrl || null);
        setPreviewBannerImage(response.headerImageUrl || null);
        validateDob(year, month, day); // Validate on load
      } catch (err) {
        setError('Error fetching profile data');
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userid, DATABASE_ID]);

  // Compression function for banner image (~51KB)
  const compressTo51KB = useCallback((canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const targetSize = 51000; // ~51KB in bytes
      let quality = 0.95;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const size = blob.size;
            if (size <= targetSize || quality <= 0.01) {
              if (size <= targetSize) {
                resolve(blob);
              } else {
                reject(new Error('Could not compress to 51KB'));
              }
              return;
            }
            quality -= 0.02;
            tryCompress();
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    });
  }, []);

  // Validate Date of Birth (must be >= 18 years old as of June 23, 2025)
  const validateDob = (year: string, month: string, day: string) => {
    setDobYearError('');
    setDobMonthError('');
    setDobDayError('');
    setDobAgeError('');

    if (!year && !month && !day) {
      return; // Empty fields are valid
    }

    // Validate year
    const yearNum = parseInt(year);
    if (!year.match(/^\d{4}$/) || yearNum < 1900 || yearNum > 2007) {
      setDobYearError('Enter a valid year (1900–2007)');
      return;
    }

    // Validate month
    const monthNum = parseInt(month);
    if (!month.match(/^\d{2}$/) || monthNum < 1 || monthNum > 12) {
      setDobMonthError('Enter a valid month (01–12)');
      return;
    }

    // Validate day
    const dayNum = parseInt(day);
    const maxDays = new Date(yearNum, monthNum, 0).getDate(); // Days in month
    if (!day.match(/^\d{2}$/) || dayNum < 1 || dayNum > maxDays) {
      setDobDayError(`Enter a valid day (01–${maxDays.toString().padStart(2, '0')})`);
      return;
    }

    // Validate age
    const dobDate = new Date(yearNum, monthNum - 1, dayNum);
    const currentDate = new Date('2025-06-23');
    const age = currentDate.getFullYear() - dobDate.getFullYear();
    const monthDiff = currentDate.getMonth() - dobDate.getMonth();
    const dayDiff = currentDate.getDate() - dobDate.getDate();
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (adjustedAge < 18) {
      setDobAgeError('You must be at least 18 years old.');
    }
  };

  // Handle form submission to update profile data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      return;
    }
    if (dobYearError || dobMonthError || dobDayError || dobAgeError) {
      setError('Please fix the Date of Birth errors before saving.');
      return;
    }

    const dob = dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth}-${dobDay}` : '';
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userid as string, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        bio: profile.bio,
        address: profile.address,
        email: profile.email,
        profileImageUrl: profile.profileImageUrl,
        headerImageUrl: profile.headerImageUrl,
        profileImageId: profile.profileImageId,
        bannerImageId: profile.bannerImageId,
        hometown: profile.hometown,
        dob: dob,
        genre: profile.genre,
      });
      dispatch(setNav(profile.profileImageUrl));
      await account.updateName(profile.firstName + ' ' + profile.lastName);
      router.push(`/profile/${userid}`);
    } catch (err) {
      setError('Error updating profile data');
      console.error('Failed to update profile:', err);
    }
  };

  // Handle profile image upload with square cropping and compression
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (!BUCKET_ID) {
      setError('Storage bucket ID is not configured');
      return;
    }
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }

    setIsCroppingProfile(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas context not available');
      setIsCroppingProfile(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Step 1: Crop to square
          let sx = 0,
            sy = 0,
            sWidth = img.width,
            sHeight = img.height;
          if (img.width !== img.height) {
            const size = Math.min(img.width, img.height);
            sx = (img.width - size) / 2;
            sy = (img.height - size) / 2;
            sWidth = sHeight = size;
          }

          // Step 2: Resize to 512x512
          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;
          ctx.clearRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

          // Step 3: Compress with 70% quality
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                setError('Failed to create blob');
                setIsCroppingProfile(false);
                return;
              }
              console.log('Profile blob size:', blob.size);
              const oldPreview = previewProfileImage;
              setPreviewProfileImage(null);
              if (oldPreview) {
                URL.revokeObjectURL(oldPreview);
              }
              const previewUrl = URL.createObjectURL(blob);
              console.log('New profile preview URL:', previewUrl);
              setPreviewProfileImage(previewUrl);
              setUploadingProfileImage(true);

              try {
                const uploadFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                const response = await storage.createFile(BUCKET_ID, ID.unique(), uploadFile);
                const newProfileImageUrl = storage.getFileView(BUCKET_ID, response.$id).toString();
                console.log('Appwrite profile URL:', newProfileImageUrl);
                setProfile((prev) => ({
                  ...prev,
                  profileImageUrl: newProfileImageUrl,
                  profileImageId: response.$id,
                }));
              } catch (err: any) {
                setError(`Error uploading profile image: ${err.message || 'Unknown error'}`);
                console.error('Appwrite upload error:', err);
              } finally {
                setUploadingProfileImage(false);
                setIsCroppingProfile(false);
              }
            },
            'image/jpeg',
            0.7
          );
        } catch (err: any) {
          setError(`Error processing profile image: ${err.message || 'Unknown error'}`);
          console.error('Processing error:', err);
          setIsCroppingProfile(false);
        }
      };
      img.onerror = () => {
        setError('Failed to load image');
        console.error('Image load error');
        setIsCroppingProfile(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError('Failed to read file');
      console.error('FileReader error');
      setIsCroppingProfile(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle banner image upload with aspect ratio check
  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (!BUCKET_ID) {
      setError('Storage bucket ID is not configured');
      return;
    }
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }

    setIsCroppingBanner(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas context not available');
      setIsCroppingBanner(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        try {
          const aspectRatio = 2 / 1;
          const currentAspectRatio = img.width / img.height;
          const outputWidth = 800;
          const outputHeight = 400;

          canvas.width = outputWidth;
          canvas.height = outputHeight;
          ctx.clearRect(0, 0, outputWidth, outputHeight);

          if (Math.abs(currentAspectRatio - aspectRatio) < 0.01) {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, outputWidth, outputHeight);
          } else {
            let cropWidth = img.width;
            let cropHeight = cropWidth / aspectRatio;

            if (cropHeight > img.height) {
              cropHeight = img.height;
              cropWidth = cropHeight * aspectRatio;
            }

            const cropX = (img.width - cropWidth) / 2;
            const cropY = (img.height - cropHeight) / 2;

            ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
          }

          const compressedBlob = await compressTo51KB(canvas);
          const oldPreview = previewBannerImage;
          setPreviewBannerImage(null);
          if (oldPreview) {
            URL.revokeObjectURL(oldPreview);
          }
          const previewUrl = URL.createObjectURL(compressedBlob);
          console.log('New banner preview URL:', previewUrl);
          setPreviewBannerImage(previewUrl);
          setUploadingBannerImage(true);

          try {
            const uploadFile = new File([compressedBlob], 'banner.jpg', { type: 'image/jpeg' });
            const response = await storage.createFile(BUCKET_ID, ID.unique(), uploadFile);
            const newBannerUrl = storage.getFileView(BUCKET_ID, response.$id).toString();
            console.log('Appwrite banner URL:', newBannerUrl);
            setProfile((prev) => ({
              ...prev,
              headerImageUrl: newBannerUrl,
              bannerImageId: response.$id,
            }));
          } catch (err: any) {
            setError(`Error uploading banner image: ${err.message || 'Unknown error'}`);
            console.error('Appwrite upload error:', err);
          } finally {
            setUploadingBannerImage(false);
            setIsCroppingBanner(false);
          }
        } catch (err: any) {
          setError(`Error processing banner image: ${err.message || 'Unknown error'}`);
          console.error('Processing error:', err);
          setIsCroppingBanner(false);
        }
      };
      img.onerror = () => {
        setError('Failed to load image');
        console.error('Image load error');
        setIsCroppingBanner(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError('Failed to read file');
      console.error('FileReader error');
      setIsCroppingBanner(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle DOB input changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value.replace(/[^0-9]/g, ''); // Numbers only

    if (name === 'dobYear') {
      setDobYear(formattedValue.slice(0, 4));
    } else if (name === 'dobMonth') {
      if (formattedValue.length <= 2) {
        setDobMonth(formattedValue);
      }
    } else if (name === 'dobDay') {
      if (formattedValue.length <= 2) {
        setDobDay(formattedValue);
      }
    }

    // Validate after updating state
    const newYear = name === 'dobYear' ? formattedValue.slice(0, 4) : dobYear;
    const newMonth = name === 'dobMonth' ? formattedValue.slice(0, 2) : dobMonth;
    const newDay = name === 'dobDay' ? formattedValue.slice(0, 2) : dobDay;
    validateDob(newYear, newMonth, newDay);
  };

  // Handle other input changes (excluding email, username, and DOB)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name !== 'email' && name !== 'username' && !['dobYear', 'dobMonth', 'dobDay'].includes(name)) {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle navigation to change password page
  const handleChangePassword = () => {
    router.push(`/change-password/${userid}`);
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="min-h-screen text-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto backdrop-blur-md rounded-xl shadow-2xl p-8 border border-gray-800"
      >
        <h1 className="text-2xl font-bold mb-6 text-orange-500 text-center">Edit Your Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          {/* Banner Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
            <div className="relative">
              <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingBannerImage || isCroppingBanner ? (
                  <div className="w-8 h-8 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewBannerImage ? (
                  <img
                    src={previewBannerImage}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    key={previewBannerImage}
                  />
                ) : (
                  <span className="text-gray-500">No banner image selected</span>
                )}
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="file"
                accept="image/*"
                onChange={handleBannerImageChange}
                ref={bannerImageRef}
                className="absolute inset-0 w-full h-32 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                Click to upload or drag and drop
              </div>
            </div>
          </div>

          {/* Profile Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image</label>
            <div className="relative">
              <div className="w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingProfileImage || isCroppingProfile ? (
                  <div className="w-8 h-8 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewProfileImage ? (
                  <img
                    src={previewProfileImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    key={previewProfileImage}
                  />
                ) : (
                  <span className="text-gray-500">No profile image selected</span>
                )}
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                ref={profileImageRef}
                className="absolute inset-0 w-full h-48 opacity-0 cursor-pointer z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                Click to upload or drag and drop
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="username"
              value={profile.username}
              disabled
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-not-allowed text-gray-400"
              placeholder="Username (not editable)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-not-allowed text-gray-400"
              placeholder="Email (not editable)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </motion.select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 h-24 resize-none placeholder-gray-500"
              placeholder="Enter a brief bio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Hometown</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="hometown"
              value={profile.hometown}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter hometown"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
            {dobAgeError && <p className="text-red-500 text-sm mb-2">{dobAgeError}</p>}
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobYear"
                  value={dobYear}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="YYYY"
                  maxLength={4}
                />
                {dobYearError && <p className="text-red-500 text-xs mt-1">{dobYearError}</p>}
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobMonth"
                  value={dobMonth}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="MM"
                  maxLength={2}
                />
                {dobMonthError && <p className="text-red-500 text-xs mt-1">{dobMonthError}</p>}
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobDay"
                  value={dobDay}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="DD"
                  maxLength={2}
                />
                {dobDayError && <p className="text-red-500 text-xs mt-1">{dobDayError}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="genre"
              value={profile.genre}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter genre"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          >
            Save Changes
          </motion.button>
          <div className="text-center mt-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              className="text-orange-500 hover:text-orange-600 cursor-pointer underline"
            >
              Change Password
            </motion.a>
          </div>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </motion.div>
    </div>
  );
};

export default EditProfile;