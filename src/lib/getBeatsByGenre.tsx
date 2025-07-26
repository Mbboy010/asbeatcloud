import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

export interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  key: string;
  postId: string;
  scale: string;
  beatId: string;
  duration: string;
  userId: string;
  beatId: string;
  dateTime: string;
  fileUrl: string;
  downloadUrl: string;
  imageUrl: string; // Directly uses imageField
  downloads: number;
  likes: number;
  comments: string[];
  likers: string[];
}

export const getBeatsByGenre = async (genre: string, page: number, limit: number) => {
  try {
    const databaseId = process.env.NEXT_PUBLIC_USERSDATABASE; // Replace with your Appwrite database ID
    const collectionId = '686a7cd100087c08444a';// Matches your collection name

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Query Appwrite for beats filtered by genre
    let response;
    if(genre == "others"){
       response = await databases.listDocuments(
      databaseId!,
      collectionId!,
      [
        
           
        Query.notEqual('genre', "Hausa"),
        Query.notEqual('genre', "Afro"),
        Query.notEqual('genre', "Hip hop"),
          
        
        Query.limit(limit),
        Query.offset(offset),
        
      ]
    );
    } else{
      response = await databases.listDocuments(
      databaseId!,
      collectionId!,
      [
        Query.equal('genre', genre.toLowerCase()), // Case-insensitive matching
        Query.limit(limit),
        Query.offset(offset),
      ]
    );
    }
    
    

    // Map Appwrite documents to Beat interface
    const beats: Beat[] = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title || '',
      artist: doc.name || '', // Assuming 'name' is the artist
      genre: doc.genre || '',
      dateTime: doc.uploadDate || '',
      tempo: doc.tempo || 0,
      key: doc.key || '',
      postId: doc.postId || '',
      downloadUrl: doc.downloadUrl || '',
      scale: doc.scale || '',
      userId: doc.userId || '',
      beatId: doc.beatId || '',
      imageUrl: doc.imageFileId || '', // Use imageField directly as imageUrl
      downloads: doc.downloads || 0,
      duration: doc.duration || "00:00",
      likes: doc.likes || 0,
      comments: doc.comments || [],
    }));

    return {
      beats,
      total: response.total,
    };
  } catch (error) {
    console.error('Error fetching beats from Appwrite:', error);
    return { beats: [], total: 0 };
  }
};