'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, ID, account } from '../../lib/appwrite';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setNav } from '@/store/slices/navpic';

const EditProfile = () => {
  const router = useRouter();
  const userid = useAppSelector((state) => state.authId.value);

  const dispatch = useAppDispatch();

  // State for profile data, image previews, image IDs, and upload indicators
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
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null);
  const [previewBannerImage, setPreviewBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  // Fetch profile data from Appwrite
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
          dob: response.dob || '',
          genre: response.genre || '',
        });
        setPreviewProfileImage(response.profileImageUrl || null);
        setPreviewBannerImage(response.headerImageUrl || null);
      } catch (err) {
        setError('Error fetching profile data');
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userid, DATABASE_ID]);

  // Handle form submission to update profile data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      return;
    }
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
        dob: profile.dob,
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

  // Handle profile image upload and preview
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!BUCKET_ID) {
      setError('Storage bucket ID is not configured');
      return;
    }
    setPreviewProfileImage(URL.createObjectURL(file));
    setUploadingProfileImage(true);
    try {
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const newProfileImageUrl = storage.getFileView(BUCKET_ID, response.$id);
      setProfile((prev) => ({
        ...prev,
        profileImageUrl: newProfileImageUrl, // Use the string URL directly
        profileImageId: response.$id,
      }));
    } catch (err) {
      setError('Error uploading profile image');
      console.error('Failed to upload profile image:', err);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  // Handle banner image upload and preview
  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!BUCKET_ID) {
      setError('Storage bucket ID is not configured');
      return;
    }
    setPreviewBannerImage(URL.createObjectURL(file));
    setUploadingBannerImage(true);
    try {
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const newBannerUrl = storage.getFileView(BUCKET_ID, response.$id);
      setProfile((prev) => ({
        ...prev,
        headerImageUrl: newBannerUrl, // Use the string URL directly
        bannerImageId: response.$id,
      }));
    } catch (err) {
      setError('Error uploading banner image');
      console.error('Failed to upload banner image:', err);
    } finally {
      setUploadingBannerImage(false);
    }
  };

  // Handle input changes (excluding email and username)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name !== 'email' && name !== 'username') {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-gray-900/90 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-gray-800"
      >
        <h1 className="text-2xl font-bold mb-6 text-orange-500 text-center">Edit Your Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Banner Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
            <div className="relative">
              <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingBannerImage ? (
                  <div className="w-8 h-8 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewBannerImage ? (
                  <img src={previewBannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
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

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image</label>
            <div className="relative">
              <div className="w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingProfileImage ? (
                  <div className="w-8 h-8 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewProfileImage ? (
                  <img src={previewProfileImage} alt="Profile Preview" className="w-full h-full object-cover" />
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
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter date of birth (e.g., 2 July 1991)"
            />
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
          {/* Change Password Link */}
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