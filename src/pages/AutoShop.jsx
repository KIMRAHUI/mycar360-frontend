import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';

function AutoShop() {
  const [kakaoReady, setKakaoReady] = useState(false);
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


  return (
    <main className="auto-shop-page">
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 내 주변 정비소 찾기</h2>
      {kakaoReady ? (
        <AutoShopMap keyword={keyword} />
      ) : (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>지도를 불러오는 중...</p>
      )}
    </main>
  );
}

export default AutoShop;
