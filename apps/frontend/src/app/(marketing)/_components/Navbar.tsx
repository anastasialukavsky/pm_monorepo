import React from 'react';
import Logo from './Logo';

export default function Navbar() {
  return (
    <div className="h-[48px] w-[100vw] fixed top-0 border border-b-slate-700 p-3">
      <Logo />
    </div>
  );
}
