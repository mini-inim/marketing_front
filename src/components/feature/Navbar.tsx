import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/swot', label: 'SWOT 분석' },
    { path: '/detail', label: '상세페이지' },
    { path: '/chat', label: '챗봇' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://public.readdy.ai/ai/img_res/9ab40e47-95e8-41e0-8812-5e625703173a.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
            <span className={`text-xl font-bold transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              Marketing AI
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === item.path
                    ? isScrolled
                      ? 'text-teal-500'
                      : 'text-white'
                    : isScrolled
                    ? 'text-gray-600 hover:text-teal-500'
                    : 'text-white/80 hover:text-white'
                }`}
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
