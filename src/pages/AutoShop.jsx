import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap';

function AutoShop() {
  const [kakaoReady, setKakaoReady] = useState(false);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '정비소';

useEffect(() => {
  const existingScript = document.getElementById('kakao-map-script');

  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=117f04ed6e1ccf5235f5480b8f700e88&libraries=services`;
    script.async = true;
    script.onload = () => setKakaoReady(true);
    document.head.appendChild(script);
  } else {
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
  }
}, []);



  return (
    <main className="auto-shop-page">
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 내 주변 정비소 찾기</h2>
      {kakaoReady && <AutoShopMap keyword={keyword} />}
    </main>
  );
}

export default AutoShop;
