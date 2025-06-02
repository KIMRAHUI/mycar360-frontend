import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Form.css';

function Login() {
  const navigate = useNavigate();
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // 인증번호 요청
  const handleSendCode = async () => {
    if (!telco || !phoneNumber) {
      return alert('통신사와 전화번호를 입력해주세요.');
    }
    try {
      await axios.post('/api/auth/signup', { phone_number: phoneNumber }); // code, car_number 절대 넣지 말 것
      alert('인증번호가 콘솔에 출력되었습니다. 확인 후 입력해주세요.');
      setCodeSent(true);
    } catch (error) {
      alert('인증번호 요청에 실패했습니다.');
      console.error(error);
    }
  };

  // 인증번호 확인 및 로그인 처리
  const handleVerify = async () => {
    if (!inputCode) {
      alert('인증번호를 입력하세요.');
      return;
    }
    try {
      const res = await axios.post('/api/auth/verify', {  // 여기 경로 꼭 verify 로 수정
        phone_number: phoneNumber,
        code: inputCode,
        car_number: carNumber  // 신규 가입일 때만 사용됨 (백엔드에서 처리)
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert('로그인 성공!');
        navigate('/');
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      alert('인증번호가 올바르지 않거나 로그인에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>🚗 MyCar360 로그인</h2>

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
