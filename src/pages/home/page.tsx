import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService, ProductInfoRequest } from '../../services/api';
import LoadingSpinner from '../../components/base/LoadingSpinner';
import ErrorMessage from '../../components/base/ErrorMessage';
import Navbar from '../../components/feature/Navbar';
import SwotModal from './components/SwotModal';

const HomePage: React.FC = () => {
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
    if (e.target.files?.[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  // 공통 로직: 서버에 상품 정보 등록(startUnified) 및 모달 오픈
  const registerAndOpenModal = async (requestData: ProductInfoRequest) => {
    try {
      // 1. 서버에 통합 시작 API 호출
      await apiService.startUnified(requestData);

      // 2. 전역 스토어 업데이트 (Zustand)
      setProductInfo({
        productName: requestData.product_name,
        category: requestData.category,
        keywords: requestData.keywords,
        targetCustomer: requestData.target_customer,
        platform: requestData.platform,
      });

      // 3. SWOT 모달 즉시 표시
      setShowSwotModal(true);
    } catch (err) {
      throw err; // 상위 catch에서 처리
    }
  };

  // [수정] PDF 제출 핸들러: 파싱 완료 후 즉시 registerAndOpenModal 호출
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      // 1. PDF 파싱 API 호출
      const parsedData = await apiService.parsePdf(pdfFile);
      
      // 2. 파싱된 결과로 등록 데이터 구성
      const requestData: ProductInfoRequest = {
        product_name: parsedData.product_name || 'PDF 추출 상품',
        category: parsedData.category || '기타',
        keywords: parsedData.keywords || '',
        target_customer: parsedData.target_customer || '미지정',
        platform: parsedData.platform || 'coupang',
      };

      // 3. 바로 서버 등록 및 모달 오픈
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
    setError(null);

    try {
      const requestData: ProductInfoRequest = {
        product_name: formData.productName,
        category: formData.category,
        keywords: formData.keywords,
        target_customer: formData.targetCustomer,
        platform: formData.platform,
      };

      await registerAndOpenModal(requestData);
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
        <h1 className="text-5xl font-bold text-gray-900 mb-6">AI 마케팅 자동화</h1>
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
              {/* ... 기타 필드 생략 ... */}
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