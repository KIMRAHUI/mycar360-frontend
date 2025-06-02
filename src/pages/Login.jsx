import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Form.css';

function Login() {
  const navigate = useNavigate();
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  // 인증번호 요청 (개발용 랜덤 생성)
  const handleSendCode = () => {
    if (!telco || !phoneNumber) {
      alert('통신사와 전화번호를 입력해주세요.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`개발용 인증번호: ${code} (실제 서비스에서는 문자로 전송됩니다)`);
    setCodeSent(true);
  };

  // 인증번호 확인 및 로컬 로그인 처리
  const handleVerify = () => {
    if (!inputCode) {
      alert('인증번호를 입력하세요.');
      return;
    }
    if (inputCode !== generatedCode) {
      alert('인증번호가 올바르지 않습니다.');
      return;
    }

    // 인증 성공 시 로컬스토리지에 사용자 정보 저장
    const fakeUser = {
      id: '1',
      nickname: '포카칩님',
      carNumber: carNumber || '12가3456',
      verified: true,
    };
    localStorage.setItem('car_user', JSON.stringify(fakeUser));
    alert('로그인 성공! 마이페이지로 이동합니다.');
    navigate('/mypage');
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
    </div>
  );
}

export default Login;
