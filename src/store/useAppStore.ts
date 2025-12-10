import { create } from 'zustand';

interface ProductInfo {
  productName: string;
  category: string;
  keywords: string[];
  targetCustomer: string;
  platform: string;
}

interface SwotResult {
  htmlUrl: string;
  competitorCount: number;
  analysis_result: any;
}

interface DetailResult {
  markdownUrl: string;
  htmlUrl: string;
  images: string[];
}

interface AppState {
  sessionId: string | null;
  productInfo: ProductInfo | null;
  swotResult: SwotResult | null;
  detailResult: DetailResult | null;
  ragContext: any | null; // RAG에 사용될 전체 세션 컨텍스트 데이터
  setRagContext: (data: any) => void;
  setSessionId: (id: string) => void;
  setProductInfo: (info: ProductInfo) => void;
  setSwotResult: (result: SwotResult) => void;
  setDetailResult: (result: DetailResult) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  productInfo: null,
  swotResult: null,
  detailResult: null,
  ragContext: null,
  setRagContext: (data) => set({ ragContext: data}),
  setSessionId: (id) => set({ sessionId: id }),
  setProductInfo: (info) => set({ productInfo: info }),
  setSwotResult: (result) => set({ swotResult: result }),
  setDetailResult: (result) => set({ detailResult: result }),
  clearAll: () => set({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productInfo: null,
    swotResult: null,
    detailResult: null,
  }),
}));
