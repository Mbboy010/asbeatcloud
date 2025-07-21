'use client';

import RelatedSongs from './RelatedSongs';
import Comment from './Comment';
import { databases } from '../../lib/appwrite';
import Details from './Details';
import Bars from './Bars';
import MusicPlayer from './MusicPlayer';
import { motion } from 'framer-motion';
import { Music, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Models, Query } from 'appwrite';

// Define the Instrumental interface
interface Instrumental {
  $id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  key: string;
  scale: string;
  url: string;
  coverUrl: string;
  downloadUrl: string;
  downloads: number;
  likes: number;
  likers: string[];
  userId: string;
  date: string;
  description: string;
  comments: { id: number; user: string; text: string; timestamp: string }[];
  postId: string;
}

// Define the User document interface for type safety
interface UserDocument extends Models.Document {
  likedInstrumentals: string[];
}

// Default "Not Available" instrumental object
const notAvailableInstrumental: Instrumental = {
  $id: 'not-available',
  title: 'Content Unavailable or Deleted', // Updated title
  artist: 'Not Available',
  genre: 'Not Available',
  tempo: 0,
  key: 'Not Available',
  scale: 'Not Available',
  downloadUrl: 'Not Available',
  url: '',
  coverUrl: '/placeholder-image.jpg',
  downloads: 0,
  likes: 0,
  likers: [],
  userId: 'not-available',
  date: 'Not Available',
  description: 'This instrumental may have been deleted or is temporarily unavailable. Please try another track or return to the homepage.', // Updated description
  comments: [],
  postId: 'not-available',
};

const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
const COLLECTION_ID = '686a7cd100087c08444a';

