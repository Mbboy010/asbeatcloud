'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { ID, Query } from 'appwrite';

export default function UploadGallery() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.authId.value);
  

  // State for file inputs and form status
  const [files, setFiles] = useState({
    galleryone: null,
    gallerytwo: null,
    gallerythree: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (userId) {
      
    }
  }, [userId, router]);

  // Handle file input changes
  const handleFileChange = (e, key) => {
    setFiles((prev) => ({
      ...prev,
      [key]: e.target.files[0],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
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
      const COLLECTION_ID = "6849aa4f000c032527a9";
      const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

      
      

      // Fetch the user document to get the document ID
      const userDocResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal('username', userId)]
      );

      if (userDocResponse.documents.length === 0) {
        throw new Error('User document not found.');
      }

      const userDoc = userDocResponse.documents[0];
      const documentId = userDoc.$id;

      // Upload files to Appwrite Storage and collect URLs
      const updatedFields = {};
      for (const key of ['galleryone', 'gallerytwo', 'gallerythree']) {
        if (files[key]) {
          // Upload file to storage
          const file = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            files[key]
          );

          // Generate file URL (adjust based on your Appwrite setup)
          const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          updatedFields[key] = fileUrl;
        }
      }

      // Update user document with new image URLs
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        documentId,
        updatedFields
      );

      setSuccess('Images uploaded successfully!');
      setFiles({ galleryone: null, gallerytwo: null, gallerythree: null }); // Reset form
      setTimeout(() => router.push('/gallery'), 2000); // Redirect to gallery page after 2 seconds
    } catch (err) {
      setError('Failed to upload images: ' + err.message);
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
        onClick={() => router.push('/gallery')}
        className="mt-4 text-blue-500 hover:underline"
      >
        Back to Gallery
      </button>
    </div>
  );
}