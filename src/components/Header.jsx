import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderStyle.css';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 최초 로딩 시 user 상태 설정 + 0.5초 간격으로 localStorage 상태 동기화
    const syncUser = () => {
      const stored = localStorage.getItem('car_user');
      setUser(stored ? JSON.parse(stored) : null);
    };

    syncUser(); // 최초 1회 실행
    const interval = setInterval(syncUser, 500); // 주기적으로 상태 확인

    return () => clearInterval(interval); // 언마운트 시 정리
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload(); // 새로고침으로 강제 UI 반영
  };

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')}>
          🚗 MyCar360
        </div>
        <div className="hamburger" onClick={() => setMenuOpen(true)}>
          ☰
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="side-menu">
            <div className="menu-header">
              {user && <span className="greeting">안녕하세요, {user.nickname}</span>}
              <button className="close-button" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <Link to="/inspection" onClick={() => setMenuOpen(false)}>🔍 점검하기</Link>
            <Link to="/autoshop" onClick={() => setMenuOpen(false)}>🔧 정비소 찾기</Link>

            {/* 로그인한 경우에만 노출 */}
            {user && (
              <>
                <Link to="/history" onClick={() => setMenuOpen(false)}>📋 이력 보기</Link>
                <Link to="/mypage" onClick={() => setMenuOpen(false)}>👤 마이페이지</Link>
              </>
            )}

            {user ? (
              <button onClick={handleLogout}>로그아웃</button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>로그인</Link>
            )}
          </nav>
        </>
      )}
    </>
  );
}

export default Header;
