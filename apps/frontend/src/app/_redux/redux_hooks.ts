import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore as useReduxStore,
  useStore,
} from 'react-redux';
import type { RootState, AppDispatch } from './store';

// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// export const useAppDispatch = () => useDispatch<AppDispatch>();

// // Define a custom hook that returns the correct store type
// export const useAppStore = () => useReduxStore<AppStore>();


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
// export const useAppStore: () => AppStore = useStore