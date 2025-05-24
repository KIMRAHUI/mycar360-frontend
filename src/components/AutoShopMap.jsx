import { useEffect } from 'react';

function AutoShopMap({ keyword = '정비소', onSelectShop }) {
  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY;
    if (!kakaoKey) {
      console.error('Kakao API Key가 없습니다.');
      return;
    }

    const existingScript = document.getElementById('kakao-map-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    } else if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    }

    function initMap() {
      const container = document.getElementById('map');
      if (!container || !window.kakao) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 4,
          });

          const ps = new window.kakao.maps.services.Places();
          ps.keywordSearch(keyword, (data, status) => {
            if (status !== window.kakao.maps.services.Status.OK) return;

            data.slice(0, 5).forEach((place) => {
              const marker = new window.kakao.maps.Marker({
                map,
                position: new window.kakao.maps.LatLng(place.y, place.x),
              });

              const content = `
                <div style="padding:5px; font-size:13px;">
                  <b>${place.place_name}</b><br/>
                  ${place.phone ? `☎ ${place.phone}<br/>` : ''}
                  ${place.address_name || ''}
                </div>
              `;
              const infowindow = new window.kakao.maps.InfoWindow({ content });
              window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
              window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
              window.kakao.maps.event.addListener(marker, 'click', () => {
                if (onSelectShop) onSelectShop(place.place_name);
              });
            });
          }, {
            location: new window.kakao.maps.LatLng(latitude, longitude),
            radius: 3000,
          });
        },
        (err) => console.error('위치 정보 오류', err)
      );
    }
  }, [keyword, onSelectShop]);

  return (
    <div
      id="map"
      style={{ width: '100%', height: '500px', marginTop: '1.5rem', borderRadius: '10px' }}
    />
  );
}

export default AutoShopMap;
