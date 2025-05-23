import { useEffect } from 'react';

function AutoShopMap({ keyword }) {
  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY;
    console.log('✅ 현재 Kakao 앱 키:', kakaoKey);
    if (!kakaoKey) {
      console.error('❌ Kakao API Key가 설정되지 않았습니다.');
      return;
    }

    


    // ✅ Kakao Map SDK 동적 삽입 (최초 1회만)
    if (!document.getElementById('kakao-map-script')) {
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = false;
      script.onload = () => {
        console.log('✅ Kakao 지도 SDK 로드 완료');
      };
      document.head.appendChild(script);
    }

    // ✅ 지도 초기화 함수
    const initMap = () => {
      const container = document.getElementById('map');
      if (!container || !window.kakao || !window.kakao.maps) return;

      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 4,
        };
        const map = new window.kakao.maps.Map(container, mapOption);

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword || '정비소', (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            data.slice(0, 5).forEach(place => {
              const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
              const marker = new window.kakao.maps.Marker({
                map,
                position: markerPosition,
              });

              const isVerified = place.category_name.includes('정비소') || /오토큐|현대|기아|쉐보레/i.test(place.place_name);
              const content = `
                <div style="padding:5px; font-size:13px;">
                  <b>${place.place_name}</b><br/>
                  ${place.phone ? `☎ ${place.phone}<br/>` : ''}
                  ${place.address_name || ''}<br/>
                  <span style="color:${isVerified ? 'green' : 'gray'}">
                    ${isVerified ? '정비소 인증 업체입니다' : '비인증 업체입니다'}
                  </span>
                </div>
              `;
              const infowindow = new window.kakao.maps.InfoWindow({ content });
              window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
              window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
            });
          }
        }, {
          location: new window.kakao.maps.LatLng(latitude, longitude),
          radius: 3000
        });
      }, (err) => {
        console.error('위치 정보 가져오기 실패', err);
      });
    };

    // ✅ SDK 로드 완료 시까지 주기적으로 확인 → 지도 생성
    const interval = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(interval);
        window.kakao.maps.load(() => {
          initMap();
        });
      }
    }, 300);

    return () => clearInterval(interval);
  }, [keyword]);

  return <div id="map" style={{ width: '100%', height: '500px', marginTop: '2rem' }} />;
}

export default AutoShopMap;
