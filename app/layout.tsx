import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated metadata for Clique Cafe
export const metadata: Metadata = {
  title: "Clique Cafe | Boutique Experience",
  description: "Official digital menu for Clique Cafe. Powered by Aparup Barua.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // It is often safer to add this to the html tag as well if extensions inject there
      suppressHydrationWarning={true} 
    >
      <body 
        className="min-h-full flex flex-col"
        // This specifically stops React from complaining about attributes added by extensions
        suppressHydrationWarning={true} 
      >
        {children}
      </body>
    </html>
  );
}