"use client"

import { useEffect, useState } from 'react';
import { account,storage } from '@/lib/appwrite';

export default function UserIdComponent() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    account.get()
      .then((user) => {
        setUserId(user.$id);
      })
      .catch((error) => {
        console.error('User not authenticated:', error);
        setUserId(null);
      });
  });
  
  

async function deleteFile() {
  try {
    await storage.deleteFile("6849a34c0027417cde77", "684ea7a5000ca181e8cf");
    console.log("✅ File deleted successfully.");
  } catch (error) {
    console.error("❌ Error deleting file:", error.message);
  }
}



  return ( <div>
     <p className="mt-20 text-white
  ">User ID: {userId}</p>
  <button  className="text-white p-4" onClick={deleteFile}>save data</button>
  </div>)
}