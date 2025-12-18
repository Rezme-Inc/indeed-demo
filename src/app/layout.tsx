import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rezme - Professional Profile Management",
  description:
    "Manage your professional profile and connect with HR professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen relative overflow-hidden">
          {/* Animated gradient orbs for depth - Subtle */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ backgroundColor: '#e0e0e0' }}></div>
            <div className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ backgroundColor: '#d0d0d0', animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ backgroundColor: '#e0e0e0', animationDelay: '4s' }}></div>
          </div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'glass',
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#000',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}
