import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService, ProductInfoRequest } from '../../services/api';
import LoadingSpinner from '../../components/base/LoadingSpinner';
import ErrorMessage from '../../components/base/ErrorMessage';
import Navbar from '../../components/feature/Navbar';
import SwotModal from './components/SwotModal';

const HomePage: React.FC = () => {
  const setProductInfo = useAppStore((state) => state.setProductInfo);
  const setSessionId = useAppStore((state) => state.setSessionId);

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
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  // 헬퍼 함수: 문자열 키워드를 배열로 변환
  const formatKeywords = (keywordsStr: string): string[] => {
    if (!keywordsStr) return [];
    return keywordsStr
      .split(',') // 쉼표로 분리
      .map((k) => k.trim()) // 공백 제거
      .filter((k) => k !== ''); // 빈 값 제거
  };

  const registerAndOpenModal = async (requestData: ProductInfoRequest) => {
    try {
      
      const response = await apiService.startUnified(requestData);
      console.log("response: ", response)
      
      if(response.session_id){
        setSessionId(response.session_id)
      }

      setProductInfo({
        productName: requestData.product_name,
        category: requestData.category,
        keywords: requestData.keywords, // 배열 형태로 저장
        targetCustomer: requestData.target_customer,
        platform: requestData.platform,
      });

      setShowSwotModal(true);
    } catch (err) {
      throw err;
    }
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) return;
    setLoading(true);
    setError(null);

    try {
      const parsedData = await apiService.parsePdf(pdfFile);
      
      const requestData: ProductInfoRequest = {
        product_name: parsedData.product_name || 'PDF 추출 상품',
        category: parsedData.category || '기타',
        // (수정) PDF에서 받은 키워드도 서버가 리스트를 기대하면 배열화 처리
        keywords: Array.isArray(parsedData.keywords) 
          ? parsedData.keywords 
          : formatKeywords(parsedData.keywords || ''),
        target_customer: parsedData.target_customer || '미지정',
        platform: parsedData.platform || 'coupang',
      };

      await registerAndOpenModal(requestData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 직접 입력 제출 핸들러
  const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // 쉼표로 구분된 문자열을 배열로 변환
  const keywordsArray = formData.keywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k !== '');

  const requestData: ProductInfoRequest = {
    ...formData,
    product_name: formData.productName,
    target_customer: formData.targetCustomer,
    keywords: keywordsArray, // 여기서 배열로 전달
  };

  try {
    const response = await apiService.startUnified(requestData);
    
    // Zustand 스토어에도 동일하게 배열로 저장
    setProductInfo({
      ...formData,
      keywords: keywordsArray,
    });

    setSessionId(response.session_id)

    console.log("response: ", response)
    
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
      
      <div className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">SellFlow AI</h1>
        <p className="text-lg text-gray-600">정보를 입력하거나 PDF를 업로드하여 분석을 시작하세요</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setInputMethod('form')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                inputMethod === 'form' ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100'
              }`}
            >
              직접 입력
            </button>
            <button
              onClick={() => setInputMethod('pdf')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                inputMethod === 'pdf' ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-100'
              }`}
            >
              PDF 업로드
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="AI가 정보를 추출하고 설정 중입니다..." subMessage="잠시만 기다려주세요." />
          ) : error ? (
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          ) : inputMethod === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* 직접 입력 폼 필드들... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상품명 *</label>
                <input name="productName" value={formData.productName} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500" />
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

              <button type="submit" className="w-full py-4 bg-teal-500 text-white font-bold rounded-lg shadow-md hover:bg-teal-600">
                분석 시작하기
              </button>
            </form>
          ) : (
            <form onSubmit={handlePdfSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-teal-500 transition-colors">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <i className="ri-file-pdf-line text-4xl text-teal-500 mb-2 inline-block"></i>
                  <p className="text-sm font-medium text-gray-700">{pdfFile ? pdfFile.name : 'PDF 파일을 선택하세요'}</p>
                </label>
              </div>
              <button type="submit" disabled={!pdfFile} className="w-full py-4 bg-teal-500 text-white font-bold rounded-lg disabled:bg-gray-300">
                분석 및 다음 단계로 진행
              </button>
            </form>
          )}
        </div>
      </div>

      {showSwotModal && <SwotModal onClose={() => setShowSwotModal(false)} />}
    </div>
  );
};

export default HomePage;