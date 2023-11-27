import { useState } from 'react';

export function useShowPassword() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return { showPassword, togglePasswordVisibility };
}
