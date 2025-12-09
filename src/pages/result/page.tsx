import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import { useAppStore } from '@/store/useAppStore';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { url, title } = location.state || {};
  const sessionId = useAppStore((state) => state.sessionId);

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
        <div className="flex-1">
          <iframe
            src={url}
            title={title || 'Result'}
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 140px)' }}
          />
          
          <button
            onClick={() => navigate(`/${sessionId}/detail-html`)}
            className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            상세페이지 제작하기
          </button>
          
        </div>
        
      </div>
    </div>
  );
};

export default ResultPage;
