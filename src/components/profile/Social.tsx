 "use client"


import Link from 'next/link';
import { motion,AnimatePresence } from 'framer-motion';
import { Twitter, Instagram, Facebook,Youtube,MessageSquare  , LucideIcon, X} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';

export default function Social() {
  
  const platformIcons: Record<string, LucideIcon> = {
    Twitter,
    Instagram,
    Facebook,
    Youtube,
    MessageSquare
  };

  // Get authenticated user ID from Redux store
  const userId = useAppSelector((state) => state.authId.value);
  const router = useRouter();
  const params = useParams();
  const useridparams = typeof params.userid === 'string' ? params.userid : null;
  
  const [shown,setShown] = useState<boolean>(false)
  
  const [socials, setSocials] = useState<
    { platform: string; url: string; color: string }[]
  >([]);
   const d = params.userid
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const doc = await databases.getDocument(
          process.env.NEXT_PUBLIC_USERSDATABASE!,
          '6849aa4f000c032527a9',
          d as string 
        );

        // Parse each social attribute
        const social1 = JSON.parse(doc.socialone || '{}');
        const social2 = JSON.parse(doc.socialtwo || '{}');
        const social3 = JSON.parse(doc.socialthree || '{}');

        // Combine all into one array, filter empty entries
        const all = [social1, social2, social3].filter((s) => s.platform);

        // Save to state
        setSocials(all);
      } catch (err) {
        console.error('Failed to load social links:', err);
      }
    };

    fetchSocials();
  }, [userId]);

  
  
  
  
  const added = async () => {
    setShown(true)
  }
  
  return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Social</h3>

         {
           socials.length <= 0 ? (
             <p className="text-gray-400 text-[1rem] font-mono">social media not available!</p>
             ):(
          <div className="flex space-x-4">
          {socials.map((link,index) => {
            const IconComponent = platformIcons[link.platform];
            return (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center ${link.color} transition duration-200`}
                >
                  <IconComponent className="w-6 h-6 mr-1" />
                  <span className="text-sm">{link.platform}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
               )
         }
       {
      useridparams == userId && <div className="mt-3">
        <button className="text-[1rem] font-semibold text-red-400 hover:text-red-500" onClick={added}>Edit social</button>
      </div>
       }
       
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed backdrop-blur left-0 top-0 bg-[#0000006f] z-40 min-h-screen w-screen"
          >
          
          <div className="h-12 w-full flex justify-end">
          <X className="w-9 mt-4 mr-4 h-9
          text-gray-200" />
          </div>
          
          </motion.div>
        )}
      </AnimatePresence>
       
      </div>
  )
}