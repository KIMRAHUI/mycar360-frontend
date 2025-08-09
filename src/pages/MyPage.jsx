// 전체 MyPage.jsx (주석 추가 완료)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';
import axios from '../api/axios';
import '../styles/MyPage.css';

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null); // 사용자 정보
  const [vehicle, setVehicle] = useState({}); // 차량 정보
  const [nicknameInput, setNicknameInput] = useState(''); // 닉네임 입력값
  const [nextInspections, setNextInspections] = useState([]); // 다음 점검 예측 정보
  const [reservationDate, setReservationDate] = useState(''); // 예약 날짜
  const [reservationShop, setReservationShop] = useState(''); // 예약 정비소명
  const [reservations, setReservations] = useState([]); // 예약 목록
  const [favorites, setFavorites] = useState([]); // 찜 항목 목록
  const [userAddress, setUserAddress] = useState(''); // 사용자 주소
 
  // 찜 항목 삭제 처리
  const handleDeleteFavorite = async (inspectionItemId) => {
    try {
      const res = await axios.delete(`/api/favorites/${user.id}/${inspectionItemId}`);
      if (res.status === 200) {
        const updated = favorites.filter(f => f.id !== inspectionItemId);
        setFavorites(updated);
      }
    } catch (err) {
      console.error('❌ 찜 삭제 실패:', err);
      alert('찜 항목 삭제 중 오류가 발생했습니다.');
    }
  };

  // 차량번호로 사용자 정보 가져오기
  const fetchUserInfoByCarNumber = async (carNumber) => {
    try {
      const res = await axios.get(`/api/user-by-car/${carNumber}`);
      if (res.data) {
        setUser(res.data);
        setNicknameInput(res.data.nickname);
        setUserAddress(res.data.address);
        fetchFavorites(res.data.id);
      }
    } catch (err) {
      console.error('❌ 사용자 정보 불러오기 실패:', err);
    }
  };

  // 찜 항목 가져오기
  const fetchFavorites = async (userId) => {
    try {
      const res = await axios.get(`/api/favorites/${userId}`);
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ 찜한 항목 불러오기 실패:', err);
    }
  };



  // 예약 목록 로드
  useEffect(() => {
    const stored = localStorage.getItem('myReservations');
    if (stored) {
      setReservations(JSON.parse(stored));
    }
  }, []);

  // 로그인 상태 확인 및 차량/사용자 정보 로딩
  useEffect(() => {
    const saved = localStorage.getItem('car_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const carNumber = parsed.carNumber || parsed.car_number;
      console.log('✅ carNumber로 사용자 정보 새로고침 중:', carNumber);
      fetchUserInfoByCarNumber(carNumber);
      fetchVehicleInfo(carNumber);
      fetchNextInspections(carNumber);
    } else {
      alert('로그인 후 이용해주세요!');
      navigate('/login');
    }
  }, [location]);

  // 차량 정보 로드
  const fetchVehicleInfo = async (carNumber) => {
    try {
      const res = await axios.get(`/api/vehicle-info/${carNumber}`);
      if (!res.data) return;

      const data = res.data;
      const parts = typeof data.parts === 'string' ? JSON.parse(data.parts) : data.parts || [];
      const history = typeof data.history === 'string' ? JSON.parse(data.history) : data.history || [];

      setVehicle({
        ...data,
        parsedParts: parts.slice(0, 3), // 최근 부품 3개
        parsedHistory: history.slice(0, 3), // 최근 점검 이력 3개
      });
    } catch (err) {
      console.error('❌ 차량 정보 로딩 실패:', err);
    }
  };

  // 다음 점검 예측 정보 로드
  const fetchNextInspections = async (carNumber) => {
    try {
      const res = await axios.get(`/api/next-inspection/${carNumber}`);
      if (res.data?.nextInspections) {
        setNextInspections(res.data.nextInspections);
      }
    } catch (err) {
      console.error('❌ 다음 점검 예측 실패:', err);
    }
  };

  // 닉네임 수정
  const handleNicknameChange = async () => {
    try {
      const updatedUser = { ...user, nickname: nicknameInput };
      setUser(updatedUser);
      localStorage.setItem('car_user', JSON.stringify(updatedUser));

      const res = await axios.post(`/api/users/${user.id}/nickname`, {
        nickname: nicknameInput,
      });

      if (res.data.success) {
        alert('닉네임이 성공적으로 변경되었습니다!');
      } else {
        alert('닉네임 변경은 저장되었으나 응답에 문제가 있습니다.');
      }
    } catch (err) {
      console.error('❌ 닉네임 변경 실패:', err);
      alert('닉네임 변경 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 예약 저장 처리
  const handleReservation = () => {
    if (!reservationDate || !reservationShop) {
      return alert('예약 날짜와 정비소를 모두 선택해주세요!');
    }
    const newEntry = `${reservationDate} - ${reservationShop}`;
    const existing = JSON.parse(localStorage.getItem('myReservations')) || [];
    const updated = [...existing, newEntry];
    localStorage.setItem('myReservations', JSON.stringify(updated));
    setReservations([...reservations, newEntry]);
    setReservationDate('');
    setReservationShop('');
    alert('예약이 완료되었습니다.\n해당 정비소에서 순차적으로 연락드릴 예정이며,\n정비소 사정에 따라 일정이 변동될 수 있습니다.');
  };

  // 예약 삭제 처리
  const deleteReservation = (idx) => {
    const newList = [...reservations];
    newList.splice(idx, 1);
    setReservations(newList);
    localStorage.setItem('myReservations', JSON.stringify(newList)); // ✅ localStorage 동기화
  };


  // 렌더링 조건
  if (!user || !vehicle) return null;

  return (
    <div className="mypage-container">
      {/* 사용자 인사 */}
      <h2>{user.nickname}, 안녕하세요!</h2>

      {/* 내 차량 정보 */}
      <section>
        <h3>🚗 내 차량 정보</h3>
        <p>차량번호: {user.car_number}</p>
        <p>차종: {user.my_vehicle || '정보 없음'}</p>
        <p>연식: {vehicle.year}</p>
        <p>주소: {userAddress || '정보 없음'}</p>
        <p>인증상태: {user.verified ? '완료됨' : '미완료'}</p>
      </section>

      {/* 최근 부품 교체 이력 */}
      <section>
        <h3>🔧 최근 부품 교체 이력</h3>
        {vehicle.parsedParts?.length > 0 ? (
          <ul>
            {vehicle.parsedParts.map((item, idx) => (
              <li key={`${item.partName || 'unknown'}-${item.replacedAt || 'unknown'}-${idx}`}>
                {item.partName || '알 수 없음'} ({item.replacedAt || '날짜 없음'})
              </li>
            ))}

          </ul>
        ) : (
          <p>부품 이력이 없습니다.</p>
        )}
      </section>

      {/* 최근 점검 이력 */}
      <section>
        <h3>💪 최근 점검 이력</h3>
        {vehicle.parsedHistory?.length > 0 ? (
          <ul>
            {vehicle.parsedHistory.map((item, idx) => (
              <li key={`${item.label || 'unknown'}-${item.performedAt || 'unknown'}-${idx}`}>
                {item.label || '알 수 없음'} ({item.performedAt || '날짜 없음'})
              </li>
            ))}

          </ul>
        ) : (
          <p>점검 이력이 없습니다.</p>
        )}
      </section>

      <section className="next-inspections">
        <h3>💡 다음 점검 예상 시기</h3>
  {nextInspections.length > 0 ? (
    <ul>
      {nextInspections.map((item, idx) => (
        <li key={`${item.title}-${idx}`}>
          <strong>{item.title}</strong>
          {' '}→ 마지막: {item.last_date || '―'}, 주기: {item.recommended_cycle || '―'}
          {item.next_date && <> , <b>다음: {item.next_date}</b></>}
          {!item.next_date && item.next_date_min && item.next_date_max && (
            <> , <b>다음: {item.next_date_min} ~ {item.next_date_max}</b></>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p>예상 정보를 불러오는 중이거나, 점검 이력이 없습니다.</p>
  )}
</section>

      {/* 정비소 지도 및 예약 */}
      <section>
        <h3>📍 주변 정비소 추천 & 예약</h3>
        <div className="reservation-form">
          <div className="date-input-wrapper">
            <label className="mobile-hint-label">📅 예약 날짜</label>
            <input
              type="date"
              className="form-input"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="form-input"
            value={reservationShop}
            placeholder="마커 클릭 시 정비소명 자동 입력"
            onChange={(e) => setReservationShop(e.target.value)}
          />
          <button onClick={handleReservation}>예약하기</button>
        </div>

        <AutoShopMap
          keyword="정비소"
          onSelectShop={(shop) => setReservationShop(shop)}
          enableDynamicSearch={true}
        />

        {/* 예약 목록 */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📅 내 예약 목록</h4>
          {reservations.length > 0 ? (
            <ul>
              {reservations.map((entry, idx) => (
                <li key={`${entry}-${idx}`} style={{ padding: '0.4rem 0' }}>
                  {entry} <button onClick={() => deleteReservation(idx)}>❌</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666' }}>등록된 예약이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 찜한 점검 항목 */}
      {/* 찜한 점검 항목 */}
      <section>
        <h3>❤️ 찜한 점검 항목</h3>
        {favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map((fav, idx) => (
              <div key={`${fav.id}-${idx}`} className="favorite-card">
                <p><strong>{fav.title}</strong></p>
                <p>카테고리: {fav.category}</p>
                <p>설명: {fav.description}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                  찜한 날짜: {new Date(fav.created_at).toLocaleDateString('ko-KR')}
                </p>
                <div className="center-button">
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFavorite(fav.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>찜한 항목이 없습니다.</p>
        )}
      </section>


      {/* 닉네임 및 로그아웃 */}
      <section className="settings">
        <h3>⚙️ 내 정보 관리</h3>
        <div className="nickname-section">
          <input
            type="text"
            className="form-input"
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
