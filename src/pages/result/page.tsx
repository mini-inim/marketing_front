import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { url, title } = location.state || {};

  if (!url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">결과를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <div className="pt-20 flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{title || '결과 보기'}</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              뒤로 가기
            </button>
          </div>
        </div>

        <div className="flex-1">
          <iframe
            src={url}
            title={title || 'Result'}
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 140px)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
