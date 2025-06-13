import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소', // 검색 키워드 (기본: 정비소)
  onSelectShop, // 상위 컴포넌트에 선택된 정비소 알림
  searchAddress = '', // 주소 검색 시 이동할 주소
  enableDynamicSearch = false, // 지도 이동 시마다 자동 검색 여부
  mapType = 'road', // 지도 타입 (일반 or 스카이뷰)
  onShopsUpdate, // 상위 컴포넌트에 마커 목록 전달
  selectedShop, // 추천 정비소 중 선택된 항목
  recommendedShops = [], // 추천 정비소 리스트
}) {
  // ---------------- Ref 및 상태 ----------------
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const recommendedMarkersRef = useRef([]);
  const hasInitializedRef = useRef(false);
  const infoWindowRef = useRef(null);
  const initialCenterRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // ---------------- 초기 지도 생성 ----------------
  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    }

    function initMap() {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      const container = document.getElementById('map');
      if (!container) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const center = new window.kakao.maps.LatLng(latitude, longitude);

          const map = new window.kakao.maps.Map(container, {
            center,
            level: 4,
          });

          mapInstanceRef.current = map;
          initialCenterRef.current = center;

          renderMarkers(map, center); // 일반 마커 표시
          renderRecommendedMarkers(); // 추천 마커 표시

          // 지도 이동 후 마커 갱신 (옵션)
          if (enableDynamicSearch) {
            window.kakao.maps.event.addListener(map, 'idle', () => {
              renderMarkers(map, map.getCenter());
            });
          }
        },
        (err) => console.error('위치 정보 오류', err)
      );
    }
  }, []);

  // ---------------- 지도 타입 변경 ----------------
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const typeId = mapType === 'road'
      ? window.kakao.maps.MapTypeId.ROADMAP
      : window.kakao.maps.MapTypeId.HYBRID;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType]);

  // ---------------- 키워드 변경 시 마커 갱신 ----------------
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // ---------------- 주소 입력으로 위치 이동 ----------------
  useEffect(() => {
    if (!searchAddress || !mapInstanceRef.current) return;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        mapInstanceRef.current.setCenter(coords);
        renderMarkers(mapInstanceRef.current, coords);
      }
    });
  }, [searchAddress]);

  // ---------------- 추천 정비소 마커 ----------------
  useEffect(() => {
    if (!selectedShop || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const { lat, lng, name, address, phone } = selectedShop;
    const coords = new window.kakao.maps.LatLng(lat, lng);

    map.setCenter(coords);
    clearRecommendedMarkers();

    const marker = new window.kakao.maps.Marker({
      map,
      position: coords,
      image: createMarkerImage('/marker_star_yellow.png', 32),
    });

    const content = createInfoContent({ name, address, phone });

    window.kakao.maps.event.addListener(marker, 'click', () => {
      if (infoWindowRef.current) infoWindowRef.current.close();
      marker.setImage(createMarkerImage('/marker_star_orange.png', 32));
      const infoWindow = new window.kakao.maps.InfoWindow({ content });
      infoWindow.open(map, marker);
      infoWindowRef.current = infoWindow;
    });

    recommendedMarkersRef.current.push(marker);
  }, [selectedShop]);

  // ---------------- 일반 정비소 마커 렌더링 ----------------
  function renderMarkers(map, centerCoords) {
    clearMarkers();
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return;

      const shopList = [];

      data.slice(0, 5).forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const isSelected = selectedMarker?.id === place.id;

        const marker = new window.kakao.maps.Marker({
          map,
          position,
          image: getMarkerImage(isSelected),
        });

        markersRef.current.push({ marker, id: place.id });

        const content = createInfoContent({
          name: place.place_name,
          address: place.address_name,
          phone: place.phone,
        });

        // 마우스 오버 시 정보창 표시
        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          if (!infoWindowRef.current || infoWindowRef.current.getContent() !== content) {
            infoWindowRef.current = new window.kakao.maps.InfoWindow({ content });
          }
          infoWindowRef.current.open(map, marker);
        });

        // 마우스 아웃 시 정보창 닫기
        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
        });

        // 마커 클릭 시 정보창 열기 및 선택 처리
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
    }, { location: centerCoords, radius: 3000 });
  }

  // ---------------- 추천 마커 표시 ----------------
  function renderRecommendedMarkers() {
    if (!mapInstanceRef.current || !recommendedShops.length) return;
    clearRecommendedMarkers();

    recommendedShops.forEach((shop) => {
      const coords = new window.kakao.maps.LatLng(shop.lat, shop.lng);
      const marker = new window.kakao.maps.Marker({
        map: mapInstanceRef.current,
        position: coords,
        image: createMarkerImage('/marker_star_yellow.png', 32),
      });

      const content = createInfoContent(shop);

      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const infoWindow = new window.kakao.maps.InfoWindow({ content });
        infoWindow.open(mapInstanceRef.current, marker);
        infoWindowRef.current = infoWindow;
      });

      recommendedMarkersRef.current.push(marker);
    });
  }

  // ---------------- 유틸 함수 ----------------
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  function clearRecommendedMarkers() {
    recommendedMarkersRef.current.forEach((m) => m.setMap(null));
    recommendedMarkersRef.current = [];
  }

  function createMarkerImage(src, size) {
    return new window.kakao.maps.MarkerImage(
      src,
      new window.kakao.maps.Size(size, size),
      { offset: new window.kakao.maps.Point(size / 2, size) }
    );
  }

  function getMarkerImage(isSelected) {
    const src = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png';
    return createMarkerImage(src, 25);
  }

  function createInfoContent({ name, address, phone }) {
    return `
      <div style="padding:5px; font-size:13px; max-width:250px;">
        <b>${name}</b><br/>
        ${phone ? `☎ ${phone}<br/>` : ''}
        ${address || ''}
      </div>
    `;
  }

  // ---------------- 현재 위치로 이동 ----------------
  const goToInitialPosition = () => {
    if (mapInstanceRef.current && initialCenterRef.current) {
      mapInstanceRef.current.setCenter(initialCenterRef.current);
      clearRecommendedMarkers();
      renderRecommendedMarkers();
      renderMarkers(mapInstanceRef.current, initialCenterRef.current);
    }
  };

  // ---------------- 렌더링 ----------------
  return (
    <div style={{ position: 'relative' }}>
      <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />
      <button
        onClick={goToInitialPosition}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          background: '#333',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        현재 위치로 돌아가기
      </button>
    </div>
  );
}

export default AutoShopMap;
