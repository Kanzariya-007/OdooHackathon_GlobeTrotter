import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  isTextArea?: boolean;
}

type InputProps = BaseInputProps & 
  (InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>);

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isTextArea = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const baseInputStyles = `w-full px-3.5 py-2 border rounded-lg text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-100 ${
    error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
  }`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      {isTextArea ? (
        <textarea
          id={inputId}
          className={`${baseInputStyles} resize-y min-h-[100px] ${className}`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={`${baseInputStyles} ${className}`}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
