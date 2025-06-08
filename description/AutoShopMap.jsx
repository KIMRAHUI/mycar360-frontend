// 📍 AutoShopMap.jsx
// Kakao Map API를 활용한 지도 표시 및 정비소 위치 마커 렌더링 컴포넌트

import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소',             // 검색 키워드 기본값: "정비소"
  onSelectShop,                  // 정비소 클릭 시 호출될 콜백 함수
  searchAddress = '',            // 사용자가 선택한 주소 (우편번호 API 결과)
  enableDynamicSearch = false,   // 지도 이동 시 자동 검색 여부
}) {
  const mapRef = useRef(null);                // DOM 내 map element 참조
  const mapInstanceRef = useRef(null);        // kakao map 객체 참조
  const markersRef = useRef([]);              // 현재 마커 리스트
  const hasInitializedRef = useRef(false);    // 지도 초기화 여부 체크
  const [selectedMarker, setSelectedMarker] = useState(null); // 클릭한 마커 상태

  // 🔹 기존 마커를 지도에서 제거
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 🔹 Kakao 지도 스크립트 로딩 및 지도 생성
  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY; // 환경변수에서 Kakao API Key 로딩
    if (!kakaoKey) {
      console.error('Kakao API Key가 없습니다.');
      return;
    }

    const existingScript = document.getElementById('kakao-map-script');
    if (!existingScript) {
      // kakao sdk 스크립트를 동적으로 삽입
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(initMap);
      document.head.appendChild(script);
    } else if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    }

    // 지도 생성 함수 (현재 위치 기준)
    function initMap() {
      if (hasInitializedRef.current) return; // 중복 실행 방지
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

          // 동적 검색 활성화 시: 지도가 이동될 때마다 다시 검색
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

  // 🔹 선택된 마커가 바뀌면 마커 다시 렌더링
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 🔹 주소 기반으로 지도의 중심을 이동하고 마커를 다시 그림
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

  // 🔹 키워드 기반으로 주변 장소를 검색하고 마커를 생성
  function renderMarkers(map, centerCoords) {
    clearMarkers(); // 기존 마커 제거

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return;

      data.slice(0, 5).forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        const marker = new window.kakao.maps.Marker({
          map,
          position,
          image: getMarkerImage(selectedMarker?.id === place.id), // 선택된 마커는 색상 다르게
        });

        markersRef.current.push({ marker, id: place.id });

        // 마커 정보창 내용
        const content = `
          <div style="padding:5px; font-size:13px;">
            <b>${place.place_name}</b><br/>
            ${place.phone ? `☎ ${place.phone}<br/>` : ''}
            ${place.address_name || ''}
          </div>
        `;
        const infowindow = new window.kakao.maps.InfoWindow({ content });

        // 마커 이벤트 핸들링
        window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
        window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker);
          setSelectedMarker({ id: place.id }); // 선택된 마커 업데이트
          if (onSelectShop) onSelectShop(place.place_name); // 상점 이름을 상위 컴포넌트에 전달
        });
      });
    }, {
      location: centerCoords,
      radius: 3000, // 반경 3km 내에서 검색
    });
  }

  // 🔹 마커 이미지 결정 (선택된 마커만 초록색)
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

  // 🔹 최종 렌더링된 지도 영역 반환
  return (
    <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />
  );
}

export default AutoShopMap;
