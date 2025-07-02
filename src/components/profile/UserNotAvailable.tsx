'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

export default function UserNotAvailable() {
  const authId = useAppSelector((state) => state.authId.value) as string | undefined;

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4"
    >

      {/* Main Content */}
      <div className="w-full max-w-lg p-8 rounded-xl backdrop-blur-sm mt-8 text-center">
        <AlertCircle className="mx-auto text-orange-400 h-20 w-20 mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">
          User Not Available
        </h2>
        <div className="text-gray-300 mb-8 leading-relaxed text-lg">
          <p>The user you are looking for is currently unavailable.</p>
          <p className="mt-2">This may be due to:</p>
          <ul className="list-disc list-inside text-left mx-auto max-w-xs mt-2 mb-4">
            <li>Account suspension</li>
            <li>Account deletion</li>
            <li>A technical error</li>
          </ul>
          <p>Please try again later or contact support for assistance.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="inline-block bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300"
          >
            Return to Home Page
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center text-orange-400 font-medium hover:text-orange-300 transition-colors duration-200"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </motion.div>
  );
}