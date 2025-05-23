import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Inspection from './pages/Inspection';
import AutoShop from './pages/AutoShop';
import History from './pages/History';
import MyPage from './pages/MyPage';
import Signup from './pages/Login';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('car_user');
      setUser(stored ? JSON.parse(stored) : null);
    };

    syncUser(); // 최초 실행

    const interval = setInterval(syncUser, 500); // 0.5초마다 user 상태 갱신

    return () => clearInterval(interval); // 정리
  }, []);

  return (
    <>
      <Header user={user} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/autoshop" element={<AutoShop />} />
        {/*  로그인 상태에 따라 보호되는 페이지 */}
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
