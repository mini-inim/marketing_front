import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import Navbar from '../../components/feature/Navbar';
import { useNavigate } from 'react-router-dom'; // 리다이렉션을 위해 추가

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatPage: React.FC = () => {
    const navigate = useNavigate(); // 리다이렉션 사용
    const sessionId = useAppStore((state) => state.sessionId);
    const productInfo = useAppStore((state) => state.productInfo);
    const swotResult = useAppStore((state) => state.swotResult);
    
    // ✅ RAG 컨텍스트를 가져오기 위한 상태와 설정 함수 (useAppStore에 존재한다고 가정)
    const setRagContext = useAppStore((state) => state.setRagContext);
    const ragContext = useAppStore((state) => state.ragContext);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '안녕하세요! 마케팅 전략에 대해 무엇이든 물어보세요.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isContextLoading, setIsContextLoading] = useState(true); // 컨텍스트 로딩 상태 추가
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 🚀 컴포넌트 마운트 시 세션 컨텍스트를 로드합니다.
    useEffect(() => {
        if (!sessionId) {
            alert('유효한 세션 정보가 없습니다. 홈으로 돌아갑니다.');
            navigate('/', { replace: true });
            return;
        }

        const fetchSessionContext = async () => {
            setIsContextLoading(true);
            try {
                // API 호출: /api/unified/session/{session_id}
                const response = await apiService.getUnifiedSessionContext(sessionId); 
                
                // 🚨 응답 구조에 따라 setRagContext를 호출해야 합니다.
                // 만약 응답이 { analysis: "...", detail: "..." } 형태라면,
                setRagContext(response); 
                console.log("RAG 세션 컨텍스트 로드 완료:", response);

            } catch (error) {
                console.error('RAG 세션 컨텍스트 로드 실패:', error);
                // 실패해도 챗봇 기능 자체는 유지하기 위해 에러 처리 후 로딩 해제
            } finally {
                setIsContextLoading(false);
            }
        };

        // 이미 로드된 컨텍스트가 없으면 로드 시작
        if (!ragContext) {
            fetchSessionContext();
        } else {
            setIsContextLoading(false); // 이미 있다면 로딩 상태 즉시 해제
        }
    }, [sessionId, setRagContext, ragContext, navigate]); // 의존성 배열에 ragContext 포함

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || isContextLoading) return; // 컨텍스트 로딩 중이면 막기

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // ✅ 세션 컨텍스트 통합
        // 기존 SWOT 결과와 RAG 컨텍스트 데이터를 문자열로 통합하여 전송
        const fullContext = JSON.stringify({
            swot: swotResult,
            rag_data: ragContext
        });

        try {
            const response = await apiService.chat({
                message: input,
                session_id: sessionId,
                history: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
            });

            console.log("Chat API 응답:", response); 

            let content: string = '응답을 받지 못했습니다.';
            
            if (response && typeof response.response === 'string' && response.response.length > 0) {
                content = response.response;
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: content,
            };

            setMessages((prev) => {
                const newState = [...prev, assistantMessage];
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
                            {/* RAG 컨텍스트 로딩 중일 때 메시지 표시 */}
                            {isContextLoading && messages.length === 1 && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 px-5 py-3 rounded-2xl text-gray-600 text-sm">
                                        세션 정보를 불러오는 중입니다... 잠시만 기다려주세요.
                                        <div className="flex gap-2 mt-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                placeholder={isContextLoading ? "세션 정보 로딩 중..." : "메시지를 입력하세요..."}
                                disabled={loading || isContextLoading} // 컨텍스트 로딩 중이면 입력 비활성화
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim() || isContextLoading} // 컨텍스트 로딩 중이면 버튼 비활성화
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