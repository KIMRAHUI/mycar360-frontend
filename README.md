# 🚗 MyCar360 – 내 차량 점검 도우미 (Frontend)

## 📌 개요  
**MyCar360**은 차량 점검 초보자도 손쉽게 사용할 수 있는 **차량 점검 기록 및 예측 웹 애플리케이션**입니다.  
차량 번호 기반으로 로그인 후, 점검 항목 검색/찜, 이력 기록, 다음 점검 예측, 통계 시각화, 제품 추천까지 지원합니다.  

> 본 리포지토리는 프론트엔드(React) 프로젝트입니다.  
> Supabase + Express 백엔드 연동 기반으로 작동합니다.

---

## 🛠 기술 스택
- React (Vite)
- Axios
- React Router
- Chart.js
- Kakao Map API
- Daum 주소 검색 API
- Coupang 파트너스 상품 링크 기반 연동

---

## ✨ 주요 기능

### 🚙 차량번호 기반 로그인
- 차량번호, 닉네임, 주소 입력으로 가입
- Supabase `users` 테이블에 사용자 정보 저장
- 로그인 시 localStorage에 로그인 정보 유지
- 마이페이지에서 사용자 정보 표시

### 🔎 점검 항목 검색 및 찜 기능
- `inspection_items` 테이블에서 실시간 항목 검색
- 키워드 검색 + 카테고리 필터 동시 적용
- 로그인한 사용자만 찜(하트) 가능
- 찜한 항목은 MyPage > 찜 목록 탭에서 확인 가능

### 🧾 점검 이력 기록
- 점검 항목을 선택 후 날짜, 장소, 메모 입력
- `inspection_history` 테이블에 저장
- MyPage에서 히스토리 타임라인 형식으로 표시
- 각 항목은 inline 수정 가능 (날짜, 메모, 장소)

### 📅 다음 점검 시기 예측
- `/api/next-inspection/:carNumber` API 호출
- Supabase에 저장된 점검 주기 및 이력 기반 분석
- MyPage에서 다음 점검 시기와 추천 항목 표시

### 🛒 차량 관련 제품 추천 슬라이드
- Coupang 파트너스 URL 기반의 추천 배너
- 주요 제품 아이콘 + 라벨 슬라이드
- 클릭 시 Coupang 파트너스 링크로 이동
- Home 페이지 상단 배너 형태로 구현

### 📊 통계 차트
- Chart.js 기반 시각화
  - 계절별 사고 원인 (Line Chart)
  - 사용자 인기 차량 TOP10 (Bar Chart)
- Inspection 페이지 내 모달로 표시

---

## 🗺️ 정비소 지도 기능 개선 (2025-06)
- Kakao Map API 기반 주변 정비소 표시
- 검색어 반영 실시간 마커 표시
- 스카이뷰/일반지도 전환 기능 추가
- Daum 주소 검색 API로 위치 이동 가능
- 마커 클릭 시 InfoWindow 및 강조 처리

> ✅ 모바일 대응:
> - 버튼 1행 2열 정렬
> - 가로 넘침 방지
> - 지도 뷰 및 검색창 반응형 구현

---

## ⭐ 추천 정비소 기능 추가 (2025-06-13)
- Supabase `recommended_auto_shops` 테이블 기반
- "추천 정비소 보기" 버튼 클릭 시 슬라이드 패널 오픈
- 슬라이드 탭 구성:
  - 상호명 / 태그 / 전화번호 / 주소 / 썸네일 이미지
  - 페이지네이션 (5개씩)
  - 평점 기준 정렬 토글 기능 포함
- 지도 마커 연동:
  - 노란 별 ⭐ → 기본 상태
  - 주황 별 🟠 → 클릭 시 강조 + InfoWindow 표시
  - 마커 클릭 시 지도 중심 이동 및 단일 강조만 유지

---

## 🎨 UI/UX 개선 사항 (2025-06-14 기준)
- 마이페이지 찜 카드 디자인 개선
  - 크기 축소 및 중앙 정렬 스타일
  - 삭제 버튼 스타일 분리 (CSS 적용)
- 점검 이력 카드 UI 개선
  - 항목 이름과 화살표 아이콘 겹침 현상 제거
  - 텍스트 컬러 (#333)로 통일, 노란 계열 제거

---

## 📂 프로젝트 구조
```
src/
┣ api/ # Axios API 호출 모듈
┣ components/ # 공통 컴포넌트 (지도, 헤더, 슬라이드 등)
┃ ┣ AutoShopMap.jsx # 지도 기능 (정비소, 추천 정비소 마커 등)
┃ ┣ CoupangSlider.jsx # 제품 추천 슬라이더
┃ ┣ InspectionModal.jsx# 점검 항목 상세 모달
┃ ┗ Header.jsx # 상단 네비게이션
┣ pages/ # 페이지 단위 구성
┃ ┣ Home.jsx
┃ ┣ MyPage.jsx # 탭형 마이페이지: 찜, 히스토리, 프로필 등
┃ ┣ Signup.jsx
┃ ┗ Inspection.jsx # 점검 항목 검색 페이지
┣ styles/
┃ ┣ AutoShopMap.css
┃ ┣ InspectionModal.css
┃ ┗ Common.css
┣ App.jsx # 전체 라우팅 및 전역 레이아웃
┗ main.jsx # 앱 진입점

public/
┣ images/
┃ ┣ marker-icon-blue.png
┃ ┣ marker-icon-red.png
┃ ┣ marker_star_yellow.png
┃ ┗ marker_star_orange.png
```
