import Verification from '../../../components/verify/Verification';


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "verification",
  description: "get verification code in your email"
};


export default function LoginPage() {
  return (
    
    <div className="container bg-[#121212] mx-auto mt-16 p-4">
     <Verification />
    </div>
  );
}