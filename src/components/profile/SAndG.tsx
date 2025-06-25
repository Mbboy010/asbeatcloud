'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';

export default function SAndG() {
  const platformIcons = {
    Twitter,
    Instagram,
    Facebook,
  };

  // Get authenticated user ID from Redux store
  const userId = useAppSelector((state) => state.authId.value?.$id || null);
  const router = useRouter();
  const params = useParams();
  const useridparams = typeof params.userid === 'string' ? params.userid : null;

  // State for dynamic data
  const [userData, setUserData] = useState({
    profileImageUrl: '',
    headerImageUrl: '',
    bio: '',
    socialLinks: [
      { platform: 'Twitter', url: '', color: 'text-blue-400 hover:text-blue-300' },
      { platform: 'Instagram', url: '', color: 'text-pink-400 hover:text-pink-300' },
      { platform: 'Facebook', url: '', color: 'text-blue-600 hover:text-blue-400' },
    ],
    galleryone: '',
    gallerytwo: '',
    gallerythree: '',
    followers: 0,
    firstName: '',
    lastName: '',
    username: '',
  });

  // State for error handling
  const [error, setError] = useState('');

  // Fetch user data from Appwrite
  useEffect(() => {
    const fetchUserData = async () => {
      if (!useridparams) {
        setError('No user ID provided in URL parameters');
        return;
      }

      // Validate DATABASE_ID
      const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
      if (!DATABASE_ID) {
        setError('Database ID is not configured');
        return;
      }

      try {
        const COLLECTION_ID = '6849aa4f000c032527a9';

        // Fetch user document from the users collection
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          useridparams
        );

        setUserData({
          profileImageUrl: userDoc.profileImageUrl || '',
          headerImageUrl: userDoc.headerImageUrl || '',
          bio: userDoc.bio || '',
          socialLinks: [
            { platform: 'Twitter', url: userDoc.twitterUrl || '', color: 'text-blue-400 hover:text-blue-300' },
            { platform: 'Instagram', url: userDoc.instagramUrl || '', color: 'text-pink-400 hover:text-pink-300' },
            { platform: 'Facebook', url: userDoc.facebookUrl || '', color: 'text-blue-600 hover:text-blue-400' },
          ],
          galleryone: userDoc.galleryone || '',
          gallerytwo: userDoc.gallerytwo || '',
          gallerythree: userDoc.gallerythree || '',
          followers: userDoc.followers || 0,
          firstName: userDoc.firstName || '',
          lastName: userDoc.lastName || '',
          username: userDoc.username || '',
        });
        setError('');
      } catch (err) {
        setError(`Error fetching user data: ${err.message}`);
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [useridparams]);

  // Handle navigation to upload gallery
  const handleUploadNavigation = () => {
    router.push('/profile/upload-gallery');
  };

  return (
    <div className="p-4">
      {/* Error Display */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Social Links with Icons and Names */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connect</h3>
        <div className="flex space-x-4">
          {userData.socialLinks.map((link) => {
            const IconComponent = platformIcons[link.platform];
            return (
              <Link
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center ${link.color} transition duration-200`}
                >
                  <IconComponent className="w-6 h-6 mr-1" />
                  <span className="text-sm">{link.platform}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Image Gallery */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Gallery</h3>
          {userId && userId === useridparams && (
            <button
              onClick={handleUploadNavigation}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
            >
              Upload Image
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { url: userData.galleryone, label: 'Gallery Image 1' },
            { url: userData.gallerytwo, label: 'Gallery Image 2' },
            { url: userData.gallerythree, label: 'Gallery Image 3' },
          ].map((image, index) =>
            image.url ? (
              <img
                key={index}
                src={image.url}
                alt={`${userData.username} ${image.label}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <div
                key={index}
                className="w-full h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-200"
              >
                No Image
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}