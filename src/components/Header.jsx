import { useNavigate, Link } from 'react-router-dom';
import './header.css';

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setUser(false);
    navigate('/');
  };

  return (
    <header className="header">
      {/* 로고 */}
      <div className="logo" onClick={() => navigate('/')}>
        <img src="/assets/logo.png" alt="MyCar360 로고" className="logo-img" />
      </div>

      {/* 메뉴 */}
      <nav className="nav-menu">
        <Link to="/inspection">점검하기</Link>
        <Link to="/autoshop">정비소 찾기</Link>

        {user ? (
  <>
    <Link to="/history">이력 보기</Link>
    <Link to="/mypage">마이페이지</Link>

    <button className="icon-button" onClick={handleLogout}>
      <img
        src="/assets/log_1.png"
        alt="로그아웃"
        className="auth-icon"
        title="로그아웃"
      />
    </button>
  </>
) : (

  <Link to="/login" className="icon-button">
    <img
      src="/assets/log.png"
      alt="로그인"
      className="auth-icon"
      title="로그인"
    />
  </Link>
)}

      </nav>
    </header>
  );
}

export default Header;
