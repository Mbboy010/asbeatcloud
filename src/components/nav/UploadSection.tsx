'use client';

import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';

export default function UploadSection() {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Placeholder for file upload logic
      console.log('Selected file:', file.name);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`max-w-md mx-auto text-center p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      <UploadCloud className="h-12 w-12 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold mb-4">Upload Your Music</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className={`block w-full text-sm border rounded-lg cursor-pointer focus:outline-none ${
          isDarkMode
            ? 'bg-gray-800 text-white border-gray-600'
            : 'bg-gray-50 text-gray-900 border-gray-300'
        }`}
      />
      <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Upload MP3, WAV, or other audio files
      </p>
    </motion.section>
  );
}