import Signup from '@/components//signup/Signup';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:"Create an account on AsbeatCloud with our easy 4-step signup process. Enter your first and last name, username, email, gender, date of birth, address, and password to join. Enjoy secure sign-up options with Google and Facebook. Start your music journey today!"
};


export default function SignupPage() {
  return (
    <div className="container mx-auto mt-16 p-4">
      <Signup />
    </div>
  );
}