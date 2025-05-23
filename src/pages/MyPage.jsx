import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';;
import '../styles/MyPage.css';

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nextInspectionDate, setNextInspectionDate] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationShop, setReservationShop] = useState('');
  const [reservations, setReservations] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const fetchFavorites = async (userId) => {
    try {
      console.log('🚀 찜 목록 요청 시작:', userId);
      const res = await axios.get(`/favorites/${userId}`);
      console.log('✅ 응답 데이터:', res.data);
      setFavorites(res.data);
    } catch (err) {
      console.error('찜한 항목 불러오기 실패', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('car_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('✅ 파싱된 user:', parsed);
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
      const res = await axios.get(`http://localhost:5000/api/vehicle-info/${carNumber}`);
      const data = res.data;
      const parts = typeof data.parts === 'string' ? JSON.parse(data.parts) : data.parts || [];
      const history = typeof data.history === 'string' ? JSON.parse(data.history) : data.history || [];

      const sortedHistory = history.sort((a, b) => {
        const aDate = extractDateFromText(a);
        const bDate = extractDateFromText(b);
        return bDate - aDate;
      });

      const latestDate = extractDateFromText(sortedHistory[0]);
      if (latestDate) {
        const nextDate = new Date(latestDate);
        nextDate.setMonth(nextDate.getMonth() + 6);
        setNextInspectionDate(nextDate.toISOString().slice(0, 10));
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

  useEffect(() => {
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=117f04ed6e1ccf5235f5480b8f700e88&libraries=services&autoload=false`;
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    window.kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const container = document.getElementById('map');
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 4,
        });
        mapRef.current = map;

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch('정비소', (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            markersRef.current.forEach(m => m.setMap(null));
            markersRef.current = [];

            data.slice(0, 3).forEach(place => {
              const position = new window.kakao.maps.LatLng(place.y, place.x);

              const marker = new window.kakao.maps.Marker({
                map,
                position,
                image: new window.kakao.maps.MarkerImage(
                  'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png',
                  new window.kakao.maps.Size(36, 36)
                ),
              });

              const content = `
                <div style="padding:5px; font-size:13px;">
                  <b>${place.place_name}</b><br/>
                  ${place.phone ? `☎ ${place.phone}<br/>` : ''}
                  ${place.category_name}
                </div>
              `;
              const infowindow = new window.kakao.maps.InfoWindow({ content });

              window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
              window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
              window.kakao.maps.event.addListener(marker, 'click', () => {
                map.setCenter(position);
                setReservationShop(place.place_name);
              });

              markersRef.current.push(marker);
            });
          }
        }, {
          location: new window.kakao.maps.LatLng(latitude, longitude),
          radius: 3000,
        });
      });
    });
  };
}, []);


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
        {vehicle.parsedParts && vehicle.parsedParts.length > 0 ? (
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
        {vehicle.parsedHistory && vehicle.parsedHistory.length > 0 ? (
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
        <p>{nextInspectionDate || '계산할 수 없습니다.'}</p>
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

        <div id="map" style={{ width: '100%', height: '300px', marginTop: '1rem' }} />

        {/* ✅ 추가된 예약 내역 표시 */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📅 내 예약 목록</h4>
          {reservations.length > 0 ? (
            <ul>
              {reservations.map((entry, idx) => (
                <li key={idx} style={{ padding: '0.4rem 0' }}>{entry}</li>
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
          <ul>
            {favorites.map((fav) => (
              <li key={fav.inspection_item_id}>
                [{fav.category}] {fav.title}
              </li>
            ))}
          </ul>
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
