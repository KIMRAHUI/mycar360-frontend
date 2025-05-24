
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';
import '../styles/AutoShopStyle.css';

function AutoShop() {
  const [kakaoReady, setKakaoReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '정비소';

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

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const openAddressSearch = () => {
    if (!window.daum?.Postcode) return alert('주소 검색 스크립트 로드 실패');
    new window.daum.Postcode({
      oncomplete: function (data) {
        alert(`선택한 주소: ${data.address}`);
      },
    }).open();
  };

  return (
    <main className="auto-shop-page">
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 내 주변 정비소 찾기</h2>

      <div className="map-wrapper">
        <button className="address-search-btn" onClick={openAddressSearch}>
          🧭 주소 검색
        </button>
        {kakaoReady ? (
          <AutoShopMap keyword={keyword} />
        ) : (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>지도를 불러오는 중...</p>
        )}
      </div>
    </main>
  );
}

export default AutoShop;
