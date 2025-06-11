import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소', // 검색 키워드 기본값
  onSelectShop,      // 부모로 선택된 상호명 전달하는 콜백
  searchAddress = '', // 주소 검색 시 이동할 위치
  enableDynamicSearch = false, // 지도 이동 시 자동 재검색 기능 여부
  mapType = 'road',            // 'road' 또는 'hybrid' 지도 유형
  onShopsUpdate,               // 검색된 정비소 목록 전달 콜백
}) {
  const mapRef = useRef(null);              // 지도 div 참조
  const mapInstanceRef = useRef(null);      // 카카오맵 인스턴스 저장
  const markersRef = useRef([]);            // 마커 저장 리스트
  const hasInitializedRef = useRef(false);  // 맵 최초 초기화 여부
  const infoWindowRef = useRef(null);       // 열려 있는 InfoWindow 관리

  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 상태 저장

  // 기존 마커를 지도에서 제거하고 배열 초기화
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  // 지도 초기화: 최초 1회 실행
  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    } else {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
    }

    function initMap() {
      if (hasInitializedRef.current) return; // 중복 초기화 방지
      hasInitializedRef.current = true;

      const container = document.getElementById('map');
      if (!container || !window.kakao) return;

      // 현재 위치를 기준으로 지도 생성
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 4,
          });

          mapInstanceRef.current = map;
          renderMarkers(map, map.getCenter());

          // 지도 이동 시마다 검색 실행 (옵션)
          if (enableDynamicSearch) {
            window.kakao.maps.event.addListener(map, 'idle', () => {
              renderMarkers(map, map.getCenter());
            });
          }
        },
        (err) => {
          console.error('위치 정보 오류', err);
        }
      );
    }
  }, [keyword, onSelectShop, enableDynamicSearch]);

  // 지도 유형 (일반도/스카이뷰) 전환
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    const typeId =
      mapType === 'road'
        ? window.kakao.maps.MapTypeId.ROADMAP
        : window.kakao.maps.MapTypeId.HYBRID;
    mapInstanceRef.current.setMapTypeId(typeId);
  }, [mapType]);

  // 키워드 변경 또는 선택된 마커 변경 시 마커 다시 렌더링
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]);

  // 주소 검색에 따른 지도 이동
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

  // 마커 렌더링 함수 (검색된 정비소 목록 생성)
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
            image: getMarkerImage(selectedMarker?.id === place.id), // 선택 여부에 따라 마커 색상 다르게
          });

          markersRef.current.push({ marker, id: place.id });

          // InfoWindow에 표시할 내용
          const content = `
            <div style="padding:5px; font-size:13px;">
              <b>${place.place_name}</b><br/>
              ${place.phone ? `☎ ${place.phone}<br/>` : ''}
              ${place.address_name || ''}
            </div>
          `;

          // 마우스 오버 시 InfoWindow 열기
          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            if (!infoWindowRef.current || infoWindowRef.current.getContent() !== content) {
              infoWindowRef.current = new window.kakao.maps.InfoWindow({ content });
            }
            infoWindowRef.current.open(map, marker);
          });

          // 마우스 아웃 시 InfoWindow 닫기
          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
          });

          // 마커 클릭 시 상세 정보 표시
          window.kakao.maps.event.addListener(marker, 'click', () => {
            if (infoWindowRef.current) infoWindowRef.current.close();

            const newInfoWindow = new window.kakao.maps.InfoWindow({ content });
            newInfoWindow.open(map, marker);
            infoWindowRef.current = newInfoWindow;

            setSelectedMarker({ id: place.id }); // 선택된 마커 ID 저장
            if (onSelectShop) onSelectShop(place.place_name); // 부모로 전달
          });

          // 상위 컴포넌트로 전달할 데이터 저장
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

  // 마커 이미지 생성 함수
  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png';
    return new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(25, 41), {
      offset: new window.kakao.maps.Point(12, 41),
    });
  }

  return (
    <div
      id="map"
      ref={mapRef}
      style={{ width: '100%', height: '500px' }}
    />
  );
}

export default AutoShopMap;
