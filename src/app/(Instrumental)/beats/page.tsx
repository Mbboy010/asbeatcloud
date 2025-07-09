"use client"

import React from 'react'
import {databases} from "../../../lib/appwrite"

export default function page() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || '';
const REPORTS_COLLECTION_ID = 'REPORTS_COLLECTION_ID'; // Replace with actual collection ID
const COLLECTION_ID = '6849aa4f000c032527a9';
  const handle = async () =>{
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, "686ed0e3e7960d129b10", {
            followers: 2430,
          });
  }
  
  return (
  <div>
      <button className="p-4 bg-red-500 mt-20" onClick={handle}>add follower</button>
  </div>
  )
  }