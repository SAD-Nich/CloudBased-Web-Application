import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderClient from "../components/HeaderClient"; // new client wrapper
import Footer from "../components/Footer";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the assignment
export const metadata: Metadata = {
  title: "Assignment 1 – Next.js Project",
  description: "Student: Your Name | ID: 123456",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HeaderClient>
          <main style={{ minHeight: "80vh", padding: "1rem" }}>{children}</main>
          <Footer />
        </HeaderClient>
      </body>
    </html>
  );
}