import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);

export async function saveTimesToAppwrite(): Promise<any> {
  try {
    

    return await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        currentTime: currentTime.toISOString(),
        targetTime: targetTime.toISOString(),
      },
    );
  } catch (error) {
    console.error('Error saving times to Appwrite:', error);
    throw error;
  }
}
