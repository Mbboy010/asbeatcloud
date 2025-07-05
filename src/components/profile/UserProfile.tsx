'use client';

import VerificationIcon from '../icons/VerificationIcon';
import SkeletonUserProfile from './SkeletonUserProfile';
import SAndG from './SAndG';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Instagram, Facebook, Edit, Flag, Share2, MessageCircle, Link2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { reportSubmitted } from '@/utils/reportSubmitted';
import { ID } from 'appwrite';


// Define interfaces for type safety
interface SocialLink {
  platform: string;
  url: string;
  color: string;
}

interface UserData {
  profileImageUrl: string;
  headerImageUrl: string;
  bio: string;
  socialLinks: SocialLink[];
  galleryImages: string[];
  followers: number;
  firstName: string;
  lastName: string;
  username: string;
  following: string[];
  email: string;
  $id?: string;
}

const UserProfile = () => {
  const router = useRouter();
  const params = useParams();
  const userid = typeof params.userid === 'string' ? params.userid : undefined;
  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);

  // Refs for focus management
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shareModalRef = useRef<HTMLDivElement>(null);
  const successModalRef = useRef<HTMLDivElement>(null);

  // Current date and time
  const currentDate = new Date();
  const lastUpdated = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Lagos',
  });

  // Format numbers
  function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 2) + 'b';
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 2) + 'm';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 2) + 'k';
    } else {
      return num.toString();
    }
  }

  // State for dynamic data
  const [userData, setUserData] = useState<UserData>({
    profileImageUrl: '',
    headerImageUrl: '',
    bio: '',
    socialLinks: [
      { platform: 'Twitter', url: '', color: 'text-blue-400 hover:text-blue-300' },
      { platform: 'Instagram', url: '', color: 'text-pink-400 hover:text-pink-300' },
      { platform: 'Facebook', url: '', color: 'text-blue-600 hover:text-blue-400' },
    ],
    galleryImages: [],
    followers: 0,
    firstName: '',
    lastName: '',
    username: '',
    following: [],
    email: '',
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cp, setCp] = useState<boolean>(false);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
  const REPORTS_COLLECTION_ID = process.env.NEXT_PUBLIC_REPORTS_COLLECTION_ID || '68651f14000d0d69786e';
  const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || '6849aa4f000c032527a9';

  // Click-outside detection for Share and Success Modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
      if (successModalRef.current && !successModalRef.current.contains(event.target as Node)) {
        setShowSuccessModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset isFollowing when user is not authenticated
  useEffect(() => {
    if (!isAuth) {
      setIsFollowing(false);
    }
  }, [isAuth]);

  // Validate environment variables
  useEffect(() => {
    const missingVars: string[] = [];
    if (!DATABASE_ID) missingVars.push('NEXT_PUBLIC_USERSDATABASE');
    if (!REPORTS_COLLECTION_ID) missingVars.push('NEXT_PUBLIC_REPORTS_COLLECTION_ID');
    if (!COLLECTION_ID) missingVars.push('NEXT_PUBLIC_USERS_COLLECTION_ID');

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars.join(', '));
      if (!DATABASE_ID || !COLLECTION_ID) {
        setError('Application configuration error. Please contact support.');
        setLoading(false);
      }
    }
  }, [DATABASE_ID, REPORTS_COLLECTION_ID, COLLECTION_ID]);

  // Fetch user data from Appwrite
  useEffect(() => {
    if (!userid) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [profileResponse, currentUserResponse] = await Promise.all([
          databases.getDocument(DATABASE_ID, COLLECTION_ID, userid),
          authId ? databases.getDocument(DATABASE_ID, COLLECTION_ID, authId) : Promise.resolve(null),
        ]);

        console.log('Profile data:', profileResponse, 'Current user data:', currentUserResponse);

        setUserData({
          $id: profileResponse.$id,
          profileImageUrl:
            profileResponse.profileImageUrl ||
            'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin',
          headerImageUrl: profileResponse.headerImageUrl || 'https://via.placeholder.com/800x200',
          bio: profileResponse.bio || 'No bio available.',
          socialLinks: [
            { platform: 'Twitter', url: profileResponse.twitterUrl || '', color: 'text-blue-400 hover:text-blue-300' },
            { platform: 'Instagram', url: profileResponse.instagramUrl || '', color: 'text-pink-400 hover:text-pink-300' },
            { platform: 'Facebook', url: profileResponse.facebookUrl || '', color: 'text-blue-600 hover:text-blue-400' },
          ],
          galleryImages: profileResponse.galleryImages || [],
          followers: profileResponse.followers || 0,
          firstName: profileResponse.firstName || '',
          lastName: profileResponse.lastName || '',
          username: profileResponse.username || '',
          following: profileResponse.following || [],
          email: profileResponse.email || '',
        });

        if (currentUserResponse && Array.isArray(currentUserResponse.following)) {
          setIsFollowing(currentUserResponse.following.includes(userid));
        }
      } catch (err: any) {
        setError(`Error fetching user data: ${err.message}`);
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userid, authId, DATABASE_ID, COLLECTION_ID]);

  // Share functionality
  const shareProfile = (platform: string) => {
    if (!userid) {
      setError('Cannot share: User ID is missing');
      return;
    }
    const profileUrl = `${window.location.origin}/profile/${userid}`;
    const shareText = userData.username ? `Check out ${userData.username}'s profile!` : 'Check out this profile!';
    console.log(`Sharing on ${platform}:`, shareText, profileUrl);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${shareText} ${profileUrl}`);
        alert('Profile link copied to clipboard! You can paste it in Instagram.');
        break;
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
        break;
    }
  };

  const handleCp = () => {
    if (!userid) {
      setError('Cannot copy: User ID is missing');
      return;
    }
    const profileUrl = `${window.location.origin}/profile/${userid}`;
    if (!cp) {
      setCp(true);
      navigator.clipboard.writeText(profileUrl);
      setTimeout(() => {
        setCp(false);
      }, 2000);
    }
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuth || !authId) {
      setError('Please log in to submit a report');
      router.push('/login');
      return;
    }

    if (!userData.$id) {
      setError('Invalid user ID');
      return;
    }

    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    if (!DATABASE_ID || !REPORTS_COLLECTION_ID) {
      setError('Report functionality is unavailable due to configuration issues.');
      return;
    }

    try {
      let currentUser;
      try {
        currentUser = await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId);
      } catch (err: any) {
        setError('Failed to fetch user data. Please try again.');
        console.error('Failed to fetch current user:', err);
        return;
      }

      const sanitizedReason = reportReason.trim().slice(0, 1000);

      

        // Create the document
        const response = await databases.createDocument(
          DATABASE_ID,
          REPORTS_COLLECTION_ID,
          ID.unique(),
          {
            profileId: userData.$id,
            senderId: authId,
            profileEmail: userData.email || 'unknown',
            senderEmail: currentUser.email || 'unknown',
            reason: sanitizedReason,
            time: new Date().toISOString(),
          }
        );


      
      await reportSubmitted({
        to: currentUser.email ,
        reportedEntity: `${userData.firstName} ${userData.lastName}`, 
        supportUrl: "string.com",
        reportId: response.$id,
      });

      setShowReportModal(false);
      setReportReason('');
      setError('');
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(`Failed to submit report: ${err.message}`);
      console.error('Report submission failed:', err);
    }
  };

  // Focus management for accessibility
  useEffect(() => {
    if (showReportModal && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (showSuccessModal && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [showReportModal, showSuccessModal]);

  const isCurrentUser = authId === userid;

  const handleEditProfile = () => {
    if (isCurrentUser) {
      router.push(`/profile/edit`);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuth) {
      return router.push(`/login`);
    }

    if (!authId) {
      setError('authId is undefined');
      return;
    }

    if (!userid) {
      setError('userid is undefined');
      return;
    }

    if (isCurrentUser || followLoading) return;

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError('Database configuration is missing');
      return;
    }

    setFollowLoading(true);

    try {
      const [currentUser, profileUser] = await Promise.all([
        databases.getDocument(DATABASE_ID, COLLECTION_ID, authId),
        databases.getDocument(DATABASE_ID, COLLECTION_ID, userid),
      ]);

      let updatedFollowing: string[] = Array.isArray(currentUser.following) ? [...currentUser.following] : [];
      let updatedFollowers: number = typeof profileUser.followers === 'number' ? profileUser.followers : 0;

      if (updatedFollowing.includes(userid)) {
        updatedFollowing = updatedFollowing.filter((id) => id !== userid);
        updatedFollowers = Math.max(0, updatedFollowers - 1);
        setIsFollowing(false);
      } else {
        updatedFollowing.push(userid);
        updatedFollowers += 1;
        setIsFollowing(true);
      }

      await Promise.all([
        databases.updateDocument(DATABASE_ID, COLLECTION_ID, authId, {
          following: updatedFollowing,
        }),
        databases.updateDocument(DATABASE_ID, COLLECTION_ID, userid, {
          followers: updatedFollowers,
        }),
      ]);

      setUserData((prev) => ({
        ...prev,
        followers: updatedFollowers,
      }));
    } catch (err: any) {
      setError(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${err.message}`);
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <SkeletonUserProfile />;

  return (
    <div className="text-gray-200 p-6 rounded-lg">
      <div className="w-full h-32 bg-gray-800 rounded-t-lg overflow-hidden mb-4">
        <img src={userData.headerImageUrl} alt={`${userData.username} header`} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center mb-6 -mt-12">
        <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden border-4 border-gray-900">
          <img src={userData.profileImageUrl} alt={`${userData.username} profile`} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 mt-2">
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <div className="flex items-center flex-row ">
                <p
                  className="font-bold text-gray-200 max-w-[6rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap"
                  title={`${userData.firstName} ${userData.lastName}`}
                >
                  {`${userData.firstName} ${userData.lastName}`}
                </p>
                <span className="mt-[0.22rem]">
                  {userData.followers >= 1000 && <VerificationIcon />}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Followers: {formatNumber(userData.followers)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isCurrentUser && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-4 py-1 rounded-full text-white ${
                    isFollowing ? 'bg-red-500' : 'bg-orange-500'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </motion.button>
              )}
              {isCurrentUser && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={handleEditProfile}
                  className="ml-2 text-blue-500 hover:text-blue-400"
                  title="Edit Profile"
                  aria-label="Edit profile"
                >
                  <Edit className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          >
            <motion.div
              ref={shareModalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Share Profile</h3>
              <div className="space-y-2">
                <button
                  onClick={() => shareProfile('whatsapp')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                  WhatsApp
                </button>
                <button
                  onClick={() => shareProfile('facebook')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-5 w-5 mr-2 text-blue-500" />
                  Facebook
                </button>
                <button
                  onClick={() => shareProfile('instagram')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                  aria-label="Share on Instagram"
                >
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Instagram
                </button>
                <button
                  onClick={handleCp}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                  aria-label="Copy profile link"
                >
                  <Link2 className="w-5 h-5 mr-2" />
                  {cp ? <span className="text-green-500">Copied</span> : <span>Copy Link</span>}
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-orange-500 rounded"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-md"
            >
              <h3 id="report-modal-title" className="text-lg font-semibold mb-4">
                Report Profile
              </h3>
              <form onSubmit={handleReportSubmit}>
                <textarea
                  ref={textareaRef}
                  className="w-full p-2 mb-4 bg-gray-900 text-gray-200 rounded"
                  rows={4}
                  placeholder="Please provide the reason for reporting this profile"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  aria-label="Report reason"
                  maxLength={1000}
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason('');
                      setError('');
                    }}
                    className="px-4 py-2 bg-orange-500 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
                    disabled={!reportReason.trim()}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <motion.div
              ref={successModalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-sm"
            >
              <h3 id="success-modal-title" className="text-lg font-semibold mb-4 text-green-400">
                Report Submitted
              </h3>
              <p className="text-gray-200 mb-4">Your report has been submitted successfully. Thank you for your feedback.</p>
              <div className="flex justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-400"
                  aria-label="Close success modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-300">
          {userData.bio.replace('@AsBeatCloud', `@${userData.username}`)}
        </p>
      </div>

      <div className="mb-6 flex flex-row gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          title="Share Profile"
          onClick={() => setShowShareModal(true)}
          aria-label="Share profile"
        >
          <Share2 className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            isAuth ? setShowReportModal(true) : router.push('/login');
          }}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          title="Report Profile"
          aria-label="Report profile"
          disabled={!REPORTS_COLLECTION_ID}
        >
          <Flag className="h-5 w-5 text-red-500" />
        </motion.button>
      </div>

      <SAndG />
    </div>
  );
};

export default UserProfile;