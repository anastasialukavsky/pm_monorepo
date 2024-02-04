'use client'
import React, { useContext } from 'react';
import Navigation from '../../_components/Navigation';
import { AuthContext } from '@/app/_store/authContext';

export default function Workspace() {
  const authContext = useContext(AuthContext);


  console.log({authContext})
  // console.log(authContext.user.firstName)
  return <section className='h-[100dvh] top-[48px] bg-blue-200 flex flex-col items-center justify-center'>

   <p>workspace</p>
  </section>;
}
