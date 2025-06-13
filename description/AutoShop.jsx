import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';
import RecommendedSidebar from '../components/RecommendedSidebar'; 
import '../styles/AutoShopStyle.css';

function AutoShop() {
  // ✅ 상태 선언
  const [kakaoReady, setKakaoReady] = useState(false);              // 카카오 지도 로드 여부
  const [scriptLoaded, setScriptLoaded] = useState(false);          // 주소 검색 스크립트 로드 여부
  const [selectedAddress, setSelectedAddress] = useState('');       // 선택된 주소
  const [mapType, setMapType] = useState('road');                   // 지도 유형 (일반 or 스카이뷰)
  const [shops, setShops] = useState([]);                           // 일반 검색 정비소 목록
  const [sidebarOpen, setSidebarOpen] = useState(false);           // 추천 정비소 사이드바 열림 여부
  const [selectedShop, setSelectedShop] = useState(null);          // 추천 정비소에서 선택된 항목
  const [searchParams] = useSearchParams();                         // URL 쿼리 파라미터
  const keyword = searchParams.get('keyword') || '정비소';          // 기본 검색 키워드

  const mapRef = useRef(null); // 지도 객체 참조 (필요시 공유를 위해)

  // ✅ 카카오맵 로드 상태 확인 (window.kakao.maps가 존재할 때까지 체크)
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setKakaoReady(true);
    } else {
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          setKakaoReady(true);
          clearInterval(check);
        }
      }, 300);
      return () => clearInterval(check);
    }
  }, []);

  // ✅ 주소 검색용 Daum Postcode 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // ✅ 주소 검색 열기
  const openAddressSearch = () => {
    if (!window.daum?.Postcode) return alert('주소 검색 스크립트 로드 실패');
    new window.daum.Postcode({
      oncomplete: function (data) {
        alert(`선택한 주소: ${data.address}`);
        setSelectedAddress(data.address); // 선택한 주소로 지도 검색 트리거
      },
    }).open();
  };

  // ✅ 지도 유형 토글
  const toggleMapType = () => {
    setMapType((prev) => (prev === 'road' ? 'hybrid' : 'road'));
  };

  // ✅ 사이드바 열기/닫기
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <main className="auto-shop-page" style={{ display: 'block', margin: 0, padding: 0 }}>
      {/* 🔰 상단 타이틀 */}
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 내 주변 정비소 찾기</h2>

      <div className="map-wrapper">
        {/* 🔘 지도 상단 컨트롤 버튼들 */}
        <div className="map-controls">
          <button className="address-search-btn" onClick={openAddressSearch}>
            🧭 주소 검색
          </button>
          <button className="toggle-maptype-btn" onClick={toggleMapType}>
            {mapType === 'road' ? '🛰️ 스카이뷰 전환' : '🗺️ 일반지도 전환'}
          </button>
          <button className="recommend-toggle-btn" onClick={toggleSidebar}>
            ⭐ 추천 정비소 보기
          </button>
        </div>

        {/* 🗺️ 지도 렌더링 영역 */}
        <div className="map-and-stats">
          {kakaoReady ? (
            <AutoShopMap
              keyword={keyword}                       // 검색 키워드
              searchAddress={selectedAddress}         // 주소 검색 값
              mapType={mapType}                       // 지도 유형
              onShopsUpdate={setShops}                // 상위로 정비소 리스트 전달
              selectedShop={selectedShop}             // 추천 정비소 선택 시 이동 처리
              setSelectedShop={setSelectedShop}       // 내부에서 마커 클릭시에도 업데이트
              mapRef={mapRef}                         // 지도 객체 참조 공유
            />
          ) : (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
              지도를 불러오는 중...
            </p>
          )}
        </div>

        {/* ⭐ 추천 정비소 사이드탭 */}
        <RecommendedSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectShop={setSelectedShop} // 카드 클릭 → 해당 정비소로 지도 이동
        />
      </div>
    </main>
  );
}

export default AutoShop;


