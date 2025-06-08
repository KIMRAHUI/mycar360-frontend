import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Form.css';

function Signup({ setUser }) {
  const navigate = useNavigate();

  // 입력 상태 관리
  const [carNumber, setCarNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  // 주소 검색 버튼
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address); // 선택된 주소 저장
      }
    }).open();
  };

  // 인증번호 발송 요청
  const handleSendCode = async () => {
    if (!telco || !phoneNumber) {
      alert('통신사와 전화번호를 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post('/api/auth/signup', { phone_number: phoneNumber });
      const code = res.data.code;
      setAuthCode(code);
      setCodeSent(true);
      alert(`📨 인증번호가 발송되었습니다!\n(개발용): ${code}`);
    } catch (err) {
      alert('인증번호 발송에 실패했습니다.');
    }
  };

  // 인증번호 확인 및 회원가입
  const handleVerifyCode = async () => {
    try {
      const response = await axios.post('/api/auth/verify', {
        phone_number: phoneNumber,
        code: inputCode,
        car_number: carNumber,
        nickname,
        address,
        telco,
        vehicle_type: vehicleType,
      });

      const { token, user } = response.data;

      localStorage.setItem('car_token', token);
      localStorage.setItem('car_user', JSON.stringify(user));
      setUser(user);
      setCodeVerified(true);
      navigate('/');
    } catch (err) {
      alert('회원가입 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <h2>🚗 MyCar360 회원가입</h2>
      {/* 입력 필드: 차량 번호, 닉네임, 차종, 통신사, 번호, 주소 */}
      <input type="text" placeholder="차량 번호" value={carNumber} onChange={e => setCarNumber(e.target.value)} disabled={codeVerified} />
      <input type="text" placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} disabled={codeVerified} />
      <input type="text" placeholder="차종" value={vehicleType} onChange={e => setVehicleType(e.target.value)} disabled={codeVerified} />
      <select value={telco} onChange={e => setTelco(e.target.value)} disabled={codeVerified}>
        <option value="">통신사 선택</option><option value="SKT">SKT</option><option value="KT">KT</option><option value="LGU+">LG U+</option>
      </select>
      <input type="text" placeholder="휴대폰 번호" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={codeVerified} />
      <div className="address-input-wrapper">
        <input type="text" placeholder="주소 검색" value={address} readOnly disabled={codeVerified} />
        <button type="button" onClick={handleAddressSearch} disabled={codeVerified}>주소 검색</button>
      </div>

      {/* 인증번호 발송/입력 UI */}
      {!codeSent ? (
        <button onClick={handleSendCode}>인증번호 발송</button>
      ) : (
        <>
          <button onClick={handleSendCode} disabled={codeVerified}>인증번호 재전송</button>
          <input type="text" placeholder="인증번호 입력" value={inputCode} onChange={e => setInputCode(e.target.value)} disabled={codeVerified} />
          <button onClick={handleVerifyCode} disabled={inputCode.length === 0 || codeVerified}>인증 확인</button>
        </>
      )}

      {codeVerified && <p className="success-msg">회원가입이 완료되었습니다!</p>}
    </div>
  );
}

export default Signup;
