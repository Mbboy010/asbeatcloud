import { Metadata } from 'next';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import ProfileClient from '@/components/profile/ProfileClient';

// Environment variables (ensure these are set in .env)
const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION || '6849aa4f000c032527a9';

// Define the user document type based on your Appwrite collection schema
interface User {
  $id: string;
  userid: string;
  firstName: string;
  lastName: string;
  bio?: string;
  image?: string;
}

// Props for the page and metadata
type PageProps = {
  params: Promise<{ userid: string }>; // Explicitly type params as a Promise
};

// Fetch user data from Appwrite
async function getUser(userid: string): Promise<User | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('username', userid)] // Updated to match User interface field 'userid'
    );

    if (response.documents.length === 0) {
      return null;
    }

    return response.documents[0] as User;
  } catch (error) {
    console.error('Error fetching user from Appwrite:', error);
    return null;
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userid } = await params; // Await params before destructuring
  const user = await getUser(userid);

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'This user does not exist.',
    };
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const imageUrl = user.profileImageUrl || 'https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/685801850016a00b3c79/view?project=6840dd66001574a22f81&mode=admin';

  return {
    title: `${fullName}`,
    description: user.bio || `Check out ${fullName}'s profile on AsbeatCloud.`,
    openGraph: {
      title: `${fullName} - AsbeatCloud`,
      description: user.bio || `Check out ${fullName}'s profile on AsbeatCloud.`,
      url: `https://asbeatcloud.vercel.app/profile/${user.userid}`,
      siteName: 'AsbeatCloud',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${fullName} Profile Image`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName} - AsbeatCloud`,
      description: user.bio || `Check out ${fullName}'s profile on AsbeatCloud.`,
      images: [imageUrl],
    },
  };
}

// Page component
export default async function ProfilePage({ params }: PageProps) {
  const { userid } = await params; // Await params
  const user = await getUser(userid);

  return <ProfileClient user={user} />;
}