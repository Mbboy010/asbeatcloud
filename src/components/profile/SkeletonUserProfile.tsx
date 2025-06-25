'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonUserProfile = () => {
  return (
    <div className="p-6 rounded-lg ">
      {/* Skeleton for Header Image */}
      <div className="w-full h-32 bg-gray-800 rounded-t-lg animate-pulse mb-4"></div>

      {/* Skeleton for Profile Image, Name, and Buttons */}
      <div className="flex items-center mb-6 -mt-12">
        <div className="w-24 h-24 bg-gray-700 rounded-full border-4 border-gray-900 animate-pulse"></div>
        <div className="flex-1 mt-2">
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-20 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton for Bio */}
      <div className="mb-6">
        <div className="h-6 w-20 bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton for Share and Report Buttons */}
      <div className="mb-6 flex flex-row gap-2">
        <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
      </div>
      
      <div className="mb-6 ">
        <div className="h-6 w-20 bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="flex items-center gap-4 flex-row">
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>


      {/* Skeleton for SAndG Component */}
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-48 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonUserProfile;