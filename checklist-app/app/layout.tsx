import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Checklist",
  description: "Recurring checklists",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Checklist',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/logo.svg',
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <div className="flex flex-col flex-1">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}