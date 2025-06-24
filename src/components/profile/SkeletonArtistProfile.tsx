'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonArtistProfile = () => {
  return (
    <div className="p-6 rounded-xl max-w-md mx-auto my-6 ">
      {/* Skeleton for username header */}
      <div className="h-6 w-1/2 bg-gray-700 rounded animate-pulse mb-4"></div>

      {/* Skeleton for profile image */}
      <div className="relative mt-7">
        <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Skeleton for artist details */}
      <div className="mt-4 space-y-4">
        {/* Skeleton for hometown */}
        <div>
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="h-5 w-3/4 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Skeleton for birth date */}
        <div>
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="h-5 w-3/4 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Skeleton for genre */}
        <div>
          <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="h-5 w-3/4 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonArtistProfile;