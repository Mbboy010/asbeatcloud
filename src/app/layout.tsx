import UserId from '../components/authCheck/UserId';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Providers} from "../components/layout/Provider"
import Footer from '../components/footer/Footer';
import Navbar from '@/components/nav/Navbar';
import Sidebar from '@/components/nav/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AsbeatCloud",
    template: "%s - AsbeatCloud",
  },
  description: "Welcome to AsbeatCloud, your ultimate music platform! Explore home features, upload tracks, and discover instrumentals. Log in or sign up to start creating and sharing your music with a vibrant community."
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <Providers>
        <Navbar  /> 
        <Sidebar />
        <UserId />
        <div className="relative min-h-screen w-screen">
        {children}
        </div>
        <Footer />
      </Providers>
      </body>
    </html>
  );
}
