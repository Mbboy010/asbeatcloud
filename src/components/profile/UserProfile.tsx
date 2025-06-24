'use client';

import SkeletonUserProfile from './SkeletonUserProfile'; import SAndG from './SAndG'; import Link from 'next/link'; import { motion, AnimatePresence } from 'framer-motion'; import { Twitter, Instagram, Facebook, Edit, Flag, Share2, MessageCircle, Link2, CircleCheckBig, } from 'lucide-react'; import { useState, useEffect, useRef } from 'react'; import { useRouter, useParams } from 'next/navigation'; import { databases } from '../../lib/appwrite'; import { useAppSelector } from '@/store/hooks';

const UserProfile = () => { const router = useRouter(); const params = useParams(); const userid = params.userid as string | undefined; const authId = useAppSelector((state) => state.authId.value) as string | undefined;

const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE; const COLLECTION_ID = '6849aa4f000c032527a9';

const [userData, setUserData] = useState({ profileImageUrl: '', headerImageUrl: '', bio: '', socialLinks: [ { platform: 'Twitter', url: '', color: 'text-blue-400 hover:text-blue-300' }, { platform: 'Instagram', url: '', color: 'text-pink-400 hover:text-pink-300' }, { platform: 'Facebook', url: '', color: 'text-blue-600 hover:text-blue-400' }, ], galleryImages: [], followers: 0, firstName: '', lastName: '', username: '', following: [], }); const [isFollowing, setIsFollowing] = useState(false); const [loading, setLoading] = useState(true); const [followLoading, setFollowLoading] = useState(false); const [error, setError] = useState(''); const [showReportModal, setShowReportModal] = useState(false); const [reportReason, setReportReason] = useState(''); const [showShareModal, setShowShareModal] = useState(false);

const shareModalRef = useRef<HTMLDivElement>(null);

useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) { setShowShareModal(false); } }; document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }, []);

useEffect(() => { const fetchUserData = async () => { if (!userid || !DATABASE_ID) { setError('Missing required user or database ID'); setLoading(false); return; } setLoading(true); try { const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid as string); const currentUserResponse = authId ? await databases.getDocument(DATABASE_ID, COLLECTION_ID, authId as string) : null;

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

    if (currentUserResponse?.following) {
      setIsFollowing(currentUserResponse.following.includes(userid));
    }
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    setError('Error fetching user data');
  } finally {
    setLoading(false);
  }
};

fetchUserData();

}, [userid, authId, DATABASE_ID]);

const formatNumber = (num: number): string => { if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 2) + 'b'; if (num >= 1_000_000) return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 2) + 'm'; if (num >= 1_000) return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 2) + 'k'; return num.toString(); };

const isCurrentUser = authId === userid;

const handleEditProfile = () => { if (isCurrentUser) { router.push(/profile/edit); } };

const handleFollowToggle = async () => { if (!authId || !userid || isCurrentUser || followLoading) return;

setFollowLoading(true);
try {
  const currentUser = await databases.getDocument(DATABASE_ID!, COLLECTION_ID, authId as string);
  const profileUser = await databases.getDocument(DATABASE_ID!, COLLECTION_ID, userid as string);

  let updatedFollowing = currentUser.following || [];
  let updatedFollowers = profileUser.followers || 0;

  if (isFollowing) {
    updatedFollowing = updatedFollowing.filter((id: string) => id !== userid);
    updatedFollowers = Math.max(0, updatedFollowers - 1);
  } else {
    updatedFollowing = [...updatedFollowing, userid];
    updatedFollowers += 1;
  }

  await databases.updateDocument(DATABASE_ID!, COLLECTION_ID, authId as string, {
    following: updatedFollowing,
  });

  await databases.updateDocument(DATABASE_ID!, COLLECTION_ID, userid as string, {
    followers: updatedFollowers,
  });

  setUserData((prev) => ({ ...prev, followers: updatedFollowers }));
  setIsFollowing(!isFollowing);
} catch (err: any) {
  console.error('Failed to update follow status:', err);
  setError(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${err.message}`);

  try {
    const fallback = await databases.getDocument(DATABASE_ID!, COLLECTION_ID, userid as string);
    setUserData((prev) => ({ ...prev, followers: fallback.followers || 0 }));
  } catch {}
} finally {
  setFollowLoading(false);
}

};

// ... your existing share modal, report modal, JSX UI and buttons remain the same

return loading ? ( <SkeletonUserProfile /> ) : error ? ( <div className="text-red-500">{error} user: {userid}</div> ) : ( <div className="text-gray-200 p-6 rounded-lg"> {/* ... all your JSX content remains as you originally had it ... */} <SAndG /> </div> ); };

export default UserProfile;

