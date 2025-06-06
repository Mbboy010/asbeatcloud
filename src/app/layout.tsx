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

export const metadata = {
  title: 'AsbeatCloud',
  description: 'A platform to upload and share music',
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
        <div className="relative min-h-screen w-screen">
        {children}
        </div>
        <Footer />
      </Providers>
      </body>
    </html>
  );
}
