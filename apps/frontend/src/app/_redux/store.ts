'use client';

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});


//new
// export type AppStore = ReturnType<typeof store>;
// export type RootState = ReturnType<AppStore['getState']>;
// export type AppDispatch = AppStore['dispatch'];

//old
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
