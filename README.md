# 🚗 MyCar360 – 내 차량 점검 도우미 (Frontend)

## 📌 개요
**MyCar360**은 차량 점검 초보자도 손쉽게 사용할 수 있는 **차량 점검 기록 및 예측 웹 애플리케이션**입니다.  
차량 번호 기반으로 로그인 후, 점검 항목 검색/찜, 이력 기록, 다음 점검 예측, 통계 시각화, 제품 추천까지 지원합니다.

이 리포지토리는 프론트엔드(React) 프로젝트입니다.

---

## 🛠 기술 스택
- React (Vite)
- Axios
- React Router
- Chart.js
- Lottie
- Kakao Map API
- Daum 주소 검색 API
- Coupang 파트너스 상품 링크 기반 연동

---

## ✨ 주요 기능

### 🚙 차량번호 기반 로그인
- 차량번호, 닉네임, 주소 입력으로 가입
- Supabase에 사용자 정보 저장
- localStorage에 로그인 정보 유지

### 🔎 점검 항목 검색 및 찜 기능
- `inspection_items` 테이블에서 점검 항목 목록 출력
- 키워드 검색 + 카테고리 필터
- 찜하기(하트) 기능 → 로그인한 사용자만 가능
- 찜한 항목은 MyPage에서 확인 가능

### 🧾 점검 이력 기록
- 점검 항목을 선택 후 날짜, 장소, 메모 기록
- 직접 수정 가능한 inline 편집 기능 제공
- 지도 마커와 연동된 히스토리 타임라인 표시

### 📅 다음 점검 시기 예측
- `/api/next-inspection/:carNumber` 호출
- 과거 점검 주기 + 최근 이력 기반 예측 날짜 및 항목 표시

### 🛒 차량 관련 제품 추천 슬라이드
- Coupang 파트너스 상품 이미지 + 링크 슬라이드
- 클릭 시 쿠팡 상품 페이지로 이동
- 차량 관리 용품 자동 순환 배너로 노출

### 📊 통계 차트
- Chart.js 기반 시각화
  - 계절별 사고 주요 원인 (Line Chart)
  - 사용자 인기 차량 TOP10 (Bar Chart)
- MyPage 및 Inspection 페이지에서 확인 가능

---

## 📂 프로젝트 구조
```
src/
┣ components/ # 공통 UI 컴포넌트 (헤더, 슬라이더 등)
┣ pages/ # 주요 페이지 (Home, MyPage, Signup 등)
┣ api/ # Axios 요청 모듈
┣ styles/ # CSS 파일
┣ App.jsx # 라우팅 및 전역 컴포넌트
┗ main.jsx # 앱 진입점
public/
┣ images/ # 정적 이미지 파일
┗ index.html
.env # 환경 변수 (VITE_API_BASE_URL 등)
vite.config.js # Vite 설정 파일
vercel.json # 배포 설정 (Redirects)
```