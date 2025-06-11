import { useEffect, useRef, useState } from 'react';
import '../styles/AutoShopMap.css';

function AutoShopMap({
  keyword = '정비소', // 검색 키워드 기본값 설정 (정비소)
  onSelectShop, // 정비소 선택 시 실행되는 콜백 함수
  searchAddress = '', // 검색할 주소 (기본값은 빈 문자열)
  enableDynamicSearch = false, // 동적 검색을 활성화할지 여부
  mapType = 'road', // 기본 맵 타입 (일반지도: 'road', 하이브리드: 'hybrid')
  onShopsUpdate, // 정비소 리스트 업데이트 함수
}) {
  const mapRef = useRef(null); // 지도 컨테이너를 참조하는 ref
  const mapInstanceRef = useRef(null); // 지도 인스턴스를 참조하는 ref
  const markersRef = useRef([]); // 마커를 저장하는 ref
  const hasInitializedRef = useRef(false); // 맵이 초기화 되었는지 여부를 추적하는 ref
  const [selectedMarker, setSelectedMarker] = useState(null); // 현재 선택된 마커

  // 마커 클리어 함수: 기존의 마커들을 제거하는 함수
  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null)); // 모든 마커의 맵에서 제거
    markersRef.current = []; // 마커 배열 초기화
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

    // 맵 초기화 함수
    function initMap() {
      if (hasInitializedRef.current) return; // 맵이 이미 초기화 되었다면 실행하지 않음
      hasInitializedRef.current = true;

      const container = document.getElementById('map'); // 맵을 표시할 HTML 요소
      if (!container || !window.kakao) return; // 요소나 카카오 맵이 없다면 종료

      // 위치 정보 얻어서 지도 초기화
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = new window.kakao.maps.Map(container, { // 지도 인스턴스 생성
            center: new window.kakao.maps.LatLng(latitude, longitude), // 현재 위치로 중심 설정
            level: 4, // 줌 레벨 설정
          });

          mapInstanceRef.current = map; // 지도 인스턴스를 ref에 저장
          renderMarkers(map, new window.kakao.maps.LatLng(latitude, longitude)); // 마커 렌더링

          // 동적 검색 기능 활성화 (지도 중심이 바뀔 때마다 마커 업데이트)
          if (enableDynamicSearch) {
            window.kakao.maps.event.addListener(map, 'idle', () => {
              const center = map.getCenter();
              renderMarkers(map, center);
            });
          }
        },
        (err) => {
          console.error('위치 정보 오류', err); // 위치 정보 오류 처리
        }
      );
    }
  }, [keyword, onSelectShop, enableDynamicSearch]);

  // 지도 뷰 타입 변경 감지
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;
    const typeId =
      mapType === 'road'
        ? window.kakao.maps.MapTypeId.ROADMAP // 일반 지도
        : window.kakao.maps.MapTypeId.HYBRID; // 하이브리드 지도
    mapInstanceRef.current.setMapTypeId(typeId); // 지도 타입 설정
  }, [mapType]);

  // 마커 렌더링 함수
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers(mapInstanceRef.current, mapInstanceRef.current.getCenter());
    }
  }, [keyword, selectedMarker]); // 키워드나 선택된 마커가 변경될 때마다 마커 렌더링

  // 주소 검색 기능
  useEffect(() => {
    if (!searchAddress || !window.kakao?.maps || !mapInstanceRef.current) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchAddress, (result, status) => { // 주소 검색 API 호출
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x); // 검색된 주소의 좌표
        const map = mapInstanceRef.current;

        map.setCenter(coords); // 지도 중심을 검색된 좌표로 설정
        renderMarkers(map, coords); // 마커 렌더링
      }
    });
  }, [searchAddress]); // 주소가 변경될 때마다 실행

  // 마커 렌더링 함수
  function renderMarkers(map, centerCoords) {
    clearMarkers(); // 기존 마커들 제거
    const ps = new window.kakao.maps.services.Places(); // 카카오 맵 장소 검색 서비스

    // 장소 검색 API 호출
    ps.keywordSearch(
      keyword,
      (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return;

        const shopList = [];

        data.slice(0, 5).forEach((place) => { // 최대 5개 장소에 대해 마커를 추가
          const position = new window.kakao.maps.LatLng(place.y, place.x); // 장소 좌표

          const marker = new window.kakao.maps.Marker({
            map,
            position,
            image: getMarkerImage(selectedMarker?.id === place.id), // 마커 이미지 설정
          });

          markersRef.current.push({ marker, id: place.id }); // 마커 리스트에 추가

          const content = `
            <div style="padding:5px; font-size:13px;">
              <b>${place.place_name}</b><br/>
              ${place.phone ? `☎ ${place.phone}<br/>` : ''}
              ${place.address_name || ''}
            </div>
          `;
          const infowindow = new window.kakao.maps.InfoWindow({ content });

          // 마커에 이벤트 리스너 추가
          window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
          window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker); // 클릭한 마커에 대한 인포윈도우 열기
            setSelectedMarker({ id: place.id }); // 선택된 마커 상태 업데이트
            markersRef.current.forEach(({ marker }) => marker.setMap(null)); // 다른 마커 숨기기
            markersRef.current = [{ marker, id: place.id }]; // 현재 클릭한 마커만 표시
            if (onSelectShop) onSelectShop(place.place_name); // 선택된 정비소 이름 전달
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

        // 부모 컴포넌트에 업데이트된 정비소 리스트 전달
        if (onShopsUpdate) {
          onShopsUpdate(shopList);
        }
      },
      {
        location: centerCoords, // 중심 좌표 설정
        radius: 3000, // 반경 설정
      }
    );
  }

  // 마커 이미지 설정
  function getMarkerImage(isSelected) {
    const imageSrc = isSelected ? '/marker-icon-red.png' : '/marker-icon-blue.png'; // 선택된 마커는 빨간색, 나머지는 파란색
    return new window.kakao.maps.MarkerImage(imageSrc, new window.kakao.maps.Size(25, 41), {
      offset: new window.kakao.maps.Point(12, 41),
    });
  }

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '500px' }} />; // 맵 렌더링
}

export default AutoShopMap; // 컴포넌트 반환
