'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonUploadGallery = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mt-8 mx-auto rounded-xl shadow-lg p-6 sm:p-8"
      >
        {/* Skeleton for Header */}
        <div className="h-8 w-1/2 mx-auto bg-gray-700 rounded animate-pulse mb-6"></div>

        {/* Skeleton for Gallery Image 1 */}
        <div className="p-4">
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="mt-3 w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Skeleton for Gallery Image 2 */}
        <div className="p-4">
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="mt-3 w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Skeleton for Gallery Image 3 */}
        <div className="p-4">
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="mt-3 w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Skeleton for Submit Button */}
        <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>

        {/* Skeleton for Error/Success Messages */}
        <div className="h-4 w-3/4 mx-auto bg-gray-700 rounded animate-pulse mt-4"></div>

        {/* Skeleton for Back Button */}
        <div className="mt-4 w-full h-6 bg-gray-700 rounded animate-pulse"></div>
      </motion.div>
    </div>
  );
};

export default SkeletonUploadGallery;