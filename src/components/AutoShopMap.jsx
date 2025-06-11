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
  const infoWindowRef = useRef(null); 
  
  const [selectedMarker, setSelectedMarker] = useState(null); //  선택된 마커 상태 관리

  // 기존 마커 제거
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 맵 초기화
  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    } else {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
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

  // 지도 유형 변경
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    const typeId = mapType === 'road'
      ? window.kakao.maps.MapTypeId.ROADMAP
      : window.kakao.maps.MapTypeId.HYBRID;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType]);

  // 키워드나 선택 마커가 바뀌면 리렌더링
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 주소 검색
  useEffect(() => {
    if (!searchAddress || !window.kakao?.maps || !mapInstanceRef.current) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        mapInstanceRef.current.setCenter(coords);
        renderMarkers(mapInstanceRef.current, coords);
      }
    });
  }, [searchAddress]);

  // 마커 생성
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

          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            if (!infoWindowRef.current || infoWindowRef.current.getContent() !== content) {
              infoWindowRef.current = new window.kakao.maps.InfoWindow({ content });
            }
            infoWindowRef.current.open(map, marker);
          });

          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            if (infoWindowRef.current) infoWindowRef.current.close();

            const newInfoWindow = new window.kakao.maps.InfoWindow({ content });
            newInfoWindow.open(map, marker);
            infoWindowRef.current = newInfoWindow;

            setSelectedMarker({ id: place.id });
            if (onSelectShop) onSelectShop(place.place_name);
          });

          shopList.push({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            phone: place.phone,
            type: place.category_group_name || '기타',
          });
        });

        if (onShopsUpdate) onShopsUpdate(shopList);
      },
      { location: centerCoords, radius: 3000 }
    );
  }

  // 마커 색상 설정
  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png';
    return new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(25, 41), {
      offset: new window.kakao.maps.Point(12, 41),
    });
  }

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />;
}

export default AutoShopMap;
