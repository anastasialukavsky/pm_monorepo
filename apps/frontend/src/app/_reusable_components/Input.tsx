import React, {
  InputHTMLAttributes,
  FocusEvent,
  // useRef,
  // useEffect,
} from 'react';
import {
  UseFormRegister,
  RegisterOptions,
  FieldValues,
  Path,
} from 'react-hook-form';

interface InputProps<T extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  type: string;
  placeholder?: string;
  error?: { message: string };
  register: UseFormRegister<T>;
  autoComplete?: string;
  fieldName: Path<T>;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

export default function Input<T extends FieldValues>({
  type,
  placeholder,
  error,
  autoComplete,
  register,
  fieldName,
  onBlur,
  ...props
}: InputProps<T>) {
  const id = `${fieldName}`;
  // console.log({ id });
  // if (id === 'firstName') {
  //   id = 'first name';
  //   console.log({ id });
  // }
  // const inputRef = useRef<HTMLInputElement | null>(null);

  // useEffect(() => {
  //   console.log(inputRef.current?.value);
  // }, [inputRef.current]);
  return (
    <>
      <input
        // ref={inputRef}
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...register(fieldName, {
          onBlur: (e) => {
            onBlur && onBlur(e);
          },
          ...props,
        } as RegisterOptions)}
      />
      {error && <span>{error.message}</span>}
    </>
  );
}
