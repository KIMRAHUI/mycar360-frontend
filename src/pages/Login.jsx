import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Form.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // ✅ 인증번호 요청
  const handleSendCode = () => {
    if (!telco || !phoneNumber) {
      alert('통신사와 전화번호를 입력해주세요.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`📧 인증번호가 콘솔에 출력되었습니다(개발용): ${code}`);
    console.log('인증번호:', code);
    setCodeSent(true);
  };

  // ✅ 인증번호 확인 + 실제 로그인 처리
  const handleVerify = async () => {
    if (!inputCode) {
      alert('인증번호를 입력하세요.');
      return;
    }
    if (inputCode !== generatedCode) {
      alert('인증번호가 올바르지 않습니다.');
      return;
    }

    try {
      // ✅ 백엔드 로그인 요청
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        { phone_number: phoneNumber }
      );



      const { token, user } = res.data;

      // 로컬스토리지 저장 및 상태 반영
      localStorage.setItem('car_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);

      alert("😎 로그인 완료! 내 차 관리, 이제부터 함께해요~ 🛠️🚗");
      navigate('/');
    } catch (err) {
      if (err.response?.status === 404) {
        alert('❌ 등록된 사용자가 없습니다. 회원가입을 먼저 진행해주세요.');
      } else {
        alert('🚨 로그인 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>🚗 MyCar360 간편 로그인</h2>

      <select value={telco} onChange={e => setTelco(e.target.value)}>
        <option value="">통신사 선택</option>
        <option value="SKT">SKT</option>
        <option value="KT">KT</option>
        <option value="LGU+">LG U+</option>
      </select>

      <input
        type="text"
        placeholder="휴대폰 번호 (예: 01012345678)"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
      />

      <input
        type="text"
        placeholder="차량 번호 (예: 12가3456)"
        value={carNumber}
        onChange={e => setCarNumber(e.target.value)}
      />

      {!codeSent ? (
        <button onClick={handleSendCode}>인증번호 요청</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="인증번호 입력"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <button onClick={handleVerify}>로그인</button>
        </>
      )}

      {noticeMessage && (
        <div className="auth-notice">
          <p>{noticeMessage}</p>
        </div>
      )}

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        아직 회원이 아니신가요?{' '}
        <Link to="/signup" style={{ color: '#007bff', textDecoration: 'underline' }}>
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default Login;
