import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap'; // 정비소 지도 컴포넌트
import axios from '../api/axios'; // axios 인스턴스
import '../styles/MyPage.css'; // 마이페이지 전용 스타일

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 정의
  const [user, setUser] = useState(null); // 사용자 정보
  const [vehicle, setVehicle] = useState(null); // 차량 정보
  const [nicknameInput, setNicknameInput] = useState(''); // 닉네임 입력
  const [nextInspections, setNextInspections] = useState([]); // 다음 점검 예측 목록
  const [reservationDate, setReservationDate] = useState(''); // 예약 날짜
  const [reservationShop, setReservationShop] = useState(''); // 예약 정비소 이름
  const [reservations, setReservations] = useState([]); // 예약 목록
  const [favorites, setFavorites] = useState([]); // 찜 항목
  const [userAddress, setUserAddress] = useState(''); // 사용자 주소

  // ✅ 차량번호로 사용자 정보 불러오기
  const fetchUserInfoByCarNumber = async (carNumber) => {
    try {
      const res = await axios.get(`/api/user-by-car/${carNumber}`);
      if (res.data) {
        setUser(res.data);
        setNicknameInput(res.data.nickname);
        setUserAddress(res.data.address);
        fetchFavorites(res.data.id); // 찜 항목 로드
      }
    } catch (err) {
      console.error('❌ 사용자 정보 불러오기 실패:', err);
    }
  };

  // ✅ 찜 항목 가져오기
  const fetchFavorites = async (userId) => {
    try {
      const res = await axios.get(`/api/favorites/${userId}`);
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ 찜한 항목 불러오기 실패:', err);
    }
  };

  // ✅ 페이지 진입 시 로컬스토리지에서 사용자 정보 복원 및 데이터 로드
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

  // ✅ 차량 정보 불러오기
  const fetchVehicleInfo = async (carNumber) => {
    try {
      const res = await axios.get(`/api/vehicle-info/${carNumber}`);
      if (!res.data) return;

      const data = res.data;
      const parts = typeof data.parts === 'string' ? JSON.parse(data.parts) : data.parts || [];
      const history = typeof data.history === 'string' ? JSON.parse(data.history) : data.history || [];

      // 이력 정렬 (최신순)
      const sortedHistory = history.sort((a, b) => extractDateFromText(b) - extractDateFromText(a));

      setVehicle({
        ...data,
        parsedParts: parts.slice(0, 3), // 최근 3개 부품
        parsedHistory: sortedHistory.slice(0, 3), // 최근 3개 점검
      });
    } catch (err) {
      console.error('❌ 차량 정보 로딩 실패:', err);
    }
  };

  // ✅ 다음 점검 예측 불러오기
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

  // ✅ 'YYYY.MM' 형식 날짜 파싱
  const extractDateFromText = (text) => {
    const match = text.match(/\d{4}\.\d{2}/);
    if (!match) return null;
    const [year, month] = match[0].split('.').map(Number);
    return new Date(year, month - 1);
  };

  // ✅ 닉네임 변경
  const handleNicknameChange = () => {
    const updatedUser = { ...user, nickname: nicknameInput };
    setUser(updatedUser);
    localStorage.setItem('car_user', JSON.stringify(updatedUser));
    alert('닉네임이 변경되었습니다!');
  };

  // ✅ 로그아웃 처리
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ✅ 예약 등록
  const handleReservation = () => {
    if (!reservationDate || !reservationShop) {
      return alert('예약 날짜와 정비소를 모두 선택해주세요!');
    }
    const newEntry = `${reservationDate} - ${reservationShop}`;
    setReservations([...reservations, newEntry]);
    setReservationDate('');
    setReservationShop('');
  };

  // ✅ 예약 삭제
  const deleteReservation = (idx) => {
    const newList = [...reservations];
    newList.splice(idx, 1);
    setReservations(newList);
  };

  // ✅ 30일 내 찜 항목 필터링
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const validFavorites = favorites.filter(fav => {
    if (!fav.created_at) return true;
    const createdDate = new Date(fav.created_at);
    return now - createdDate < THIRTY_DAYS_MS;
  });

  // 로딩 중일 경우 null 렌더링
  if (!user || !vehicle) return null;

  return (
    <div className="mypage-container">
      <h2>{user.nickname}, 안녕하세요!</h2>

      {/* 차량 기본 정보 */}
      <section>
        <h3>🚗 내 차량 정보</h3>
        <p>차량번호: {user.car_number}</p>
        <p>차종: {user.vehicle_type || '정보 없음'}</p>
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
              <li key={idx}>{item}</li>
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
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>점검 이력이 없습니다.</p>
        )}
      </section>

      {/* 다음 점검 예측 */}
      <section>
        <h3>💡 다음 점검 예상 시기</h3>
        {nextInspections.length > 0 ? (
          <ul>
            {nextInspections.map((item, idx) => (
              <li key={idx}>
                <strong>{item.title}</strong> → 마지막 점검: {item.last_date}, 주기: {item.recommended_cycle}
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

      {/* 찜한 항목 */}
      <section>
        <h3>❤️ 찜한 점검 항목</h3>
        {validFavorites.length > 0 ? (
          <>
            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '0.8rem' }}>
              찜한 항목은 30일 후 자동으로 목록에서 사라집니다.
            </p>
            <div className="favorites-grid">
              {validFavorites.map((fav) => (
                <div key={fav.inspection_item_id} className="favorite-card">
                  <p><strong>{fav.title}</strong></p>
                  <p>카테고리: {fav.category}</p>
                  <p>설명: {fav.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>찜한 항목이 없습니다.</p>
        )}
      </section>

      {/* 닉네임 수정 및 로그아웃 */}
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
