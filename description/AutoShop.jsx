import { useEffect, useState } from 'react'; // React에서 useEffect, useState 훅을 가져옴
import { useSearchParams } from 'react-router-dom'; // React Router에서 URL 파라미터를 가져오는 useSearchParams 훅을 가져옴
import AutoShopMap from '../components/AutoShopMap'; // AutoShopMap 컴포넌트 가져오기
import '../styles/AutoShopStyle.css'; // 스타일 파일을 가져오기

function AutoShop() {
  const [kakaoReady, setKakaoReady] = useState(false); // 카카오 맵 SDK가 준비되었는지 확인하는 상태 변수
  const [scriptLoaded, setScriptLoaded] = useState(false); // 스크립트 로딩 상태 확인
  const [selectedAddress, setSelectedAddress] = useState(''); // 선택된 주소를 저장하는 상태
  const [mapType, setMapType] = useState('road'); // 맵 타입 ('road' or 'hybrid')
  const [shops, setShops] = useState([]); // 검색된 정비소 목록을 저장하는 상태
  const [searchParams] = useSearchParams(); // URL 파라미터를 가져오기
  const keyword = searchParams.get('keyword') || '정비소'; // 검색할 키워드, URL 파라미터로 받은 값 또는 기본값 '정비소'

  // 카카오 맵 SDK가 준비되었는지 확인하는 useEffect
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setKakaoReady(true); // 카카오 맵 SDK가 이미 로드되었다면 상태를 true로 설정
    } else {
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          setKakaoReady(true); // SDK가 로드되었으면 상태 업데이트
          clearInterval(check); // 체크 중지
        }
      }, 300); // 300ms마다 확인
      return () => clearInterval(check); // 컴포넌트 언마운트 시 interval을 정리
    }
  }, []);

  // 주소 검색 스크립트 로딩
  useEffect(() => {
    const script = document.createElement('script'); // 주소 검색용 스크립트 동적으로 추가
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'; // 주소 검색 API
    script.async = true;
    script.onload = () => setScriptLoaded(true); // 스크립트가 로드되면 상태 업데이트
    document.body.appendChild(script); // 스크립트를 body에 추가
  }, []);

  // 주소 검색 버튼 클릭 시 실행되는 함수
  const openAddressSearch = () => {
    if (!window.daum?.Postcode) return alert('주소 검색 스크립트 로드 실패'); // Postcode가 로드되지 않았으면 경고
    new window.daum.Postcode({
      oncomplete: function (data) {
        alert(`선택한 주소: ${data.address}`); // 주소 선택 후 알림창 표시
        setSelectedAddress(data.address); // 선택한 주소를 상태에 저장
      },
    }).open();
  };

  // 지도 유형 전환 버튼 클릭 시 실행되는 함수
  const toggleMapType = () => {
    setMapType((prev) => (prev === 'road' ? 'hybrid' : 'road')); // 'road'와 'hybrid' 간 전환
  };

  return (
    <main className="auto-shop-page">
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 내 주변 정비소 찾기</h2> {/* 제목 */}

      <div className="map-wrapper">
        <div className="map-controls"> {/* 맵 컨트롤 버튼 영역 */}
          <button className="address-search-btn" onClick={openAddressSearch}> {/* 주소 검색 버튼 */}
            🧭 주소 검색
          </button>
          <button className="toggle-maptype-btn" onClick={toggleMapType}> {/* 지도 전환 버튼 */}
            {mapType === 'road' ? '🛰️ 스카이뷰 전환' : '🗺️ 일반지도 전환'}
          </button>
        </div>

        <div className="map-and-stats"> {/* 맵 및 통계 영역 */}
          {kakaoReady ? ( // 카카오 맵 SDK가 준비되었을 때만 맵을 표시
            <AutoShopMap
              keyword={keyword} // 키워드 (정비소)
              searchAddress={selectedAddress} // 선택된 주소
              mapType={mapType} // 맵 타입
              onShopsUpdate={setShops} // 정비소 리스트 업데이트
            />
          ) : (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
              지도를 불러오는 중...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default AutoShop; // 컴포넌트 반환