// Skeleton UI Component
const SkeletonUI = () => {
  return (
    <div className="min-h-screen mt-3 p-2 flex justify-center">
      <div className="max-w-4xl w-full backdrop-blur-md rounded-2xl p-2 animate-pulse">
        {/* Header Section Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-3/4 bg-gray-700 rounded-md mb-3"></div>
          <div className="h-6 w-1/3 bg-gray-700 rounded-md flex items-center">
            <div className="w-5 h-5 bg-gray-600 rounded-full mr-2"></div>
            <div className="h-4 w-24 bg-gray-600 rounded-md"></div>
          </div>
        </div>

        {/* Cover Image Section Skeleton */}
        <div className="mb-8 flex justify-center">
          <div className="w-72 h-72 md:w-80 md:h-80 bg-gray-700 rounded-2xl"></div>
        </div>

        {/* Instrumental Details Skeleton */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <div className="h-4 w-20 bg-gray-700 rounded-md"></div>
            <div className="h-4 w-20 bg-gray-700 rounded-md"></div>
            <div className="h-4 w-20 bg-gray-700 rounded-md"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="mb-8 flex space-x-4 justify-center">
          <div className="h-10 w-24 bg-gray-700 rounded-full"></div>
          <div className="h-10 w-24 bg-gray-700 rounded-full"></div>
          <div className="h-10 w-24 bg-gray-700 rounded-full"></div>
        </div>

        {/* Description Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-700 rounded-md mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded-md mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-700 rounded-md"></div>
            <div className="h-4 w-3/4 bg-gray-700 rounded-md"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded-md"></div>
          </div>
        </div>

        {/* Audio Player Skeleton */}
        <div className="mb-8">
          <div className="h-16 w-full bg-gray-700 rounded-md"></div>
        </div>

        {/* Download Button Skeleton */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="h-12 w-[60%] bg-gray-700 rounded-full"></div>
        </div>

        {/* Related Songs Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-700 rounded-md mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-700 rounded-md"></div>
            <div className="h-24 bg-gray-700 rounded-md"></div>
          </div>
        </div>

        {/* Comment Section Skeleton */}
        <div>
          <div className="h-6 w-32 bg-gray-700 rounded-md mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-700 rounded-md"></div>
            <div className="h-16 bg-gray-700 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error UI Component
const ErrorUI = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  return (
    <div className="min-h-[75vh] flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-gray-900 rounded-2xl p-6 text-center shadow-lg border border-red-500/30"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Oops, Something Went Wrong</h2>
        <p className="text-gray-300 mb-6">
          {error === 'Instrumental not found with the specified postId.'
            ? 'This instrumental may have been deleted or is no longer available.'
            : error}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full font-semibold shadow-md"
            >
              Back to Homepage
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="bg-gray-600 text-white px-6 py-2 rounded-full font-semibold shadow-md"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default function InstrumentalPage() {
  const params = useParams();
  const router = useRouter();
  const instrumentalId = params.beatId as string;

  const [instrumental, setInstrumental] = useState<Instrumental>(notAvailableInstrumental);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cp, setCp] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);

  // Validate environment variables early
  useEffect(() => {
    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      setLoading(false);
    }
  }, []);

  // Handle like/unlike toggle
  const handleLikesToggle = async () => {
    if (!isAuth) {
      return router.push('/login');
    }

    if (!authId) {
      setError('User authentication ID is missing');
      return;
    }

    if (!instrumentalId) {
      setError('Instrumental ID is missing');
      return;
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      return;
    }

    if (isLiking) {
      return; // Prevent multiple simultaneous like toggles
    }

    setIsLiking(true);

    // Store previous state for rollback in case of error
    const previousIsLiked = isLiked;
    const previousInstrumental = { ...instrumental };

    try {
      // Optimistic UI update
      const newIsLiked = !isLiked;
      const newLikers = newIsLiked
        ? [...instrumental.likers, authId]
        : instrumental.likers.filter((id) => id !== authId);
      const newLikes = newIsLiked
        ? instrumental.likes + 1
        : Math.max(0, instrumental.likes - 1);

      setIsLiked(newIsLiked);
      setInstrumental((prev) => ({
        ...prev,
        likers: newLikers,
        likes: newLikes,
      }));

      // Update the document on the server
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, instrumental.$id, {
        likers: newLikers,
        likes: newLikes,
      });

      // Re-fetch the document to ensure consistency with the server
      const updatedDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, instrumental.$id);
      setInstrumental({
        ...instrumental,
        likers: Array.isArray(updatedDoc.likers) ? updatedDoc.likers : [],
        likes: updatedDoc.likes || 0,
      });
      setIsLiked(updatedDoc.likers.includes(authId));
    } catch (err: any) {
      // Revert optimistic updates on error
      setIsLiked(previousIsLiked);
      setInstrumental(previousInstrumental);
      setError(`Failed to ${isLiked ? 'unlike' : 'like'}: ${err.message}`);
      console.error('Like toggle error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Fetch instrumental data and check like status
  const fetchInstrumental = async () => {
    setLoading(true);
    setError(null);

    if (!DATABASE_ID || !COLLECTION_ID || !instrumentalId || typeof instrumentalId !== 'string') {
      setError('Invalid or missing instrumental ID.');
      setInstrumental(notAvailableInstrumental);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching with postId:', instrumentalId); // Debugging
      const responseList = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('postId', instrumentalId),
      ]);

      if (responseList.documents.length === 0) {
        setError('Instrumental not found with the specified postId.');
        setInstrumental(notAvailableInstrumental);
        setLoading(false);
        return;
      }

      const response = responseList.documents[0];
      const fetchedInstrumental: Instrumental = {
        $id: response.$id || 'not-available',
        title: response.title || 'Content Unavailable or Deleted',
        artist: response.artist || 'Not Available',
        genre: response.genre || 'Not Available',
        tempo: response.tempo || 0,
        key: response.key || 'Not Available',
        scale: response.scale || 'Not Available',
        url: response.audioFileId || '',
        coverUrl: response.imageFileId || '/placeholder-image.jpg',
        downloadUrl: response.downloadUrl || '/placeholder-downloadUrl.mp3',
        downloads: response.downloads || 0,
        likes: response.likes || 0,
        likers: Array.isArray(response.likers) ? response.likers : [],
        userId: response.userId || 'not-available',
        date: response.date || 'Not Available',
        description: response.description || 'This instrumental may have been deleted or is temporarily unavailable.',
        comments: response.comments ? JSON.parse(response.comments) : [],
        postId: response.postId || 'not-available',
      };

      await fetchArtistName(response.userId);
      setInstrumental(fetchedInstrumental);

      // Check if the current user has liked the instrumental
      if (isAuth && authId) {
        setIsLiked(fetchedInstrumental.likers.includes(authId));
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch instrumental data.');
      setInstrumental(notAvailableInstrumental);
    } finally {
      setLoading(false);
    }
  };

  // Fetch instrumental data on mount
  useEffect(() => {
    fetchInstrumental();
  }, [instrumentalId, isAuth, authId]);

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || instrumental.$id === 'not-available') {
      setError('Cannot submit empty comment or comment on unavailable instrumental.');
      return;
    }

    if (!isAuth || !authId) {
      setError('You must be logged in to comment.');
      return router.push('/login');
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      return;
    }

    try {
      setLoading(true);
      const newCommentObj = {
        id: instrumental.comments.length + 1,
        user: authId,
        text: newComment,
        timestamp: new Date().toISOString(),
      };

      const updatedComments = [...instrumental.comments, newCommentObj];

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, instrumental.$id, {
        comments: JSON.stringify(updatedComments),
      });

      setInstrumental((prev) => ({
        ...prev,
        comments: updatedComments,
      }));
      setNewComment('');
    } catch (err: any) {
      setError(`Failed to submit comment: ${err.message}`);
      console.error('Comment submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!isAuth) {
      return router.push('/login');
    }

    if (!instrumental.downloadUrl) {
      setError('No download URL available for this instrumental.');
      return;
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      return;
    }

    try {
      // Trigger the download
      const anchor = document.createElement('a');
      anchor.href = instrumental.downloadUrl;
      anchor.download = `${instrumental.title || 'instrumental'}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Update downloads count
      setInstrumental((prev) => ({
        ...prev,
        downloads: prev.downloads + 1,
      }));

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, instrumental.$id, {
        downloads: instrumental.downloads + 1,
      });
    } catch (err: any) {
      // Revert optimistic UI update on error
      setInstrumental((prev) => ({
        ...prev,
        downloads: prev.downloads,
      }));
      setError(`Failed to update download count: ${err.message}`);
      console.error('Download error:', err);
    }
  };

  const COLLECTION_I = '6849aa4f000c032527a9';
  const [artistNames, setArtistNames] = useState<{ [key: string]: string }>({});

  const fetchArtistName = async (userId: string) => {
    try {
      if (!artistNames[userId]) {
        const response = await databases.getDocument(DATABASE_ID!, COLLECTION_I!, userId);
        const fullName = `${response.firstName} ${response.lastName}`;
        setArtistNames((prev) => ({ ...prev, [userId]: fullName }));
      }
    } catch (error) {
      console.error(`Failed to fetch artist name for userId ${userId}`, error);
    }
  };

  if (loading) {
    return <SkeletonUI />;
  }

  if (error) {
    return <ErrorUI error={error} onRetry={fetchInstrumental} />;
  }

  return (
    <div className="min-h-screen mt-3 p-2 flex justify-center">
      <div className="max-w-4xl w-full backdrop-blur-md rounded-2xl p-2">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{instrumental.title}</h1>
          <Link
            href={instrumental.userId !== 'not-available' ? `/profile/${instrumental.userId}` : '#'}
            className={`text-gray-300 flex items-center text-lg ${instrumental.userId === 'not-available' ? 'pointer-events-none' : ''}`}
          >
            <Music className="w-5 h-5 mr-2 text-orange-300" /> By {artistNames[instrumental.userId] || instrumental.artist}
          </Link>
        </div>

        {/* Cover Image Section */}
        <div className="mb-8 relative flex justify-center">
          <motion.div>
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-gray-700 shadow-lg">
              <img
                src={instrumental.coverUrl}
                alt={`${instrumental.title} cover`}
                width={320}
                height={320}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              />
            </div>
          </motion.div>
        </div>

        {/* Instrumental Details */}
        <Details instrumental={instrumental} />
        {/* Action Buttons (via Bars) */}
        <Bars
          isLiked={isLiked}
          setIsLiked={setIsLiked}
          isLiking={isLiking}
          showShareModal={showShareModal}
          setShowShareModal={setShowShareModal}
          showReportModal={showReportModal}
          setShowReportModal={setShowReportModal}
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          reportReason={reportReason}
          setReportReason={setReportReason}
          error={error}
          setError={setError}
          cp={cp}
          setCp={setCp}
          handleLikesToggle={handleLikesToggle}
        />

        {/* Description */}
        <div>
          <h2 className="text-[1.3rem] font-bold text-white mb-4 flex items-center">Description</h2>
          <h1 className="text-gray-300 text-[1rem]">
            <span className="font-semibold">Uploaded on:</span> {instrumental.date}
          </h1>
          <p className="text-gray-400 my-4 text-[0.9rem]">{instrumental.description}</p>
        </div>

        {/* Audio Player */}
        <div className="mb-8">
          <MusicPlayer instrumental={instrumental} />
        </div>

        {/* Download Button */}
        <div className="w-full flex justify-center items-center">
          <motion.button
            whileHover={{ scale: instrumental.url ? 1.05 : 1 }}
            whileTap={{ scale: instrumental.url ? 0.95 : 1 }}
            onClick={handleDownload}
            className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow-md flex items-center gap-2 transition-all w-[60%] justify-center items-center duration-300 ${!instrumental.url ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!instrumental.url}
          >
            <Download className="w-5 h-5" /> Download
          </motion.button>
        </div>

        <RelatedSongs
          title={instrumental.title}
          userId={instrumental.userId}
          genre={instrumental.genre}
          scale={instrumental.scale}
        />

        {/* Comment Section */}
        <Comment currentUserId={instrumental.userId} />
      </div>
    </div>
  );
}