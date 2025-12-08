import React from 'react';

interface ErrorMessageProps {
  error: any;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  const getErrorMessage = (err: any) => {
    if (!err) return '알 수 없는 오류가 발생했습니다.';
    
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    switch (status) {
      case 400:
        return `잘못된 요청입니다: ${message}`;
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return message || '오류가 발생했습니다.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
        <i className="ri-error-warning-line text-3xl text-red-500"></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
