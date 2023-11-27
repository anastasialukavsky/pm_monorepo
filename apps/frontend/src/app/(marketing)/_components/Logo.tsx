import React from 'react';
import { Archivo_Black } from 'next/font/google';

const archivo = Archivo_Black({
  style: 'normal',
  weight: '400',
});
export default function Logo() {
  return (
    <div className={`${archivo.className} text-3xl text-slate-700`}>
      TaskTide
    </div>
  );
}
