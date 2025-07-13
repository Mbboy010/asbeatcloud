import UploadGallery from '../../../components/profile/UploadGallery';
import React from 'react'

import { Metadata } from 'next';



export const metadata: Metadata = {
  title: "Upload gallery",
  description:"Upload gallery image and social accounts"
};


export default function GalleryPage() {
  return (
    <div className="container mx-auto mt-16 p-4">
      <UploadGallery />

    </div>
  )
}