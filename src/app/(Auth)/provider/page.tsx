'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, storage } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';

export default function ProviderPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!;
  const COLLECTION_ID = '6849aa4f000c032527a9';
  const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateImage = (width: number, height: number, text: string, fontSize: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, getRandomColor());
    gradient.addColorStop(1, getRandomColor());

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px Arial`;
    const [line1, line2] = text.includes(' ') ? text.split(/ (.+)/) : [text, ''];
    ctx.fillText(line1, width / 2, height / 2 - 40);
    if (line2) ctx.fillText(line2, width / 2, height / 2 + 80);

    return new Promise((resolve) => {
      let quality = 0.6;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Image generation failed');
          if (blob.size / 1024 > 50 && quality > 0.1) {
            quality -= 0.05;
            tryCompress();
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    });
  };

  useEffect(() => {
    const run = async () => {
      try {
        const user = await account.get();
        dispatch(setAuthId(user.$id));
        dispatch(setIsAuth(true));

        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const email = user.email || '';

        const profileBlob = await generateImage(768, 768, `${firstName} ${lastName}`, 110);
        const profileFile = new File([profileBlob], `${user.$id}-profile.jpg`, { type: 'image/jpeg' });
        const profileResponse = await storage.createFile(BUCKET_ID, ID.unique(), profileFile);
        const profileImageUrl = storage.getFileView(BUCKET_ID, profileResponse.$id).toString();

        const headerBlob = await generateImage(1000, 500, `${firstName} ${lastName}`, 80);
        const headerFile = new File([headerBlob], `${user.$id}-header.jpg`, { type: 'image/jpeg' });
        const headerResponse = await storage.createFile(BUCKET_ID, ID.unique(), headerFile);
        const headerImageUrl = storage.getFileView(BUCKET_ID, headerResponse.$id).toString();

        await databases.createDocument(DATABASE_ID, COLLECTION_ID, user.$id, {
          firstName,
          lastName,
          username: user.$id,
          email,
          profileImageUrl,
          headerImageUrl,
          createdAt: new Date().toISOString(),
        });

        window.location.href = `${window.location.origin}/profile/${user.$id}`;
      } catch (err) {
        console.error('OAuth callback error:', err);
        router.push('/signup?error=auth_failed');
      }
    };

    run();
  }, [dispatch, router]);

  return (
    <div className="flex z-50 justify-center items-center min-h-screen w-screen">
     <p className="text-white">Logging you in...</p>
    </div>
    )
}