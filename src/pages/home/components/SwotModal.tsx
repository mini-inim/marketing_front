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
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'days' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.executeSwot({
        days: formData.days,
        search_depth: formData.searchDepth,
        include_reviews: formData.includeReviews,
      });

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

  const handleViewResult = () => {
    if (result?.html_url) {
      onClose();
      navigate('/result-html', { state: { url: getFullUrl(result.html_url), title: 'SWOT 분석 결과' } });
    }
  };

  const handleSkip = () => {
    onClose();
    navigate('/detail');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">SWOT + 3C 분석</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-8">
          {productInfo && (
            <div className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">현재 상품 정보</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">상품명:</span>
                  <span className="ml-2 font-medium text-gray-800">{productInfo.productName}</span>
                </div>
                <div>
                  <span className="text-gray-500">카테고리:</span>
                  <span className="ml-2 font-medium text-gray-800">{productInfo.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">플랫폼:</span>
                  <span className="ml-2 font-medium text-gray-800">{productInfo.platform}</span>
                </div>
                <div>
                  <span className="text-gray-500">타겟:</span>
                  <span className="ml-2 font-medium text-gray-800">{productInfo.targetCustomer}</span>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSpinner
              message="SWOT 분석을 진행하고 있습니다..."
              subMessage="약 1분 정도 소요됩니다"
            />
          ) : error ? (
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          ) : result ? (
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                <i className="ri-check-line text-4xl text-green-500"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">분석 완료!</h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6 text-left">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">발견된 경쟁사</p>
                    <p className="text-2xl font-bold text-teal-500">{result.competitor_count || 0}개</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">분석 상태</p>
                    <p className="text-2xl font-bold text-green-500">완료</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleViewResult}
                  className="flex-1 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
                >
                  결과 보기
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                >
                  상세페이지 생성하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  조사 기간 (일)
                </label>
                <select
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value={3}>3일</option>
                  <option value={7}>7일</option>
                  <option value={14}>14일</option>
                  <option value={30}>30일</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색 깊이
                </label>
                <select
                  name="searchDepth"
                  value={formData.searchDepth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="basic">기본 (빠름)</option>
                  <option value="advanced">고급 (상세)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="includeReviews"
                  checked={formData.includeReviews}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                  id="includeReviews"
                />
                <label htmlFor="includeReviews" className="ml-3 text-sm font-medium text-gray-700">
                  리뷰 데이터 포함
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-md whitespace-nowrap"
                >
                  SWOT 분석 시작
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
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
