import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Form.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // 인증번호 생성 및 알림
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

  // 인증번호 확인 및 로컬 로그인
  const handleVerify = () => {
    if (!inputCode || inputCode !== generatedCode) {
      alert('인증번호가 올바르지 않습니다.');
      return;
    }

    const fakeUser = {
      id: '1',
      nickname: '포카칩님',
      carNumber: carNumber || '12가3456',
      verified: true,
    };
    localStorage.setItem('car_user', JSON.stringify(fakeUser));
    setUser(fakeUser);
    alert("😎 로그인 완료!");
    navigate('/');
  };

  return (
    <div className="login-container">
      <h2>🚗 MyCar360 간편 로그인</h2>
      <select value={telco} onChange={e => setTelco(e.target.value)}>
        <option value="">통신사 선택</option><option value="SKT">SKT</option><option value="KT">KT</option><option value="LGU+">LG U+</option>
      </select>
      <input type="text" placeholder="휴대폰 번호" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
      <input type="text" placeholder="차량 번호" value={carNumber} onChange={e => setCarNumber(e.target.value)} />

      {!codeSent ? (
        <button onClick={handleSendCode}>인증번호 요청</button>
      ) : (
        <>
          <input type="text" placeholder="인증번호 입력" value={inputCode} onChange={e => setInputCode(e.target.value)} />
          <button onClick={handleVerify}>로그인</button>
        </>
      )}

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        아직 회원이 아니신가요? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'underline' }}>회원가입</Link>
      </p>
    </div>
  );
}

export default Login;
