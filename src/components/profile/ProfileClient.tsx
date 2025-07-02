'use client';
import SkeletonArtistProfile from './SkeletonArtistProfile';
import UserNotAvailable from './UserNotAvailable';
import { User } from '../../app/profile/[userid]/page'; // Import the User interface
import { useState, useEffect } from 'react';
import ArtistProfile from '../../components/profile/ArtistProfile';
import TopArtists from '@/components/home/TopArtists';
import BeatItem from '@/components/profile/BeatItem';
import UserProfile from '@/components/profile/UserProfile';
import VerificationIcon from '../icons/VerificationIcon';
import SkeletonUserProfile from './SkeletonUserProfile';
import SAndG from './SAndG';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';



interface ProfileClientProps {
  user: User | null;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ user }) => {
  const [username, setUsername] = useState<string>('AsBeatCloud User');
  
  const router = useRouter();
  const params = useParams();
  const userid = typeof params.userid === 'string' ? params.userid: undefined;
  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
const REPORTS_COLLECTION_ID = 'REPORTS_COLLECTION_ID'; // Replace with actual collection ID
const COLLECTION_ID = '6849aa4f000c032527a9';

  const [loading,setLoading] = useState<boolean>(true)
  const [error, setError] = useState('');
  
  useEffect(() =>{
    
    if (!userid) {
      setError('User ID not provided');
      setLoading(false);
      return;
      }
      
      if (!DATABASE_ID) {
      setError('Database ID is not configured');
      setLoading(false);
      return;
      }
      
      if (!COLLECTION_ID) {
      setError('Collection ID is not configured');
      setLoading(false);
      return;
      }
    
    const checAu = async () =>{
      try {
        const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        userid
      );
      setLoading(false)
        } catch (err: any) {
        setError(`Error fetching user data: ${err.message}`);
        console.error('Failed to fetch user data:', err);
        } finally {
        setLoading(false);
        }
    }
    checAu()
  },[userid,authId])


  if (loading) return <div className="container mx-auto mt-16 min-h-screen bg-[#121212] text-gray-200">
    <SkeletonUserProfile />
    <SkeletonArtistProfile />

    </div>
   
   
  if (error) return <div className="container mx-auto mt-16 min-h-screen bg-[#121212] text-gray-200">
    <UserNotAvailable />
  </div>


  return (
    <div className="container mx-auto mt-16 min-h-screen bg-[#121212] text-gray-200">
      <UserProfile />
      <div className="mt-8">
        <BeatItem />
      </div>
      <div className="mt-8">
        <TopArtists />
      </div>
      <div className="mt-8">
        <ArtistProfile />
      </div>
    </div>
  );
}

export default ProfileClient;