import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소',
  onSelectShop,
  searchAddress = '',
  enableDynamicSearch = false,
  mapType = 'road',
  onShopsUpdate,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const hasInitializedRef = useRef(false);
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 상태 관리

  // 마커 클리어 함수
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 컴포넌트가 로드될 때 실행되는 useEffect
  useEffect(() => {
    // 카카오 맵 SDK가 이미 index.html에서 로드되므로, 별도로 로드할 필요 없음
    if (window.kakao?.maps) {
      console.log("Kakao Maps SDK 로드됨");
      window.kakao.maps.load(initMap); // 카카오 맵 SDK 로드 후 지도 초기화
    } else {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
    }

    function initMap() {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      const container = document.getElementById('map');
      if (!container || !window.kakao) return;

      // 위치 정보 얻어서 지도 초기화
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 4,
          });

          mapInstanceRef.current = map;
          renderMarkers(map, new window.kakao.maps.LatLng(latitude, longitude));

          // 동적 검색 기능 활성화
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

  // 지도 뷰 타입 변경 감지
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    const typeId =
      mapType === 'road'
        ? window.kakao.maps.MapTypeId.ROADMAP
        : window.kakao.maps.MapTypeId.HYBRID;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 주소 검색 기능
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

  // 마커 렌더링 함수
  function renderMarkers(map, centerCoords) {
    clearMarkers();
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      keyword,
      (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return;

        const shopList = [];

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
            // 클릭한 마커만 보이도록 처리
            markersRef.current.forEach(({ marker }) => marker.setMap(null));
            markersRef.current = [{ marker, id: place.id }];
            if (onSelectShop) onSelectShop(place.place_name);
          });

          // 유형 분류용 리스트에 저장
          shopList.push({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            phone: place.phone,
            type: place.category_group_name || '기타',
          });
        });

        // 부모로 데이터 전달
        if (onShopsUpdate) {
          onShopsUpdate(shopList);
        }
      },
      {
        location: centerCoords,
        radius: 3000,
      }
    );
  }

  // 마커 이미지 설정
  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png';
    return new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(25, 41), {
      offset: new window.kakao.maps.Point(12, 41),
    });
  }

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />;
}

export default AutoShopMap;
