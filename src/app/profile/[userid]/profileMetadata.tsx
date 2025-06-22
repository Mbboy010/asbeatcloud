// app/profile/[userid]/profileMetadata.ts
import type { Metadata } from 'next';
import { databases } from '@/lib/appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!;
const COLLECTION_ID = '6849aa4f000c032527a9';

async function getUser(id: string) {
  if (!id) return null;

  // Replace with real Appwrite call if needed
  return {
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Producer of lo-fi beats.',
    profileImageUrl: 'https://example.com/avatar.jpg',
  };
}

export async function profileMetadataProvider(userid: string): Promise<Metadata> {
  const user = await getUser(userid);

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'This user does not exist.',
    };
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const imageUrl =
    user.profileImageUrl ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${fullName}'s Profile`,
    description: user.bio || `Check out ${fullName}'s profile on AsbeatCloud.`,
    openGraph: {
      title: `${fullName}'s Profile - AsbeatCloud`,
      description: user.bio || '',
      url: `https://asbeatcloud.vercel.app/profile/${userid}`,
      siteName: 'AsbeatCloud',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${fullName}'s Profile Image`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName}'s Profile - AsbeatCloud`,
      description: user.bio || '',
      images: [imageUrl],
    },
  };
}