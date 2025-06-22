'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Facebook, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';

const UserProfile = () => {
  const router = useRouter();
  const params = useParams();
  const userid = params.userid;

  const authId = useAppSelector((state) => state.authId.value);

  // Current date and time (fixed to 11:06 AM WAT, June 12, 2025)
  const currentDate = new Date('2025-06-12T11:06:00+01:00'); // WAT is UTC+1
  const lastUpdated = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Lagos',
  });

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
    galleryImages: [],
    followers: 0,
    firstName: '',
    lastName: '',
    username: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '6849aa4f000c032527a9';

  // Map of platform to icon component
  const platformIcons = {
    Twitter,
    Instagram,
    Facebook,
  };

  // Fetch user data from Appwrite
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

    const fetchUserData = async () => {
      try {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid as string);
        setUserData({
          profileImageUrl: response.profileImageUrl || 'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin',
          headerImageUrl: response.headerImageUrl || 'https://via.placeholder.com/800x200',
          bio: response.bio || 'No bio available.',
          socialLinks: [
            { platform: 'Twitter', url: response.twitterUrl || '', color: 'text-blue-400 hover:text-blue-300' },
            { platform: 'Instagram', url: response.instagramUrl || '', color: 'text-pink-400 hover:text-pink-300' },
            { platform: 'Facebook', url: response.facebookUrl || '', color: 'text-blue-600 hover:text-blue-400' },
          ],
          galleryImages: response.galleryImages || [],
          followers: response.followers || 0,
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          username: response.username || '',
        });
      } catch (err) {
        setError('Error fetching user data');
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userid, DATABASE_ID]);

  // Check if current user matches the document ID
  const isCurrentUser = authId === userid;

  // Navigate to edit page
  const handleEditProfile = () => {
    if (isCurrentUser) {
      router.push(`/profile/edit`);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error} "user:"{userid}</div>;

  return (
    <div className="text-gray-200 p-6 rounded-lg">
      {/* Header Image */}
      <div className="w-full h-32 bg-gray-800 rounded-t-lg overflow-hidden mb-4">
        <img src={userData.headerImageUrl} alt={`${userData.username} header`} className="w-full h-full object-cover" />
      </div>

      {/* Profile Image, Name, and Edit Button */}
      <div className="flex items-center mb-6 -mt-12">
        <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden border-4 border-gray-900">
          <img src={userData.profileImageUrl} alt={`${userData.username} profile`} className="w-full h-full object-cover" />
        </div>
        <div className="ml-3 flex-1 mt-2">
          {/* First Name and Last Name */}
          <p className="font-bold text-gray-200">{`${userData.firstName} ${userData.lastName}`}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">@{userData.username}</p>
            {isCurrentUser && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleEditProfile}
                className="ml-2 text-blue-500 hover:text-blue-400"
                title="Edit Profile"
              >
                <Edit className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-300">{userData.bio.replace('@AsBeatCloud', `@${userData.username}`)}</p>
      </div>

      {/* Social Links with Icons and Names */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connect</h3>
        <div className="flex space-x-4">
          {userData.socialLinks.map((link) => {
            const IconComponent = platformIcons[link.platform as keyof typeof platformIcons];
            return (
              <Link key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" title={link.platform}>
                <motion.div whileHover={{ scale: 1.1 }} className={`flex items-center ${link.color} transition duration-200`}>
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
        <h3 className="text-lg font-semibold mb-2">Gallery</h3>
        <div className="grid grid-cols-3 gap-4">
          {userData.galleryImages.map((image, index) => (
            <img key={index} src={image} alt={`${userData.username} gallery image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-sm text-gray-500 mt-4">Last Updated: {lastUpdated}</p>
    </div>
  );
};

export default UserProfile;