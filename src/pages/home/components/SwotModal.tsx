import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';
import { apiService, getFullUrl } from '../../../services/api';
import LoadingSpinner from '../../../components/base/LoadingSpinner';
import ErrorMessage from '../../../components/base/ErrorMessage';

interface SwotModalProps {
  onClose: () => void;
}

const SwotModal: React.FC<SwotModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  const productInfo = useAppStore((state) => state.productInfo);
  const sessionId = useAppStore((state) => state.sessionId);

  const setSwotResult = useAppStore((state) => state.setSwotResult);
  

  const [formData, setFormData] = useState({
    days: 7,
    searchDepth: 'basic' as 'basic' | 'advanced',
    includeReviews: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox 
        ? (e.target as HTMLInputElement).checked 
        : name === 'days' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo || !sessionId) return; // 상품 정보가 없으면 중단

    setLoading(true);
    setError(null);

    try {
      const combinedRequest = {
        session_id: sessionId,
        product_name: productInfo.productName, 
        category: productInfo.category,
        keywords: productInfo.keywords,
        target_customer: productInfo.targetCustomer,
        platform: productInfo.platform,
        days: formData.days,
        search_depth: formData.searchDepth,
        include_reviews: formData.includeReviews,
      };

      // API 호출
      const response = await apiService.executeSwot(combinedRequest);

      setResult(response);
      setSwotResult({
        htmlUrl: response.html_url || '',
        competitorCount: response.competitor_count || 0,
        analysisResult: response,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
  onClose();
  // URL 구조: /xyz-123/detail-html
  if (sessionId) {
    navigate(`/${sessionId}/detail-html`);
  } else {
    navigate('/detail-html'); // 방어 코드
  }
};

const handleViewResult = () => {
  if (result?.html_url) {
    onClose();
    // 세션 정보와 함께 결과 페이지로 이동 (State도 함께 활용 가능)
    navigate(`/${sessionId}/result-html`, { 
      state: { 
        url: getFullUrl(result.html_url), 
        title: 'SWOT 분석 결과',
        sessionId: sessionId 
      } 
    });
  }
};



  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">시장 분석 설정</h2>
            <p className="text-sm text-gray-500 mt-1">입력하신 정보를 바탕으로 경쟁사 데이터를 분석합니다.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="overflow-y-auto p-8">
          {/* 상단: Homepage에서 추출된 데이터 표시 (Read-only Dashboard) */}
          {productInfo && (
            <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3 text-teal-700">
                <i className="ri-information-line"></i>
                <h3 className="text-sm font-bold">분석 대상 상품 정보</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex justify-between border-b border-teal-100/50 pb-1">
                  <span className="text-gray-500">상품명</span>
                  <span className="font-semibold text-gray-800">{productInfo.productName}</span>
                </div>
                <div className="flex justify-between border-b border-teal-100/50 pb-1">
                  <span className="text-gray-500">카테고리</span>
                  <span className="font-semibold text-gray-800">{productInfo.category}</span>
                </div>
                <div className="flex justify-between border-b border-teal-100/50 pb-1">
                  <span className="text-gray-500">플랫폼</span>
                  <span className="font-semibold text-gray-800 uppercase">{productInfo.platform}</span>
                </div>
                <div className="flex justify-between border-b border-teal-100/50 pb-1">
                  <span className="text-gray-500">타겟</span>
                  <span className="font-semibold text-gray-800">{productInfo.targetCustomer}</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12">
              <LoadingSpinner
                message="경쟁사 데이터를 수집하고 분석 중입니다..."
                subMessage="시장 점유율 및 SWOT 매트릭스를 생성하고 있습니다 (약 1분 소요)"
              />
            </div>
          ) : error ? (
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          ) : result ? (
            /* 분석 완료 뷰 */
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                <i className="ri-check-double-line text-4xl text-green-500"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">시장 분석이 완료되었습니다!</h3>
              <p className="text-gray-500 mb-6">수집된 경쟁사 데이터를 확인하고 마케팅 전략을 수립하세요.</p>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-8 flex justify-around">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">분석된 경쟁사</p>
                  <p className="text-3xl font-black text-teal-600">{result.competitor_count || 0}<span className="text-sm font-normal text-gray-400 ml-1">개</span></p>
                </div>
                <div className="border-r border-gray-200"></div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">분석 퀄리티</p>
                  <p className="text-3xl font-black text-green-600">High</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleViewResult}
                  className="flex-1 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-200 transition-all"
                >
                  SWOT 리포트 보기
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                >
                  상세페이지 생성
                </button>
              </div>
            </div>
          ) : (
            /* 분석 전 설정 폼 */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">조사 기간</label>
                  <select
                    name="days"
                    value={formData.days}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value={3}>최근 3일 데이터</option>
                    <option value={7}>최근 7일 데이터</option>
                    <option value={14}>최근 14일 데이터</option>
                    <option value={30}>최근 1개월 데이터</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">검색 심도</label>
                  <select
                    name="searchDepth"
                    value={formData.searchDepth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="basic">기본 분석 (빠른 속도)</option>
                    <option value="advanced">심층 분석 (정밀 분석)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  name="includeReviews"
                  checked={formData.includeReviews}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  id="includeReviews"
                />
                <label htmlFor="includeReviews" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  경쟁사 리뷰 감성 분석 포함 <span className="text-xs text-teal-600 font-normal ml-1">(추천)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all"
                >
                  분석 시작하기
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  건너뛰기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwotModal;