import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductIconSlider.css';

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

const ProductIconSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="icon-slider-wrapper">
      <Slider {...settings}>
        {carItems.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-slide"
          >
            <div className="emoji">{item.icon}</div>
            <div className="label">{item.label}</div>
          </a>
        ))}
      </Slider>
    </div>
  );
};

export default ProductIconSlider;
