import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/base/LoadingSpinner';
import ErrorMessage from '../../components/base/ErrorMessage';
import Navbar from '../../components/feature/Navbar';
import SwotModal from './components/SwotModal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const setProductInfo = useAppStore((state) => state.setProductInfo);

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    keywords: '',
    targetCustomer: '',
    platform: 'coupang',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [inputMethod, setInputMethod] = useState<'form' | 'pdf'>('form');
  const [showSwotModal, setShowSwotModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProductInfo({
      productName: formData.productName,
      category: formData.category,
      keywords: formData.keywords,
      targetCustomer: formData.targetCustomer,
      platform: formData.platform,
    });

    setShowSwotModal(true);
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.parsePdf(pdfFile);
      
      setProductInfo({
        productName: response.product_name || '',
        category: response.category || '',
        keywords: response.keywords || '',
        targetCustomer: response.target_customer || '',
        platform: response.platform || 'coupang',
      });

      setShowSwotModal(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI 마케팅 자동화 플랫폼
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            상품 정보를 입력하고 SWOT 분석부터 상세페이지 생성까지 자동으로 완성하세요
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Input Method Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setInputMethod('form')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap ${
                inputMethod === 'form'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              직접 입력
            </button>
            <button
              onClick={() => setInputMethod('pdf')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap ${
                inputMethod === 'pdf'
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              PDF 업로드
            </button>
          </div>

          {loading ? (
            <LoadingSpinner
              message="서버 연결 중입니다..."
              subMessage="첫 요청 시 최대 1분이 소요될 수 있습니다"
            />
          ) : error ? (
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          ) : inputMethod === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="예: 프리미엄 무선 이어폰"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="예: 전자기기, 오디오"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 (쉼표로 구분) *
                </label>
                <textarea
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="예: 무선이어폰, 블루투스, 노이즈캔슬링"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타겟 고객 *
                </label>
                <input
                  type="text"
                  name="targetCustomer"
                  value={formData.targetCustomer}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="예: 20-30대 직장인"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼 *
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="coupang">쿠팡</option>
                  <option value="naver">네이버 쇼핑</option>
                  <option value="gmarket">G마켓</option>
                  <option value="11st">11번가</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-md whitespace-nowrap"
              >
                다음 단계로 진행
              </button>
            </form>
          ) : (
            <form onSubmit={handlePdfSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF 파일 업로드
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-teal-100 rounded-full mb-4">
                      <i className="ri-file-pdf-line text-3xl text-teal-500"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {pdfFile ? pdfFile.name : 'PDF 파일을 선택하세요'}
                    </p>
                    <p className="text-xs text-gray-500">
                      상품 정보가 포함된 PDF 파일
                    </p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!pdfFile}
                className="w-full py-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                PDF 분석 및 다음 단계로
              </button>
            </form>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-teal-100 rounded-full mx-auto mb-4">
              <i className="ri-line-chart-line text-2xl text-teal-500"></i>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">SWOT 분석</h3>
            <p className="text-xs text-gray-600">경쟁사 분석 및 시장 조사</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-orange-100 rounded-full mx-auto mb-4">
              <i className="ri-file-text-line text-2xl text-orange-500"></i>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">상세페이지</h3>
            <p className="text-xs text-gray-600">자동 생성 및 최적화</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-purple-100 rounded-full mx-auto mb-4">
              <i className="ri-chat-3-line text-2xl text-purple-500"></i>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">AI 챗봇</h3>
            <p className="text-xs text-gray-600">마케팅 전략 상담</p>
          </div>
        </div>
      </div>

      {/* SWOT Modal */}
      {showSwotModal && (
        <SwotModal onClose={() => setShowSwotModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
