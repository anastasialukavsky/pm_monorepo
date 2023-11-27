import { useState } from 'react';

export function useShowConfirmPassword() {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleConfirmPasswordVisibiity = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return { showConfirmPassword, toggleConfirmPasswordVisibiity };
}
