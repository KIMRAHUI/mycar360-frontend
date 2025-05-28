import { useEffect, useRef } from 'react';
import '../styles/AutoShopMap.css';


function AutoShopMap({ keyword = '정비소', onSelectShop, searchAddress }) {
  const mapRef = useRef(null); // 지도 DOM 참조용
  const mapInstanceRef = useRef(null); // 지도 인스턴스를 저장할 ref

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

          mapInstanceRef.current = map; // 지도 인스턴스를 저장해둠

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

  // 주소가 변경되면 지도 중심 이동 + 마커 재검색
  useEffect(() => {
    if (!searchAddress || !window.kakao?.maps || !mapInstanceRef.current) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        const map = mapInstanceRef.current;

        map.setCenter(coords); // 지도 중심 이동

        //  해당 위치 기준으로 정비소 마커 다시 검색
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
          location: coords,
          radius: 3000,
        });
      }
    });
  }, [searchAddress]);

  return (
    <div
  id="map"
  ref={mapRef}
/>
  );
}

export default AutoShopMap;
