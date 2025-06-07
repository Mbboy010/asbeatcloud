'use client';

import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { useState } from 'react';

const UserProfile = () => {
  // Current date and time
  const currentDate = new Date();
  const lastUpdated = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Lagos', // WAT timezone
  });

  // Sample user data with social links as an array and follower stats
  const user = {
    name: 'AsBeatCloud User',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    headerImageUrl: 'https://plus.unsplash.com/premium_photo-1681540549623-45168929205a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBsYW5kc2NhcGV8ZW58MHx8MHx8fDA%3D',
    bio: 'Welcome to my AsBeatCloud profile! I’m a passionate music enthusiast sharing beats and rhythms from around the world. Inspired by diverse cultures, my journey began in 2023, and I’ve been creating and curating ever since. Check out my latest tracks and follow my journey! @AsBeatCloud #MusicLover',
    socialLinks: [
      { platform: 'Twitter', url: 'https://twitter.com/AsBeatCloud', color: 'text-blue-400 hover:text-blue-300' },
      { platform: 'Instagram', url: 'https://instagram.com/AsBeatCloud', color: 'text-pink-400 hover:text-pink-300' },
      { platform: 'Facebook', url: 'https://facebook.com/AsBeatCloud', color: 'text-blue-600 hover:text-blue-400' },
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&w=690&h=500&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=690&h=500&q=80',
      'https://plus.unsplash.com/premium_photo-1682125768864-c80b650614f3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww',
    ],
    followers: 1250, // Sample follower count
  };

  // State to track follow status
  const [isFollowing, setIsFollowing] = useState(false);

  // Map of platform to icon component
  const platformIcons = {
    Twitter: Twitter,
    Instagram: Instagram,
    Facebook: Facebook,
  };

  return (
    <div className="text-gray-200 p-6 rounded-lg">
      {/* Header Image */}
      <div className="w-full h-32 bg-gray-800 rounded-t-lg overflow-hidden mb-4">
        <img
          src={user.headerImageUrl}
          alt={`${user.name} header`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Image and Name with Follow Button */}
      <div className="flex items-center mb-6 -mt-12">
        <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden border-4 border-gray-900">
          <img
            src={user.profileImageUrl}
            alt={`${user.name} profile`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1 mt-2">
          <h2 className="font-bold">{user.name}</h2>
          <p className="text-sm text-gray-500">Followers: {user.followers.toLocaleString()}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className={`px-3 py-1 text-white mt-2 rounded transition duration-500 ${isFollowing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </motion.button>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-300">{user.bio}</p>
      </div>

      {/* Social Links with Icons and Names */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Connect</h3>
        <div className="flex space-x-4">
          {user.socialLinks.map((link) => {
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
          {user.galleryImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${user.name} gallery image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-sm text-gray-500 mt-4">
        Last Updated: {lastUpdated}
      </p>
    </div>
  );
};

export default UserProfile;