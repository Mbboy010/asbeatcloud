
import { Metadata } from 'next';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import ProfileClient from '@/components/profile/ProfileClient';

// Environment variables
const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION || '6849aa4f000c032527a9';

// Define the Appwrite document type for your collection
interface UserDocument extends Models.Document {
  username: string; // Match the field name in Appwrite collection
  firstName: string;
  lastName: string;
  bio?: string;
  image?: string;
}

// Define the user type for your application
export interface User {
  $id: string;
  userid: string;
  firstName: string;
  lastName: string;
  bio?: string;
  image?: string;
}

// Props for the page and metadata
type PageProps = {
  params: Promise<{ userid: string }>;
};

// Map Appwrite document to User interface
function mapDocumentToUser(doc: UserDocument): User {
  return {
    $id: doc.$id,
    userid: doc.username, // Map 'username' from Appwrite to 'userid' in User
    firstName: doc.firstName,
    lastName: doc.lastName,
    bio: doc.bio,
    image: doc.image,
  };
}

// Fetch user data from Appwrite
async function getUser(userid: string): Promise<User | null> {
  try {
    const response = await databases.listDocuments<UserDocument>(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('username', userid)] // Query by 'username' field
    );

    if (response.documents.length === 0) {
      return null;
    }

    return mapDocumentToUser(response.documents[0]);
  } catch (error) {
    console.error('Error fetching user from Appwrite:', error);
    return null;
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userid } = await params;
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
  const { userid } = await params;
  const user = await getUser(userid);
  let m = "k"
  return <ProfileClient  />;
}