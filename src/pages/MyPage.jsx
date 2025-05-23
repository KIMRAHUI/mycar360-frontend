import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/mypage.css';

function MyPage() {
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    const user_id = localStorage.getItem('user_id');
    const car_user = localStorage.getItem('car_user');

    if (nickname && user_id) {
      setUser({ nickname, id: user_id });
    }

    if (car_user) {
      const parsed = JSON.parse(car_user);
      if (parsed.carNumber) {
        fetchVehicleInfo(parsed.carNumber);
      }
    }

    if (user_id) {
      fetchFavorites(user_id);
    }
  }, []);

  const fetchVehicleInfo = async (carNumber) => {
    try {
      const res = await axios.get(`${baseUrl}/api/vehicle-info/${carNumber}`);
      setVehicle(res.data);
    } catch (err) {
      console.error('🚨 차량 정보 불러오기 실패', err);
    }
  };

  const fetchFavorites = async (userId) => {
    try {
      const res = await axios.get(`${baseUrl}/api/favorites/${userId}`);
      setFavorites(res.data);
    } catch (err) {
      console.error('🚨 찜한 항목 불러오기 실패', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (!user || !vehicle) return null;

  return (
    <main className="mypage-container">
      <h2 className="mypage-title">포카칩님 마이페이지</h2>

      <section className="mypage-section">
        <h3>🚗 차량 정보</h3>
        <p><strong>차량 번호:</strong> {vehicle.car_number}</p>
        <p><strong>모델명:</strong> {vehicle.model}</p>
        <p><strong>연식:</strong> {vehicle.year}</p>
        <p><strong>연료:</strong> {vehicle.fuel}</p>
      </section>

      <section className="mypage-section">
        <h3>📌 찜한 점검 항목</h3>
        {favorites.length === 0 ? (
          <p>찜한 항목이 없습니다.</p>
        ) : (
          <ul>
            {favorites.map((fav) => (
              <li key={fav.id}>
                <strong>{fav.title}</strong> - {fav.category}
                <p className="note">{fav.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button className="logout-button" onClick={handleLogout}>로그아웃</button>
    </main>
  );
}

export default MyPage;
