'use client';

import { motion } from 'framer-motion';
import { X, Home, UploadCloud, Music } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 h-full z-40 p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg ${
        // Full screen overlay on mobile, fixed width on desktop
        isOpen && 'md:w-64 w-full'
      } ${
        // Hidden on desktop when closed, visible when open on mobile
        !isOpen && 'hidden md:block md:w-64 md:static'
      }`}
    >
      {/* Header with Close Button - Only on mobile when open */}
      {isOpen && (
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold">AsBeatCloud</h2>
          <button onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Navigation - Always visible on desktop, conditional on mobile */}
      <nav className="space-y-4">
        <Link
          href="/"
          className={`flex items-center space-x-2 p-2 rounded ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/upload"
          className={`flex items-center space-x-2 p-2 rounded ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <UploadCloud className="h-5 w-5" />
          <span>Upload Music</span>
        </Link>
        <Link
          href="/tracks"
          className={`flex items-center space-x-2 p-2 rounded ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Music className="h-5 w-5" />
          <span>My Tracks</span>
        </Link>
      </nav>
    </motion.aside>
  );
}