import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import ProductIconSlider from '../components/ProductIconSlider';

const recommendations = [
  {
    title: '배터리 상태 확인 필요',
    reason: '날씨가 추워지면 배터리 성능이 저하되기 때문에 겨울철 전 점검을 권장합니다.',
  },
  {
    title: '타이어 마모 점검',
    reason: '빗길 주행이 잦은 계절에는 마모된 타이어로 인한 미끄러짐 위험이 큽니다.',
  },
  {
    title: '엔진오일 교체 주기 도래',
    reason: '주행거리 5,000~10,000km마다 교체가 필요하며, 장거리 운행 전 확인이 필요합니다.',
  },
];

const faqs = [
  {
    question: '정비 주기는 얼마나 되나요?',
    answer: '차종과 주행 습관에 따라 다르지만 일반적으로 엔진오일은 5,000~10,000km마다 교체를 권장합니다.',
  },
  {
    question: '위치 기반 서비스는 어떻게 작동하나요?',
    answer: '현재 위치를 기반으로 3km 내에 있는 정비소 정보를 제공해드립니다.',
  },
  {
  question: 'MyCar360은 어떤 서비스인가요?',
  answer: '내 차량의 점검과 정비 이력을 한눈에 관리할 수 있는 스마트 차량 헬스케어 플랫폼입니다.',
}
];

function Home() {
  const navigate = useNavigate();
  const [carImage, setCarImage] = useState('/main-car.jpg');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  const [carY, setCarY] = useState(null);
  const [carEmoji, setCarEmoji] = useState('🚗');
  const [tip, setTip] = useState('');

  const carColors = ['🚗', '🚙', '🚕', '🚘'];
  const tips = [
    '🚗 타이어 공기압은 매달 체크해요!',
    '🔋 배터리는 보통 2~3년에 한 번 교체해요!',
    '🧊 냉각수 보충도 잊지 마세요!',
    '🌧️ 장마철엔 와이퍼 점검 필수!',
  ];

  useEffect(() => {
    const existing = document.getElementById('kakao-map-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarImage(URL.createObjectURL(file));
    }
  };

  const isRepairKeyword = (keyword) => {
    const patterns = [
      '정비소', '카센터', '오토큐', '오토클릭', '카닥', '카모아',
      '타이어', '현대', '기아', '쉐보레', '르노', '삼성', 'bmw', '폭스바겐', '블루핸즈'
    ];
    return patterns.some(pattern => keyword.includes(pattern.toLowerCase()));
  };

  const handleSearch = () => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return;

    const user = JSON.parse(localStorage.getItem('car_user'));

    if (isRepairKeyword(keyword)) {
      navigate(`/autoshop?keyword=${encodeURIComponent(searchText)}`);
    } else {
      navigate(`/inspection?keyword=${encodeURIComponent(searchText)}`);
    }
  };

  const handleVroomClick = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const totalHeight = document.body.scrollHeight;

    let targetY;
    if (scrollY < viewportHeight / 2) {
      targetY = 80;
    } else if (scrollY + viewportHeight >= totalHeight - 100) {
      targetY = viewportHeight - 100;
    } else {
      targetY = viewportHeight / 2;
    }

    setCarEmoji(carColors[Math.floor(Math.random() * carColors.length)]);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    setCarY(targetY);

    setTimeout(() => setCarY(null), 2000);
  };

  const user = JSON.parse(localStorage.getItem('car_user'));
  const nickname = user?.nickname || null;

  return (
    <main className="home-container">
      <section className="hero-section">
        <img src={carImage} alt="차량 이미지" className="hero-image" />
      </section>

      <div className="image-upload-wrapper">
        <button className="main-button" onClick={handleVroomClick}>
          부릉부릉 🚗💨
        </button>
      </div>

      {carY !== null && (
        <div className="scroll-car" style={{ top: `${carY}px` }}>
          <div className="speech-bubble">{tip}</div>
          <div className="car">{carEmoji}💨</div>
        </div>
      )}

      <section className="welcome-box">
        <p className="hello-text">
          {nickname ? (
            <>
              {nickname}님, 안녕하세요!<br />
              현재 차량 상태는 양호합니다
            </>
          ) : (
            <>오늘도 안전운전을 응원합니다!</>
          )}
        </p>

        <div className="search-bar">
          <input
            type="text"
            value={searchText}
            placeholder="차량 점검, 정비소 정보를 검색해보세요"
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <button onClick={handleSearch}>검색</button>
        </div>
      </section>

      <ProductIconSlider />

      <section className="recommendations">
        <h3>🔧 추천 점검 항목</h3>
        <div className="recommendation-cards">
          {recommendations.map((item, index) => (
            <div
              key={index}
              className={`recommendation-card ${expandedIndex === index ? 'expanded' : ''}`}
              onClick={() => setExpandedIndex(index === expandedIndex ? null : index)}
            >
              <div className="card-title">{item.title}</div>
              {expandedIndex === index && (
                <div className="card-reason">{item.reason}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="navbuttons">
        <button onClick={() => navigate('/inspection')}>점검하기</button>
        <button onClick={() => navigate('/autoshop')}>정비소찾기</button>
        <button
          onClick={() => {
            if (user?.id) navigate('/history');
            else alert('로그인한 사용자만 이용 가능한 서비스입니다.');
          }}
        >
          이력 보기
        </button>
      </section>

      <section className="support-section">
        <div className="support-card">
          <h3>고객센터 안내</h3>

          <div className="support-info">
            <p><strong>📧 이메일:</strong> support@mycar360.co.kr</p>
            <p><strong>☎ 전화번호:</strong> 1588-1234</p>
            <p><strong>🕐 운영시간:</strong> 평일 09:00 ~ 18:00 <br/>(주말/공휴일 휴무)</p>
            <p><strong>🏢 회사 주소:</strong> 서울특별시 강남구 테헤란로 123</p>
          </div>

          <ul className="faq-list">
            {faqs.map((faq, idx) => (
              <li key={idx}>
                <button
                  className="faq-question"
                  onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                >
                  {faq.question}
                </button>
                {faqOpenIndex === idx && <p className="faq-answer">{faq.answer}</p>}
              </li>
            ))}
          </ul>
          <p className="support-end">안전운전을 응원합니다 💖</p>
        </div>
      </section>
    </main>
  );
}

export default Home;
