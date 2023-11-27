/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable react/jsx-no-comment-textnodes */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import Navbar from './(marketing)/_components/Navbar';
import ThemeProvider from './_providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskTide',
  description: ' A place where better, faster work happens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={`${inter.className}`}>
        <Navbar />
        <main>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            storageKey="task-tide"
          >
            {children}
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
