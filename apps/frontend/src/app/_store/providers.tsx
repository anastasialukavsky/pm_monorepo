'use client';

import React from 'react'
import { AuthContextProvider } from './authContext';

export default function Providers({children}:any) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}
