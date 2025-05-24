// ✅ MyPage.jsx 최종 통합본 (요청 내용만 반영, 나머지 기능은 그대로 유지)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';
import axios from '../api/axios';
import '../styles/MyPage.css';

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nextInspectionDate, setNextInspectionDate] = useState('');
  const [nextInspectionItem, setNextInspectionItem] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationShop, setReservationShop] = useState('');
  const [reservations, setReservations] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async (userId) => {
    try {
      const res = await axios.get(`/api/favorites/${userId}`);
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('찜한 항목 불러오기 실패', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('car_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setNicknameInput(parsed.nickname);
      fetchVehicleInfo(parsed.carNumber);
      fetchFavorites(parsed.id);
    } else {
      alert('로그인 후 이용해주세요!');
      navigate('/login');
    }
  }, [location]);

  const fetchVehicleInfo = async (carNumber) => {
    try {
      const res = await axios.get(`/api/vehicle-info/${carNumber}`);
      const data = res.data;
      const parts = typeof data.parts === 'string' ? JSON.parse(data.parts) : data.parts || [];
      const history = typeof data.history === 'string' ? JSON.parse(data.history) : data.history || [];

      const sortedHistory = history.sort((a, b) => {
        const aDate = extractDateFromText(a);
        const bDate = extractDateFromText(b);
        return bDate - aDate;
      });

      const latestItem = sortedHistory[0];
      const latestDate = extractDateFromText(latestItem);
      if (latestDate) {
        const nextDate = new Date(latestDate);
        nextDate.setMonth(nextDate.getMonth() + 6);
        setNextInspectionDate(nextDate.toISOString().slice(0, 10));
        setNextInspectionItem(latestItem);
      }

      setVehicle({
        ...data,
        parsedParts: parts.slice(0, 3),
        parsedHistory: sortedHistory.slice(0, 3),
      });
    } catch (err) {
      console.error('차량 정보 불러오기 실패', err);
    }
  };

  const extractDateFromText = (text) => {
    const match = text.match(/\d{4}\.\d{2}/);
    if (!match) return null;
    const [year, month] = match[0].split('.').map(Number);
    return new Date(year, month - 1);
  };

  const handleNicknameChange = () => {
    const updatedUser = { ...user, nickname: nicknameInput };
    setUser(updatedUser);
    localStorage.setItem('car_user', JSON.stringify(updatedUser));
    alert('닉네임이 변경되었습니다!');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleReservation = () => {
    if (!reservationDate || !reservationShop) {
      return alert('예약 날짜와 정비소를 모두 선택해주세요!');
    }
    const newEntry = `${reservationDate} - ${reservationShop}`;
    setReservations([...reservations, newEntry]);
    setReservationDate('');
    setReservationShop('');
  };

  const deleteReservation = (idx) => {
    const newList = [...reservations];
    newList.splice(idx, 1);
    setReservations(newList);
  };

  if (!user || !vehicle) return null;

  return (
    <div className="mypage-container">
      <h2>{user.nickname}, 안녕하세요!</h2>

      <section>
        <h3>🚗 내 차량 정보</h3>
        <p>차량번호: {user.carNumber}</p>
        <p>모델: {vehicle.type}</p>
        <p>연식: {vehicle.year}</p>
        <p>인증상태: {user.verified ? '완료됨' : '미완료'}</p>
      </section>

      <section>
        <h3>🔧 최근 부품 교체 이력</h3>
        {vehicle.parsedParts?.length > 0 ? (
          <ul>
            {vehicle.parsedParts.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>부품 이력이 없습니다.</p>
        )}
      </section>

      <section>
        <h3>💪 최근 점검 이력</h3>
        {vehicle.parsedHistory?.length > 0 ? (
          <ul>
            {vehicle.parsedHistory.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>점검 이력이 없습니다.</p>
        )}
      </section>

      <section>
        <h3>💡 다음 점검 예상 시기</h3>
        <p>{nextInspectionDate ? `${nextInspectionDate} (${nextInspectionItem})` : '계산할 수 없습니다.'}</p>
      </section>

      <section>
        <h3>📍 주변 정비소 추천 & 예약</h3>
        <div className="reservation-form">
          <input
            type="date"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
          />
          <input
            type="text"
            value={reservationShop}
            placeholder="마커 클릭 시 정비소명 자동 입력"
            onChange={(e) => setReservationShop(e.target.value)}
          />
          <button onClick={handleReservation}>예약하기</button>
        </div>

        <AutoShopMap keyword="정비소" onSelectShop={(shop) => setReservationShop(shop)} />

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📅 내 예약 목록</h4>
          {reservations.length > 0 ? (
            <ul>
              {reservations.map((entry, idx) => (
                <li key={idx} style={{ padding: '0.4rem 0' }}>
                  {entry} <button onClick={() => deleteReservation(idx)}>❌</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666' }}>등록된 예약이 없습니다.</p>
          )}
        </div>
      </section>

      <section>
        <h3>❤️ 찜한 점검 항목</h3>
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((fav) => (
              <div key={fav.inspection_item_id} className="favorite-card">
                <p><strong>{fav.title}</strong></p>
                <p>카테고리: {fav.category}</p>
                <p>설명: {fav.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>찜한 항목이 없습니다.</p>
        )}
      </section>

      <section className="settings">
        <h3>⚙️ 내 정보 관리</h3>
        <div className="nickname-section">
          <input
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
          />
          <button onClick={handleNicknameChange}>닉네임 수정</button>
        </div>
        <button onClick={handleLogout}>로그아웃</button>
      </section>
    </div>
  );
}

export default MyPage;
