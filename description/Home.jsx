import { useState, useEffect } from 'react'; // React의 상태 관리 및 생명주기 함수
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 hook
import '../styles/home.css'; // 홈 전용 스타일
import ProductIconSlider from '../components/ProductIconSlider'; // 추천 상품 슬라이더 컴포넌트

// 점검 추천 항목 데이터
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

// 자주 묻는 질문(FAQ) 데이터
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
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [carImage, setCarImage] = useState('/main-car.jpg'); // 차량 이미지 상태
  const [expandedIndex, setExpandedIndex] = useState(null); // 카드 확장 여부 상태
  const [searchText, setSearchText] = useState(''); // 검색 입력 상태
  const [faqOpenIndex, setFaqOpenIndex] = useState(null); // FAQ 열림 상태

  const [carY, setCarY] = useState(null); // 스크롤 애니메이션용 Y 위치
  const [carEmoji, setCarEmoji] = useState('🚗'); // 움직이는 차량 이모지
  const [tip, setTip] = useState(''); // 차량 꿀팁

  const carColors = ['🚗', '🚙', '🚕', '🚘']; // 랜덤 이모지
  const tips = [
    '🚗 타이어 공기압은 매달 체크해요!',
    '🔋 배터리는 보통 2~3년에 한 번 교체해요!',
    '🧊 냉각수 보충도 잊지 마세요!',
    '🌧️ 장마철엔 와이퍼 점검 필수!',
  ];

  // Kakao Map SDK 동적 스크립트 삽입 (최초 한 번만 실행)
  useEffect(() => {
    const existing = document.getElementById('kakao-map-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'kakao-map-script';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // 이미지 업로드 시 미리보기 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarImage(URL.createObjectURL(file));
    }
  };

  // 정비소 관련 키워드 여부 판단
  const isRepairKeyword = (keyword) => {
    const patterns = [
      '정비소', '카센터', '오토큐', '오토클릭', '카닥', '카모아',
      '타이어', '현대', '기아', '쉐보레', '르노', '삼성', 'bmw', '폭스바겐', '블루핸즈'
    ];
    return patterns.some(pattern => keyword.includes(pattern.toLowerCase()));
  };

  // 검색 버튼 클릭 시 처리
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

  // 부릉부릉 버튼 클릭 시 애니메이션
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

    setTimeout(() => setCarY(null), 2000); // 2초 후 애니메이션 제거
  };

  const user = JSON.parse(localStorage.getItem('car_user'));
  const nickname = user?.nickname || null;

  return (
    <main className="home-container">
      {/* 상단 메인 이미지 영역 */}
      <section className="hero-section">
        <img src={carImage} alt="차량 이미지" className="hero-image" />
      </section>

      {/* 메인 버튼 */}
      <div className="image-upload-wrapper">
        <button className="main-button" onClick={handleVroomClick}>
          부릉부릉 🚗💨
        </button>
      </div>

      {/* 움직이는 차량 애니메이션 */}
      {carY !== null && (
        <div className="scroll-car" style={{ top: `${carY}px` }}>
          <div className="speech-bubble">{tip}</div>
          <div className="car">{carEmoji}💨</div>
        </div>
      )}

      {/* 인사 메시지 + 검색창 */}
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

        {/* 검색창 */}
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

      {/* 추천 아이콘 슬라이더 */}
      <ProductIconSlider />

      {/* 추천 점검 항목 카드 */}
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

      {/* 주요 기능 버튼 */}
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

      {/* 고객센터 정보 및 FAQ */}
      <section className="support-section">
        <div className="support-card">
          <h3>고객센터 안내</h3>

          <div className="support-info">
            <p><strong>📧 이메일:</strong> support@mycar360.co.kr</p>
            <p><strong>☎ 전화번호:</strong> 1588-1234</p>
            <p><strong>🕐 운영시간:</strong> 평일 09:00 ~ 18:00 <br/>(주말/공휴일 휴무)</p>
            <p><strong>🏢 회사 주소:</strong> 서울특별시 강남구 테헤란로 123</p>
          </div>

          {/* FAQ 리스트 */}
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
