import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AutoShopMap from '../components/AutoShopMap'; // 지도 렌더링 컴포넌트
import '../styles/AutoShopStyle.css'; // 스타일시트

function AutoShop() {
  // 상태 변수 선언
  const [kakaoReady, setKakaoReady] = useState(false); // Kakao 지도 API 준비 여부
  const [scriptLoaded, setScriptLoaded] = useState(false); // Daum 주소 검색 스크립트 로딩 여부
  const [selectedAddress, setSelectedAddress] = useState(''); // 사용자가 선택한 주소
  const [searchParams] = useSearchParams(); // URL 쿼리 파라미터 접근
  const keyword = searchParams.get('keyword') || '정비소'; // 쿼리에서 keyword 가져오고 기본값 '정비소'

  // ✅ Kakao 지도 스크립트 로드 확인
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setKakaoReady(true); // 이미 로드된 경우 바로 준비 완료 처리
    } else {
      // 아직 로드되지 않았을 경우 주기적으로 확인
      const check = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          setKakaoReady(true);
          clearInterval(check);
        }
      }, 300); // 0.3초마다 확인

      return () => clearInterval(check); // 컴포넌트 언마운트 시 인터벌 제거
    }
  }, []);

  // ✅ Daum 주소 검색 스크립트 동적 삽입
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'; // Daum 우편번호 서비스
    script.async = true;
    script.onload = () => setScriptLoaded(true); // 로딩 완료 상태 업데이트
    document.body.appendChild(script); // 문서에 추가
  }, []);

  // ✅ 주소 검색 창 열기
  const openAddressSearch = () => {
    if (!window.daum?.Postcode) return alert('주소 검색 스크립트 로드 실패'); // 로딩 실패 시 경고

    new window.daum.Postcode({
      oncomplete: function (data) {
        alert(`선택한 주소: ${data.address}`); // 선택된 주소 알림
        setSelectedAddress(data.address); // 주소 상태 업데이트 → 지도에 전달
      },
    }).open();
  };

  return (
    <main className="auto-shop-page">
      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>
        📍 내 주변 정비소 찾기
      </h2>

      <div className="map-wrapper">
        {/* 주소 검색 버튼 */}
        <div className="map-controls">
          <button className="address-search-btn" onClick={openAddressSearch}>
            🧭 주소 검색
          </button>
        </div>

        {/* 지도 또는 로딩 메시지 표시 */}
        {kakaoReady ? (
          // Kakao 지도 준비되면 지도 컴포넌트 렌더링
          <AutoShopMap keyword={keyword} searchAddress={selectedAddress} />
        ) : (
          // 준비 안 된 경우 메시지 표시
          <p
            style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: '#888',
            }}
          >
            지도를 불러오는 중...
          </p>
        )}
      </div>
    </main>
  );
}

export default AutoShop;
