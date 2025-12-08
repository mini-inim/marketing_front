import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 900000, // 3분
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProductInfoRequest {
  product_name: string;
  category: string;
  keywords: string;
  target_customer: string;
  platform: string;
}

export interface SwotRequest {
  days?: number;
  search_depth?: 'basic' | 'advanced';
  include_reviews?: boolean;
}

export interface DetailRequest {
  platform: string;
  tone: string;
  image_style: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  product_info?: any;
  history?: Array<{ role: string; content: string }>;
}

export const apiService = {
  // 상품 정보 시작
  startUnified: async (data: ProductInfoRequest) => {
    const response = await api.post('/api/unified/start', data);
    return response.data;
  },

  // PDF 파싱
  parsePdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/unified/parse-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // SWOT 분석 실행
  executeSwot: async (data: SwotRequest) => {
    const response = await api.post('/api/unified/execute-swot', data);
    return response.data;
  },

  // 상세페이지 생성
  executeDetail: async (data: DetailRequest) => {
    const response = await api.post('/api/unified/execute-detail', data);
    return response.data;
  },

  // 챗봇 대화
  chat: async (data: ChatRequest) => {
    const response = await api.post('/api/chatbot/chat', data);
    return response.data;
  },
};

export const getFullUrl = (relativePath: string) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `${BASE_URL}${relativePath}`;
};

export default api;
