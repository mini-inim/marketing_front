import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import Navbar from '../../components/feature/Navbar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage: React.FC = () => {
  const sessionId = useAppStore((state) => state.sessionId);
  const productInfo = useAppStore((state) => state.productInfo);
  const swotResult = useAppStore((state)=>state.swotResult)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 마케팅 전략에 대해 무엇이든 물어보세요.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
        const response = await apiService.chat({
            message: input,
            session_id: sessionId,
            product_info: productInfo,
            session_context: swotResult || '', 
            history: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        });

        // 🚨 디버깅: 응답이 정확히 들어왔는지 확인
        console.log("Chat API 응답:", response); 

        let content: string = '응답을 받지 못했습니다. (필드 없음)';
        
        // 백엔드 응답 구조에 맞게 response.response에서 내용을 추출
        if (response && typeof response.response === 'string' && response.response.length > 0) {
            content = response.response;
        }

        const assistantMessage: Message = {
            role: 'assistant',
            content: content,
        };

        // 🚨 상태 업데이트: 함수형 업데이트 사용
        setMessages((prev) => {
            const newState = [...prev, assistantMessage];
            // 메시지 상태가 업데이트된 후, 스크롤을 확실히 내립니다.
            // (useEffect가 있지만, 즉시 반영을 위해 여기서 한 번 더 호출)
            setTimeout(scrollToBottom, 50); 
            return newState;
        });

    } catch (error) {
        console.error('Chat API 호출 실패:', error);
        const errorMessage: Message = {
            role: 'assistant',
            content: '죄송합니다. 서버 통신 중 오류가 발생했습니다.',
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-6 px-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI 마케팅 챗봇
            </h1>
            <p className="text-lg text-gray-600">
              마케팅 전략과 상품 정보에 대해 상담하세요
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-5 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-send-plane-fill text-lg"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
