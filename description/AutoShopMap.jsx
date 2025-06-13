import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소',                   // 기본 검색 키워드
  onSelectShop,                        // 마커 클릭 시 상위 컴포넌트에 전달할 콜백
  searchAddress = '',                 // 외부에서 전달받은 주소 검색어
  enableDynamicSearch = false,       // 맵 이동 시마다 검색할지 여부
  mapType = 'road',                   // 지도 타입 (로드맵/스카이뷰)
  onShopsUpdate,                      // 검색된 정비소 리스트 업데이트 콜백
  selectedShop,                       // 추천 정비소 카드에서 선택된 정비소
  recommendedShops = [],             // 추천 정비소 리스트 (백엔드에서 가져옴)
}) {
  const mapRef = useRef(null); // 지도 DOM 참조
  const mapInstanceRef = useRef(null); // 지도 인스턴스
  const markersRef = useRef([]); // 일반 검색 마커 저장용
  const recommendedMarkersRef = useRef([]); // 추천 마커 저장용
  const hasInitializedRef = useRef(false); // 지도 초기화 여부
  const infoWindowRef = useRef(null); // 현재 열린 인포윈도우
  const initialCenterRef = useRef(null); // 초기 중심 좌표 저장
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 일반 마커 id 저장

  // 일반 마커 제거 함수
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 추천 마커 제거 함수
  function clearRecommendedMarkers() {
    recommendedMarkersRef.current.forEach((m) => m.setMap(null));
    recommendedMarkersRef.current = [];
  }

  // 맵 초기 렌더링
  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    }

    function initMap() {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      const container = document.getElementById('map');
      if (!container) return;

      // 현재 위치 기반으로 지도 생성
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 4,
          });

          mapInstanceRef.current = map;
          initialCenterRef.current = new window.kakao.maps.LatLng(latitude, longitude);

          renderMarkers(map, initialCenterRef.current); // 일반 마커 렌더링
          renderRecommendedMarkers(); // 추천 마커 렌더링

          if (enableDynamicSearch) {
            // 지도 이동 후 자동 재검색
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
  }, []);

  // 지도 타입 (로드맵/스카이뷰) 반영
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const typeId = mapType === 'road'
      ? window.kakao.maps.MapTypeId.ROADMAP
      : window.kakao.maps.MapTypeId.HYBRID;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType]);

  // 키워드나 마커 선택이 변경되었을 때 일반 마커 재렌더링
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 주소 검색 시 해당 위치로 이동 + 마커 렌더링
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

  // ⭐ 추천 정비소 마커 렌더링 함수
  function renderRecommendedMarkers() {
    if (!mapInstanceRef.current || !recommendedShops.length) return;
    clearRecommendedMarkers();

    recommendedShops.forEach((shop) => {
      const coords = new window.kakao.maps.LatLng(shop.lat, shop.lng);

      const markerImage = new window.kakao.maps.MarkerImage(
        '/marker_star_yellow.png',
        new window.kakao.maps.Size(32, 32),
        { offset: new window.kakao.maps.Point(16, 32) }
      );

      const marker = new window.kakao.maps.Marker({
        map: mapInstanceRef.current,
        position: coords,
        image: markerImage,
      });

      const content = `
        <div style="padding:5px; font-size:13px; max-width:250px;">
          <b>${shop.name}</b><br/>
          ${shop.phone ? `☎ ${shop.phone}<br/>` : ''}
          ${shop.address}
        </div>
      `;

      // 마커 클릭 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const infoWindow = new window.kakao.maps.InfoWindow({ content });
        infoWindow.open(mapInstanceRef.current, marker);
        infoWindowRef.current = infoWindow;
      });

      recommendedMarkersRef.current.push(marker);
    });
  }

  // ⭐ 추천 리스트 카드 클릭 시 지도 이동 + 마커 강조
  useEffect(() => {
    if (!selectedShop || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const { lat, lng, name, address, phone } = selectedShop;
    const coords = new window.kakao.maps.LatLng(lat, lng);

    map.setCenter(coords);
    clearRecommendedMarkers(); // 기존 추천 마커 제거

    const markerImage = new window.kakao.maps.MarkerImage(
      '/marker_star_yellow.png',
      new window.kakao.maps.Size(32, 32),
      { offset: new window.kakao.maps.Point(16, 32) }
    );

    const marker = new window.kakao.maps.Marker({
      map,
      position: coords,
      image: markerImage,
    });

    const content = `
      <div style="padding:5px; font-size:13px; max-width:250px;">
        <b>${name}</b><br/>
        ${phone ? `☎ ${phone}<br/>` : ''}
        ${address}
      </div>
    `;

    window.kakao.maps.event.addListener(marker, 'click', () => {
      if (infoWindowRef.current) infoWindowRef.current.close();

      const selectedImage = new window.kakao.maps.MarkerImage(
        '/marker_star_orange.png',
        new window.kakao.maps.Size(32, 32),
        { offset: new window.kakao.maps.Point(16, 32) }
      );
      marker.setImage(selectedImage);

      const infoWindow = new window.kakao.maps.InfoWindow({ content });
      infoWindow.open(map, marker);
      infoWindowRef.current = infoWindow;
    });

    recommendedMarkersRef.current.push(marker);
  }, [selectedShop]);

  // 🔍 일반 검색 마커 렌더링 함수
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

          // 마커 hover 효과
          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            if (!infoWindowRef.current || infoWindowRef.current.getContent() !== content) {
              infoWindowRef.current = new window.kakao.maps.InfoWindow({ content });
            }
            infoWindowRef.current.open(map, marker);
          });

          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
          });

          // 마커 클릭 시
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

  // 일반 마커 이미지 선택 시 강조
  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png';
    return new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(25, 41), {
      offset: new window.kakao.maps.Point(12, 41),
    });
  }

  // 초기 위치로 되돌아가기 버튼
  const goToInitialPosition = () => {
    if (mapInstanceRef.current && initialCenterRef.current) {
      mapInstanceRef.current.setCenter(initialCenterRef.current);
      clearRecommendedMarkers();
      renderRecommendedMarkers();
      renderMarkers(mapInstanceRef.current, initialCenterRef.current);
    }
  };

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
