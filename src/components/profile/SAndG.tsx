'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Facebook, Edit } from 'lucide-react';
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
  
  return (
    <div>
    
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
      <p className="text-sm text-gray-500 mt-4">Last Updated: </p>
    
    </div>
  )
}