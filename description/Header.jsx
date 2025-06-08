// 📌 Header.jsx
// MyCar360의 상단 헤더 컴포넌트
// 로그인 상태에 따라 메뉴 구성을 다르게 표시하며, 햄버거 버튼으로 사이드 메뉴를 토글

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // 햄버거 메뉴 열림 여부 상태

  // 🔹 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.clear();      // 저장된 사용자 정보 초기화
    setUser(false);            // user 상태 초기화 (null 대신 false로 처리해 깜빡임 방지)
    navigate('/');             // 홈으로 리디렉션
  };

  return (
    <>
      {/* 상단 고정 헤더 */}
      <header className="header">
        {/* 로고 클릭 시 홈으로 이동 */}
        <div className="logo" onClick={() => navigate('/')}>🚗 MyCar360</div>
        
        {/* 햄버거 버튼 클릭 시 메뉴 오픈 */}
        <div className="hamburger" onClick={() => setMenuOpen(true)}>☰</div>
      </header>

      {/* 사이드 메뉴 오픈 시 오버레이 및 메뉴 출력 */}
      {menuOpen && (
        <>
          {/* 검은 배경 클릭 시 닫힘 */}
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          
          {/* 사이드 메뉴 (우측에서 슬라이드됨) */}
          <nav className="side-menu">
            {/* 메뉴 상단: 인사말 + 닫기 버튼 */}
            <div className="menu-header-row">
              {user && <span className="greeting">안녕하세요, {user.nickname}</span>}
              <button className="close-button" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            {/* 로그인 여부와 상관없이 표시되는 메뉴 */}
            <Link to="/inspection" onClick={() => setMenuOpen(false)}>🔍 점검하기</Link>
            <Link to="/autoshop" onClick={() => setMenuOpen(false)}>🔧 정비소 찾기</Link>

            {/* 로그인한 유저에게만 표시되는 메뉴 */}
            {user ? (
              <>
                <Link to="/history" onClick={() => setMenuOpen(false)}>📋 이력 보기</Link>
                <Link to="/mypage" onClick={() => setMenuOpen(false)}>👤 마이페이지</Link>
                <button onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              // 로그인하지 않은 사용자에게만 표시
              <Link to="/login" onClick={() => setMenuOpen(false)}>로그인</Link>
            )}
          </nav>
        </>
      )}
    </>
  );
}

export default Header;
