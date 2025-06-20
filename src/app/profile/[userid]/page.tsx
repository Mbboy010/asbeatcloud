import { Metadata } from 'next';
import ProfileClient from '@/components/profile/ProfileClient';
import { databases } from '@/lib/appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!;
const COLLECTION_ID = '6849aa4f000c032527a9';

// ✅ Fix type definition here:
type PageProps = {
  params: {
    userid: string;
  };
};

// ✅ Your fetch function
async function getUser(documentId: string) {
  if (!documentId) return null;

  try {
    const user = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);
    return user;
  } catch (error) {
    console.error('Appwrite error:', error);
    return null;
  }
}

// ✅ Metadata generation function
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUser(params.userid);

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
      url: `https://asbeatcloud.vercel.app/profile/${params.userid}`,
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

// ✅ Page component
export default async function ProfilePage({ params }: PageProps) {
  const user = await getUser(params.userid);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-gray-900">
        <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
        <p className="text-lg">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <ProfileClient user={user} />;
}