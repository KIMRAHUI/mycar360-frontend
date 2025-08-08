// src/components/Footer.jsx
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-row">
        <span>이메일: support@mycar360.co.kr</span>
        <span>|</span>
        <span>전화번호: 1588-1234</span>
        <span>|</span>
        <span>운영시간: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</span>
        <span>|</span>
        <span>주소: 서울특별시 강남구 테헤란로 123</span>
      </div>
      <div className="footer-copy">© 2025 MyCar360. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
