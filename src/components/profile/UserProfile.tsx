'use client';

import SkeletonUserProfile from './SkeletonUserProfile';
import SAndG from './SAndG';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Instagram, Facebook, Edit, Flag, Share2, MessageCircle, Link2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { CircleCheckBig } from 'lucide-react';

const UserProfile = () => {
  const router = useRouter();
  const params = useParams();
  const userid = params.userid;

  const authId = useAppSelector((state) => state.authId.value);

  // Log authId and userid for debugging
  console.log('authId:', authId, 'userid:', userid);

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

  // Convert numbers
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
  const [userData, setUserData] = useState({
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
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const shareModalRef = useRef<HTMLDivElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const REPORTS_COLLECTION_ID = 'REPORTS_COLLECTION_ID'; // Replace with actual collection ID
  const COLLECTION_ID = "6849aa4f000c032527a9";
  // Click-outside detection for Share Modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch user data from Appwrite
  useEffect(() => {
    if (!userid || typeof userid !== 'string') {
      setError('User ID not provided or invalid');
      setLoading(false);
      return;
    }

    if (!DATABASE_ID) {
      setError('Database ID is not configured');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid);
        console.log('User data:', response);
        const currentUserResponse = authId
          ? await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId as string)
          : null;

        setUserData({
          profileImageUrl:
            response.profileImageUrl ||
            'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin',
          headerImageUrl: response.headerImageUrl || 'https://via.placeholder.com/800x200',
          bio: response.bio || 'No bio available.',
          socialLinks: [
            { platform: 'Twitter', url: response.twitterUrl || '', color: 'text-blue-400 hover:text-blue-300' },
            { platform: 'Instagram', url: response.instagramUrl || '', color: 'text-pink-400 hover:text-pink-300' },
            { platform: 'Facebook', url: response.facebookUrl || '', color: 'text-blue-600 hover:text-blue-400' },
          ],
          galleryImages: response.galleryImages || [],
          followers: response.followers || 0,
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          username: response.username || '',
          following: response.following || [],
        });

        if (currentUserResponse && currentUserResponse.following) {
          setIsFollowing(currentUserResponse.following.includes(userid));
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userid, authId, DATABASE_ID]);

  // Log loading and error states
  console.log('Loading:', loading, 'Error:', error);

  // Share functionality
  const shareProfile = (platform: string) => {
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
    setShowShareModal(false);
  };

  const [cp, setCp] = useState<boolean>(false);

  const handleCp = () => {
    const profileUrl = `${window.location.origin}/profile/${userid}`;
    if (!cp) {
      setCp(true);
      navigator.clipboard.writeText(profileUrl);
    }
    setTimeout(() => {
      setCp(false);
    }, 2000);
  };

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authId || !reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }
    if (!userid || typeof userid !== 'string') {
      setError('Invalid user ID');
      return;
    }
    if (!DATABASE_ID || !REPORTS_COLLECTION_ID) {
      setError('Database or collection ID is not configured');
      return;
    }

    try {
      await databases.createDocument(DATABASE_ID, REPORTS_COLLECTION_ID, 'unique()', {
        reportedUserId: userid,
        reporterId: authId,
        reason: reportReason,
        timestamp: new Date().toISOString(),
      });
      setShowReportModal(false);
      setReportReason('');
      alert('Report submitted successfully');
    } catch (err) {
      setError('Failed to submit report');
      console.error('Report submission failed:', err);
    }
  };

  const isCurrentUser = authId === userid;

  const handleEditProfile = () => {
    if (isCurrentUser) {
      router.push(`/profile/edit`);
    }
  };

  const handleFollowToggle = async () => {
  if (!authId) {
    setError("authId is undefined");
    return;
  }

  if (isCurrentUser || followLoading) return;

  setFollowLoading(true);

  try{
    
  }catch (err: any) {
    setError(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${err.message}`);
    console.error('Follow toggle error:', err);
  } finally {
    setFollowLoading(false);
  }
};

  if (loading) return <SkeletonUserProfile />;

  if (error) return <div className="text-red-500">{error} "user:"{userid}</div>;

  return (
    <div className="text-gray-200 p-6 rounded-lg">
      {/* Header Image */}
      <div className="w-full h-32 bg-gray-800 rounded-t-lg overflow-hidden mb-4">
        <img src={userData.headerImageUrl} alt={`${userData.username} header`} className="w-full h-full object-cover" />
      </div>

      {/* Profile Image, Name, and Buttons */}
      <div className="flex items-center mb-6 -mt-12">
        <div className="w-24 h-24 bg-gray-700 rounded-full overflow-hidden border-4 border-gray-900">
          <img src={userData.profileImageUrl} alt={`${userData.username} profile`} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 mt-2">
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <p
                className="font-bold text-gray-200 w-24 md:w-auto overflow-hidden text-ellipsis whitespace-nowrap"
                title={`${userData.firstName} ${userData.lastName}`}
              >
                {`${userData.firstName} ${userData.lastName}`}
              </p>
              <div>
                <p className="text-sm text-gray-400">Followers: {formatNumber(userData.followers)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 z-50">
              {!isCurrentUser && (
                <>
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
                </>
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

      {/* Share Modal */}
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
                  <Facebook className="h-5 text-blue-500 w-5 mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => shareProfile('instagram')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                  aria-label="Share on Instagram"
                >
                  <Instagram className="h-5 text-pink-500 w-5 mr-2" />
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

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Report Profile</h3>
              <form onSubmit={handleReportSubmit}>
                <textarea
                  className="w-full p-2 mb-4 bg-gray-900 text-gray-200 rounded"
                  rows={4}
                  placeholder="Please provide the reason for reporting this profile"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  aria-label="Report reason"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-orange-500 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-300">{userData.bio.replace('@AsBeatCloud', `@${userData.username}`)}</p>
      </div>

      <div className="mb-6 flex flex-row gap-2">
        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-800"
          title="Share Profile"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Opening share modal');
            setShowShareModal(true);
          }}
          aria-label="Share profile"
        >
          <Share2 className="h-5 w-5" />
        </motion.button>
        {/* Report Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            console.log('Opening report modal');
            setShowReportModal(true);
          }}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-800"
          title="Report Profile"
          aria-label="Report profile"
        >
          <Flag className="h-5 text-red-500 w-5" />
        </motion.button>
      </div>

      <SAndG />
    </div>
  );
};

export default UserProfile;