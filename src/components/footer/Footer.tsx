'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 border-t border-orange-500 text-white py-6 mt-auto"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <span className="text-xl font-bold text-white">Asbeat</span>
            <span className="text-xl font-bold text-orange-500">Cloud</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center space-x-4">
            <Link href="/" className="text-gray-400 hover:text-orange-500 transition duration-200">
              Home
            </Link>
            <Link href="/profile" className="text-gray-400 hover:underline">
              Profile
            </Link>
            <Link href="/about" className="text-gray-400 hover:underline">
              About
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-orange-500 transition duration-200">
              Contact
            </Link>
          </nav>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition duration-200"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition duration-200"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition duration-200"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          &copy; {currentYear} AsbeatCloud. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}