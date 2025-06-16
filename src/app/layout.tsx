"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { ThemeProvider as AppThemeProvider } from "@/context/themeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="The AI resume writer" />
        <meta name="keywords" content="SaaS, Resume, ai, Next.js" />
        <meta name="author" content="Fourier Gauss Labs" />
        <meta property="og:title" content="Resume" />
        <meta property="og:description" content="The AI resume writer" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://fouriergauss.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resume" />
        <meta name="twitter:description" content="The AI resume writer" />
        <meta name="twitter:image" content="/logo.png" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://fouriergauss.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppThemeProvider>
            <Toaster position="top-right" />
            {children}
          </AppThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}