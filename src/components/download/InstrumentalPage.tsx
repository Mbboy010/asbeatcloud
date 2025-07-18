'use client';

import Comment from './Comment';
import { databases } from '../../lib/appwrite';
import Details from './Details';
import Bars from './Bars';
import MusicPlayer from './MusicPlayer';
import { motion } from 'framer-motion';
import { Music, Download } from 'lucide-react';
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
  title: 'Not Available',
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
  description: 'This instrumental is not available at the moment.',
  comments: [],
  postId: 'not-available',
};

const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
const COLLECTION_ID = '686a7cd100087c08444a';

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
  useEffect(() => {
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
          title: response.title || 'Not Available',
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
          description: response.description || 'This instrumental is not available at the moment.',
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
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
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

        {/* Comment Section */}
        <Comment
          currentUserId={instrumental.userId}
          comments={instrumental.comments}
          newComment={newComment}
          setNewComment={setNewComment}
          handleCommentSubmit={handleCommentSubmit}
        />
      </div>
    </div>
  );
}