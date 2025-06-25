'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { ID, Query } from 'appwrite';

export default function UploadGallery() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.authId.value?.$id || null);

  // State for file inputs and form status
  const [files, setFiles] = useState<{
    galleryone: File | null;
    gallerytwo: File | null;
    gallerythree: File | null;
  }>({
    galleryone: null,
    gallerytwo: null,
    gallerythree: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'galleryone' | 'gallerytwo' | 'gallerythree') => {
    setFiles((prev) => ({
      ...prev,
      [key]: e.target.files?.[0] || null,
    }));
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
      const userDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);

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
      setFiles({ galleryone: null, gallerytwo: null, gallerythree: null }); // Reset form
      setTimeout(() => router.push(`/profile/${userId}`), 2000); // Redirect to profile page
    } catch (err: any) {
      setError(`Failed to upload images: ${err.message}`);
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Gallery Images</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="galleryone" className="block text-sm font-medium text-gray-700">
            Gallery Image 1
          </label>
          <input
            type="file"
            id="galleryone"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'galleryone')}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            disabled={uploading}
          />
        </div>

        <div>
          <label htmlFor="gallerytwo" className="block text-sm font-medium text-gray-700">
            Gallery Image 2
          </label>
          <input
            type="file"
            id="gallerytwo"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'gallerytwo')}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            disabled={uploading}
          />
        </div>

        <div>
          <label htmlFor="gallerythree" className="block text-sm font-medium text-gray-700">
            Gallery Image 3
          </label>
          <input
            type="file"
            id="gallerythree"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'gallerythree')}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
          disabled={uploading || (!files.galleryone && !files.gallerytwo && !files.gallerythree)}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </form>

      <button
        onClick={() => router.push(`/profile/${userId || ''}`)}
        className="mt-4 text-blue-500 hover:underline"
        disabled={!userId}
      >
        Back to Profile
      </button>
    </div>
  );
}