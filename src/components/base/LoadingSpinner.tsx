import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="mt-6 text-lg font-medium text-gray-800">{message}</p>
      )}
      {subMessage && (
        <p className="mt-2 text-sm text-gray-500">{subMessage}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
