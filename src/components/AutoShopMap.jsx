import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({ keyword = '정비소', onSelectShop, searchAddress = '', enableDynamicSearch = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const hasInitializedRef = useRef(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 초기 지도 생성 및 위치 기반 마커 생성
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
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      const container = document.getElementById('map');
      if (!container || !window.kakao) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 4,
          });

          mapInstanceRef.current = map;
          renderMarkers(map, new window.kakao.maps.LatLng(latitude, longitude));

          if (enableDynamicSearch) {
            window.kakao.maps.event.addListener(map, 'idle', () => {
              const center = map.getCenter();
              renderMarkers(map, center);
            });
          }
        },
        (err) => {
          console.error('위치 정보 오류', err);
        }
      );
    }
  }, [keyword, onSelectShop, enableDynamicSearch]);

  // selectedMarker 변경시 마커 다시 렌더링
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 주소 검색시 중심 이동 및 마커 재렌더링
  useEffect(() => {
    if (!searchAddress || !window.kakao?.maps || !mapInstanceRef.current) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        const map = mapInstanceRef.current;

        map.setCenter(coords);
        renderMarkers(map, coords);
      }
    });
  }, [searchAddress]);

  function renderMarkers(map, centerCoords) {
    clearMarkers();
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return;

      data.slice(0, 5).forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        const marker = new window.kakao.maps.Marker({
          map,
          position,
          image: getMarkerImage(selectedMarker?.id === place.id),
        });

        markersRef.current.push({ marker, id: place.id });

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
          infowindow.open(map, marker);
          setSelectedMarker({ id: place.id });
          if (onSelectShop) onSelectShop(place.place_name);
        });
      });
    }, {
      location: centerCoords,
      radius: 3000,
    });
  }

  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-green.png' : '/marker-icon-blue.png';
    return new window.kakao.maps.MarkerImage(
      imageSrc,
      new window.kakao.maps.Size(25, 41),
      {
        offset: new window.kakao.maps.Point(12, 41),
      }
    );
  }

  return (
    <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />
  );
}

export default AutoShopMap;
