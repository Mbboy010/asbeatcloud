'use client';

import { useState } from 'react';
import { Search, Menu, Music } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  return (
    <motion.nav
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 shadow-md z-50 p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
<div className="relative flex flex-row items-center justify-between w-full">
  {/* Left: Logo */}
  <div className="flex items-center space-x-2">
    <Music className="h-6 w-6" />
    <h1 className="text-xl font-bold">Cloud</h1>
  </div>

  {/* Right: Search, ThemeToggle, Menu */}
  <div className="flex items-center lg:gap-4 gap-2 px-2  lg:px-4 py-2 rounded-md">
    <div className="relative w-44  sm:w-auto">
      <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-500" />
      <input
        type="text"
        placeholder="Search music..."
        className={`pl-10 p-2 w-full rounded-md ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
        } focus:outline-none`}
      />
    </div>

    <ThemeToggle />

    <button onClick={toggleSidebar} className="lg:p-2">
      <Menu className="h-6 w-6" />
    </button>
  </div>
</div>
    </motion.nav>
  );
}