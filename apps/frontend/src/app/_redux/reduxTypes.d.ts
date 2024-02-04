'use client';

export type TReduxUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type TReduxError = {
  status: number | null;
  message: string | null;
};
