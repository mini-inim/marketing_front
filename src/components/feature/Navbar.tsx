import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // 20px 이상 스크롤되면 상태 변경
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/chat', label: "챗봇"}
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? '**bg-white shadow-md**' // 스크롤 시 흰색 배경 및 그림자
          : '**bg-transparent**' // 기본 상태 (배경 투명)
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 및 브랜드 이름 */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://public.readdy.ai/ai/img_res/9ab40e47-95e8-41e0-8812-5e625703173a.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
            {/* 브랜드 이름은 항상 검은색 */}
            <span className={`text-xl font-bold **text-black** transition-colors`}>
              Marketing AI
            </span>
          </Link>

          {/* 네비게이션 아이템 */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  text-sm font-medium transition-all duration-300 whitespace-nowrap
                  
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;