function Header({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);      // 로그인 상태 초기화
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')}>🚗 MyCar360</div>
        <div className="hamburger" onClick={() => setMenuOpen(true)}>☰</div>
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

            {user ? (
              <>
                <Link to="/history" onClick={() => setMenuOpen(false)}>📋 이력 보기</Link>
                <Link to="/mypage" onClick={() => setMenuOpen(false)}>👤 마이페이지</Link>
                <button onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>로그인</Link>
            )}
          </nav>
        </>
      )}
    </>
  );
}
