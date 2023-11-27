import React from 'react';
interface LabelProps {
  htmlFor: string;
  label: string;
}

export default function Label({ htmlFor, label }: LabelProps) {
  let formattedLabel: string;

  switch (label) {
    case 'firstName':
      formattedLabel = 'first name';
      break;
    case 'lastName':
      formattedLabel = 'last name';
      break;
    case 'confirmPassword':
      formattedLabel = 'confirm password';
      break;

    default:
      formattedLabel = label;
      break;
  }

  return (
    <label htmlFor={htmlFor} className="mb-1">
      {formattedLabel}
    </label>
  );
}
