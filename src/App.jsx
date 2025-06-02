import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Inspection from './pages/Inspection';
import AutoShop from './pages/AutoShop';
import History from './pages/History';
import MyPage from './pages/MyPage';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null); // null = 로딩 중, false = 로그인 안됨

  useEffect(() => {
    const stored = localStorage.getItem('car_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error('유저 정보 파싱 실패:', err);
        setUser(false);
      }
    } else {
      setUser(false);
    }
  }, []);

  if (user === null) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중입니다...</div>;
  }

  return (
    <>
      <Header user={user} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/autoshop" element={<AutoShop />} />

        <Route
          path="/mypage"
          element={user ? <MyPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/history"
          element={user ? <History /> : <Navigate to="/login" replace />}
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
