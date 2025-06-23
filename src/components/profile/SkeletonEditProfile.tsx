'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonEditProfile = () => {
  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto backdrop-blur-md rounded-xl shadow-2xl p-8 border border-gray-800"
      >
        {/* Skeleton for title */}
        <div className="h-8 w-1/2 mx-auto bg-gray-700 rounded animate-pulse mb-6"></div>

        <div className="space-y-6">
          {/* Skeleton for banner image section */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 animate-pulse"></div>
          </div>

          {/* Skeleton for profile image section */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 animate-pulse"></div>
          </div>

          {/* Skeleton for first name */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for last name */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for username */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for email */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for gender */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for bio */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-24 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for address */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for hometown */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for date of birth */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton for genre */}
          <div>
            <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for submit button */}
          <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>

          {/* Skeleton for change password link */}
          <div className="text-center">
            <div className="h-4 w-1/3 mx-auto bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SkeletonEditProfile;