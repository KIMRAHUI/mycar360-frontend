import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Form.css';

function Signup({ setUser }) {
  const navigate = useNavigate();

  const [carNumber, setCarNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [telco, setTelco] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address);
      }
    }).open();
  };

  const handleSendCode = () => {
    if (!telco || !phoneNumber) {
      alert('통신사와 전화번호를 입력해주세요.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`📧 인증번호가 콘솔에 출력되었습니다: ${code}`);
    console.log('인증번호:', code);
    setCodeSent(true);
  };

  const handleVerifyCode = () => {
    if (inputCode === generatedCode) {
      setCodeVerified(true);
      alert('✅ 인증 완료! 회원가입 성공!');

      const userInfo = {
        id: Date.now(), // 임시 ID (나중에 백엔드 연동 시 대체)
        carNumber,
        nickname,
        address,
      };
      localStorage.setItem('car_user', JSON.stringify(userInfo));

      //상태 갱신으로 Header 렌더링 유도
      setUser(userInfo);

      //홈으로 이동
      navigate('/');
    } else {
      alert('인증번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="login-container">
      <h2>🚗 MyCar360 회원가입</h2>

      <input
        type="text"
        placeholder="차량 번호 (예: 12가3456)"
        value={carNumber}
        onChange={e => setCarNumber(e.target.value)}
        disabled={codeVerified}
      />

      <input
        type="text"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        disabled={codeVerified}
      />

      <select
        value={telco}
        onChange={e => setTelco(e.target.value)}
        disabled={codeVerified}
      >
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
        disabled={codeVerified}
      />

      <div className="address-input-wrapper">
        <input
          type="text"
          placeholder="주소 검색"
          value={address}
          readOnly
          disabled={codeVerified}
        />
        <button type="button" onClick={handleAddressSearch} disabled={codeVerified}>
          주소 검색
        </button>
      </div>

      {!codeSent ? (
        <button onClick={handleSendCode}>인증번호 발송</button>
      ) : (
        <>
          <button onClick={handleSendCode} disabled={codeVerified}>인증번호 재전송</button>
          <input
            type="text"
            placeholder="인증번호 입력"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            disabled={codeVerified}
          />
          <button onClick={handleVerifyCode} disabled={inputCode.length === 0 || codeVerified}>
            인증 확인
          </button>
        </>
      )}

      {codeVerified && <p className="success-msg">회원가입이 완료되었습니다!</p>}
    </div>
  );
}

export default Signup;
