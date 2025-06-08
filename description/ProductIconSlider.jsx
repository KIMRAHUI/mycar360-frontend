// 🚗 차량 관련 제품 추천 슬라이더 컴포넌트
// react-slick을 사용한 가로 스크롤 슬라이더 구현

import Slider from 'react-slick'; // react-slick 슬라이더 컴포넌트 임포트
import 'slick-carousel/slick/slick.css'; // 기본 슬릭 스타일
import 'slick-carousel/slick/slick-theme.css'; // 테마 스타일
import './ProductIconSlider.css'; // 사용자 정의 스타일

// 각 차량 용품 항목 리스트 (이모지, 이름, 쿠팡 파트너스 링크)
const carItems = [
  { icon: '🔋', label: '점프스타터', link: 'https://link.coupang.com/a/cxePZj' },
  { icon: '🧯', label: '타이어펌프', link: 'https://link.coupang.com/a/cxeQYK' },
  { icon: '❄️', label: '김서림방지', link: 'https://link.coupang.com/a/cxeQ6z' },
  { icon: '🧹', label: '무선청소기', link: 'https://link.coupang.com/a/cxeRe7' },
  { icon: '🛢️', label: '엔진첨가제', link: 'https://link.coupang.com/a/cxeRoZ' },
  { icon: '🧴', label: '유리세정제', link: 'https://link.coupang.com/a/cxeSot' },
  { icon: '🧼', label: '실내클리너', link: 'https://link.coupang.com/a/cxeTAA' },
  { icon: '🧽', label: '왁스코팅', link: 'https://link.coupang.com/a/cxeSxp' },
  { icon: '📷', label: '블랙박스', link: 'https://link.coupang.com/a/cxeS1a' },
  { icon: '💨', label: '공기청정기', link: 'https://link.coupang.com/a/cxeS7q' },
];

// 슬라이더 컴포넌트 정의
const ProductIconSlider = () => {
  // react-slick 설정 옵션
  const settings = {
    dots: false,               // 하단 도트 비표시
    infinite: true,            // 무한 루프
    speed: 400,                // 슬라이드 전환 속도(ms)
    slidesToShow: 5,           // 한 번에 보여줄 슬라이드 수 (PC 기준)
    slidesToScroll: 1,         // 한 번에 넘어갈 슬라이드 수
    autoplay: true,            // 자동 재생
    autoplaySpeed: 2500,       // 자동 재생 간격(ms)
    responsive: [              // 반응형 설정 (미디어쿼리 대응)
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="icon-slider-wrapper">
      {/* react-slick 슬라이더 */}
      <Slider {...settings}>
        {carItems.map((item, idx) => (
          <a
            key={idx}
            href={item.link}              // 쿠팡 파트너스 링크
            target="_blank"               // 새 창에서 열기
            rel="noopener noreferrer"     // 보안 속성
            className="icon-slide"        // 스타일 클래스
          >
            <div className="emoji">{item.icon}</div>       {/* 이모지 아이콘 */}
            <div className="label">{item.label}</div>      {/* 제품명 라벨 */}
          </a>
        ))}
      </Slider>
    </div>
  );
};

export default ProductIconSlider;
