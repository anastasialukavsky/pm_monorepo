'use client';
import React from 'react';
import Navigation from './_components/Navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  //* implement isAuthenticated on the top layer layout to protect all the workspace routes
  return (
    <section className='h-full flex '>
      <Navigation/>
      <main className='h-full flex-1 overflow-y-auto'>{children}</main>
    </section>
  );
}
