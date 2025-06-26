'use client';

import SkeletonUploadGallery from './SkeletonUploadGallery';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { ID } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadGallery() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.authId.value);
  const authStatus = useAppSelector((state) => state.authId.status); // Assuming Redux store has a status field
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Track auth loading state

  // State for file inputs, previews, existing images, and form status
  const [files, setFiles] = useState<{
    galleryone: File | null;
    gallerytwo: File | null;
    gallerythree: File | null;
  }>({
    galleryone: null,
    gallerytwo: null,
    gallerythree: null,
  });
  const [previews, setPreviews] = useState<{
    galleryone: string | null;
    gallerytwo: string | null;
    gallerythree: string | null;
  }>({
    galleryone: null,
    gallerytwo: null,
    gallerythree: null,
  });
  const [existingImages, setExistingImages] = useState<{
    galleryone: string | null;
    gallerytwo: string | null;
    gallerythree: string | null;
  }>({
    galleryone: null,
    gallerytwo: null,
    gallerythree: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Check authentication status to prevent redirect on refresh
  useEffect(() => {
    if (authStatus === 'loading') {
      setIsAuthLoading(true);
    } else {
      setIsAuthLoading(false);
      if (!userId) {
        router.push('/');
      }
    }
  }, [userId, authStatus, router]);

  // Fetch existing gallery images
  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (!userId) return;

      const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
      const COLLECTION_ID = '6849aa4f000c032527a9';

      if (!DATABASE_ID) {
        setError('Database ID is not configured.');
        setLoading(false);
        return;
      }

      try {
        const userDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
        setExistingImages({
          galleryone: userDoc.galleryone || null,
          gallerytwo: userDoc.gallerytwo || null,
          gallerythree: userDoc.gallerythree || null,
        });
      } catch (err: any) {
        setError(`Failed to fetch gallery images: ${err.message}`);
        console.error('Error fetching gallery images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, [userId]);

  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  // Compression function for images (~51KB)
  const compressTo51KB = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const targetSize = 51000; // ~51KB in bytes
      let quality = 0.95;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const size = blob.size;
            if (size <= targetSize || quality <= 0.01) {
              if (size <= targetSize) {
                resolve(blob);
              } else {
                reject(new Error('Could not compress to 51KB'));
              }
              return;
            }
            quality -= 0.02;
            tryCompress();
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    });
  };

  // Handle file input changes with compression
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'galleryone' | 'gallerytwo' | 'gallerythree'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas context not available');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Resize to 512x512 (adjust as needed)
          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;
          let sx = 0,
            sy = 0,
            sWidth = img.width,
            sHeight = img.height;

          // Crop to square if not already
          if (img.width !== img.height) {
            const size = Math.min(img.width, img.height);
            sx = (img.width - size) / 2;
            sy = (img.height - size) / 2;
            sWidth = sHeight = size;
          }

          ctx.clearRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

          const compressedBlob = await compressTo51KB(canvas);

          // Update files and previews
          setFiles((prev) => ({
            ...prev,
            [key]: new File([compressedBlob], `${key}.jpg`, { type: 'image/jpeg' }),
          }));

          // Clean up previous preview URL
          if (previews[key]) {
            URL.revokeObjectURL(previews[key]!);
          }

          // Generate new preview URL
          const previewUrl = URL.createObjectURL(compressedBlob);
          setPreviews((prev) => ({
            ...prev,
            [key]: previewUrl,
          }));
        } catch (err: any) {
          setError(`Error processing image: ${err.message}`);
          
        }
      };
      img.onerror = () => {
        setError('Failed to load image');
        
      };
      img.src = readerकीresult as string;
    };
    reader.onerror = () => {
      setError('Failed to read file');
      
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to upload images.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
      const COLLECTION_ID = '6849aa4f000c032527a9';
      const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

      // Validate environment variables
      if (!DATABASE_ID || !STORAGE_BUCKET_ID) {
        throw new Error('Database or storage bucket ID is not configured.');
      }

      // Fetch the user document using userId as the document ID
      await databases.getDocument(DATABASE_ID, COLLECTIONpy_ID, userId);

      // Upload files to Appwrite Storage and collect URLs
      const updatedFields: { [key: string]: string } = {};
      for (const key of ['galleryone', 'gallerytwo', 'gallerythree'] as const) {
        if (files[key]) {
          // Upload file to storage
          const file = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), files[key]);

          // Generate file URL
          const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          updatedFields[key] = fileUrl;
        }
      }

      // Update user document with new image URLs
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userId, updatedFields);

      setSuccess('Images uploaded successfully!');
      setFiles({ galleryone: null, gallerytwo: null, gallerythree: null }); // Reset files
      setPreviews({ galleryone: null, gallerytwo: null, gallerythree: null }); // Reset previews
    } catch (err: any) {
      setError(`Failed to upload images: ${err.message}`);
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  // Trigger file input click programmatically
  const triggerFileInput = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.click();
  };

  if (loading || isAuthLoading) {
    return <SkeletonUploadGallery />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mt-8 mx-auto rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-center text-gray-200 mb-6">Upload Gallery Images</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <canvas ref={canvasRef} className="hidden" />

          {/* Gallery Image 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-4"
          >
            <label htmlFor="galleryone" className="block text-sm font-medium text-gray-200 mb-2">
              Gallery Image 1
            </label>
            <input
              type="file"
              id="galleryone"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'galleryone')}
              className="hidden"
              disabled={uploading}
            />
            <div className="relative">
              {previews.galleryone ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={previews.galleryone}
                  alt="Gallery Image 1 Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : existingImages.galleryone ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={existingImages.galleryone}
                  alt="Existing Gallery Image 1"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No image uploaded
                </div>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => triggerFileInput('galleryone')}
              className="mt-3 w-full bg-orange-500 text-white py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              disabled={uploading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload Image 1
            </motion.button>
          </motion.div>

          {/* Gallery Image 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-4"
          >
            <label htmlFor="gallerytwo" className="block text-sm font-medium text-gray-200 mb-2">
              Gallery Image 2
            </label>
            <input
              type="file"
              id="gallerytwo"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'gallerytwo')}
              className="hidden"
              disabled={uploading}
            />
            <div className="relative">
              {previews.gallerytwo ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={previews.gallerytwo}
                  alt="Gallery Image 2 Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : existingImages.gallerytwo ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={existingImages.gallerytwo}
                  alt="Existing Gallery Image 2"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No image uploaded
                </div>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => triggerFileInput('gallerytwo')}
              className="mt-3 w-full bg-orange-500 text-white py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              disabled={uploading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload Image 2
            </motion.button>
          </motion.div>

          {/* Gallery Image 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="p-4"
          >
            <label htmlFor="gallerythree" className="block text-sm font-medium text-gray-200 mb-2">
              Gallery Image 3
            </label>
            <input
              type="file"
              id="gallerythree"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'gallerythree')}
              className="hidden"
              disabled={uploading}
            />
            <div className="relative">
              {previews.gallerythree ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={previews.gallerythree}
                  alt="Gallery Image 3 Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : existingImages.gallerythree ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={existingImages.gallerythree}
                  alt="Existing Gallery Image 3"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No image uploaded
                </div>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => triggerFileInput('gallerythree')}
              className="mt-3 w-full bg-orange-500 text-white py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              disabled={uploading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload Image 3
            </motion.button>
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
            disabled={uploading || (!files.galleryone && !files.gallerytwo && !files.gallerythree)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {uploading ? 'Uploading...' : 'Save All Images'}
          </motion.button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-center mb-4"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-500 text-center mb-4"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => router.push(`/profile/${userId || ''}`)}
          className="mt-4 w-full text-blue-600 hover:text-blue-800 font-medium text-center"
          disabled={!userId}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Profile
        </motion.button>
      </motion.div>
    </div>
  );
}