import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginStyle.css';

function Login() {
  const navigate = useNavigate();
  const [carNumber, setCarNumber] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    if (carNumber.length >= 6) {
      axios
        .get(fetch(`https://mycar360-backend.onrender.com/api/vehicle-info/${carNumber}`)
        )
        .then(res => setVehicleInfo(res.data))
        .catch(() => setVehicleInfo(null));
    } else {
      setVehicleInfo(null);
    }
  }, [carNumber]);

  const handleSendCode = () => {
    if (!telco || !phoneNumber) {
      return alert('통신사와 전화번호를 입력해주세요');
    }
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setAuthCode(randomCode);
    setCodeSent(true);
    alert(`인증번호는 ${randomCode}입니다 (임시 발송)`);
  };

  const handleVerify = () => {
    if (inputCode === authCode) {
      setCodeVerified(true);

      localStorage.setItem('car_user', JSON.stringify({
        carNumber,
        nickname: '포카칩',
        verified: true,
        id: Date.now(), // 고유 ID 값 부여
      }));

      alert('✅ 인증 성공! 회원가입 완료 🎉');

      //  App이 user 상태를 즉시 반영하도록 강제 리로드
      navigate('/');
      window.location.reload();
    } else {
      alert('❌ 인증번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="signup-container">
      <h2>🚗 MyCar360 회원가입</h2>

      <input
        type="text"
        placeholder="차량 번호 (예: 12가3456)"
        value={carNumber}
        onChange={(e) => setCarNumber(e.target.value)}
      />

      {vehicleInfo && (
        <div className="vehicle-info">
          <p><strong>차종:</strong> {vehicleInfo.type}</p>
          <p><strong>연식:</strong> {vehicleInfo.year}</p>
          <p><strong>부품 이력:</strong> {vehicleInfo.parts.join(', ')}</p>
          <p><strong>점검 이력:</strong> {vehicleInfo?.history?.join(', ') || '정보 없음'}</p>
        </div>
      )}

      <select value={telco} onChange={(e) => setTelco(e.target.value)}>
        <option value="">통신사 선택</option>
        <option value="SKT">SKT</option>
        <option value="KT">KT</option>
        <option value="LGU+">LG U+</option>
      </select>

      <input
        type="text"
        placeholder="휴대폰 번호 (예: 01012345678)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      {!codeSent ? (
        <button onClick={handleSendCode}>인증번호 요청</button>
      ) : (
        <>
          <button onClick={handleSendCode}>인증번호 재전송</button>
          <input
            type="text"
            placeholder="인증번호 입력"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          <button onClick={handleVerify}>인증 확인</button>
        </>
      )}

      {codeVerified && <p className="success-msg">🎉 회원가입이 완료되었습니다!</p>}
    </div>
  );
}

export default Login;
