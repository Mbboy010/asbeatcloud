
import AuthNav from '@/components/authCheck/AuthNav';
import { Metadata } from 'next';
import EditProfile from '@/components/profile/EditProfile';



export const metadata: Metadata = {
  title: "Edit profile",
  description:"Edit profile and upload images to profile..."
};



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