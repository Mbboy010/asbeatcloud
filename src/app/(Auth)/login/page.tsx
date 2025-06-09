import Login from '@/components/login/Login';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your AsbeatCloud account with ease. Enter your email and password or use Google and Facebook for a quick login. Experience a smooth, animated interface with a progress bar for seamless authentication. Access your music dashboard now!"
};


export default function LoginPage() {
  return (
    <div className="container bg-[#121212] mx-auto mt-16 p-4">
      <Login />
    </div>
  );
}