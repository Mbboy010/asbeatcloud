
import React from 'react'

import AuthNav from '@/components/authCheck/AuthNav';
import EditProfile from '@/components/profile/EditProfile';
export default function EditPage() {
  return (
    <div className="min-h-screen text-gray-200 bg-[#121212] pt-16">
      <AuthNav /> 

    
      <div className="container mx-auto mt-8">
        <EditProfile />
      </div>
    
    </div>
  )
}