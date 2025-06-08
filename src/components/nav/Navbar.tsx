'use client';

import { useState } from 'react';
import { Menu, User, Search, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setIsAside } from '@/store/slices/asideCheck';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchOpenPc, setIsSearchOpenPc] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useAppDispatch();
  const toggleSidebar = () => dispatch(setIsAside(true));

  const toggleSearch = () => setIsSearchOpen((prev) => !prev);
  const handleCancel = () => setIsSearchOpenPc((prev) => !prev);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchPc = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchPcOnClick = () => {
    setIsSearchOpenPc(true);
  };

  // Mock authentication state (replace with actual auth logic)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // Mock profile image URL (replace with actual user data)
  const profileImageUrl = isAuthenticated
    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80'
    : null;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-[#121212] shadow-md"
      >
        {/* User Profile */}
        <Link href="/profile" className="text-gray-200 rounded-full " aria-label="User profile">
          {isAuthenticated && profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="User profile"
              className="h-9 w-9 border-gray-500 border-2 rounded-full object-cover"
            />
          ) : (
            <div  className="text-gray-200 bg-gray-600 rounded-full border-gray-200 p-2">
            <User className="h-6  w-6" />
            </div>
          )}
        </Link>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-1" aria-label="Home">
          <span className="text-xl font-bold text-gray-200">Asbeat</span>
          <span className="text-xl font-bold text-orange-500">cloud</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={toggleSearch}
            className="md:hidden text-gray-200 p-2"
            aria-label="Toggle search"
          >
            <Search className="h-6 w-6" />
          </button>

          {/* Desktop Search Form */}
          <div className="hidden md:block">
            <form onSubmit={handleSearchPc} className="relative flex items-center">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-200"
                aria-hidden="true"
              />
              <input
                type="text"
                name="search"
                onClick={handleSearchPcOnClick}
                placeholder="Search music..."
                aria-label="Search music"
                className="pl-10 pr-10 p-2 rounded-md w-full bbg-[#2A2A2A] text-gray-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCancel}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200"
                aria-label="Close search"
              >
                <X className={`h-5 w-5 ${isSearchOpenPc ? 'text-gray-200' : 'text-gray-600'}`} />
              </button>
            </form>
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6 text-gray-200" />
          </button>
        </div>
      </nav>

      {/* Desktop Search Overlay (optional UI effect) */}
      {isSearchOpenPc && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-10 bg-[#121212] h-screen hidden md:block"
        />
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-10 bg-[#121212] h-screen md:hidden"
        >
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-200"
                aria-hidden="true"
              />
              <input
                type="text"
                name="search"
                placeholder="Search music..."
                aria-label="Search music"
                className="pl-10 pr-10 p-2 rounded-md w-full bg-[#2A2A2A] text-gray-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={toggleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
}