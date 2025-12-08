import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { apiService, getFullUrl } from '../../services/api';
import LoadingSpinner from '../../components/base/LoadingSpinner';
import ErrorMessage from '../../components/base/ErrorMessage';
import Navbar from '../../components/feature/Navbar';

const DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const productInfo = useAppStore((state) => state.productInfo);
  const setDetailResult = useAppStore((state) => state.setDetailResult);

  const [formData, setFormData] = useState({
    platform: 'coupang',
    tone: 'friendly',
    imageStyle: 'real',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productInfo) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.executeDetail({
        platform: formData.platform,
        tone: formData.tone,
        image_style: formData.imageStyle,
      });

      setResult(response);
      setDetailResult({
        markdownUrl: response.markdown_url || '',
        htmlUrl: response.html_url || '',
        images: response.images || [],
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = () => {
    if (result?.html_url) {
      navigate('/result-html', { state: { url: getFullUrl(result.html_url), title: '상세페이지 결과' } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              상세페이지 생성
            </h1>
            <p className="text-lg text-gray-600">
              AI가 자동으로 최적화된 상세페이지를 생성합니다
            </p>
          </div>

          {productInfo && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {loading ? (
              <LoadingSpinner
                message="상세페이지를 생성하고 있습니다..."
                subMessage="약 2분 정도 소요됩니다"
              />
            ) : error ? (
              <ErrorMessage error={error} onRetry={() => setError(null)} />
            ) : result ? (
              <div>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
                    <i className="ri-check-line text-4xl text-green-500"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">생성 완료!</h3>
                </div>

                {result.images && result.images.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">생성된 이미지</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {result.images.map((img: string, index: number) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getFullUrl(img)}
                            alt={`Generated ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleViewResult}
                    className="flex-1 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
                  >
                    HTML 결과 보기
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex-1 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap"
                  >
                    AI 챗봇 상담
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    플랫폼
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="coupang">쿠팡</option>
                    <option value="naver">네이버 쇼핑</option>
                    <option value="gmarket">G마켓</option>
                    <option value="11st">11번가</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    톤 앤 매너
                  </label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="friendly">친근한</option>
                    <option value="professional">전문적인</option>
                    <option value="luxury">고급스러운</option>
                    <option value="casual">캐주얼한</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 스타일
                  </label>
                  <select
                    name="imageStyle"
                    value={formData.imageStyle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="real">실사</option>
                    <option value="cartoon">카툰</option>
                    <option value="minimal">미니멀</option>
                    <option value="modern">모던</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-md whitespace-nowrap"
                >
                  상세페이지 생성 시작
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
