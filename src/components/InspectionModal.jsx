// src/components/InspectionModal.jsx
import React from 'react';
import Slider from 'react-slick';
import './InspectionModal.css';

export default function InspectionModal({ item, onClose }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,            
    autoplaySpeed: 2000,      
    arrows: true,             
    pauseOnHover: true,       
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{item.title}</h3>

        {/* 이미지 슬라이드 */}
        {item.images?.length > 0 ? (
          <Slider {...settings}>
            {item.images.map((src, index) => (
              <div key={index}>
                <img
                  src={src}
                  alt={`slide-${index}`}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <p>이미지가 제공되지 않았습니다.</p>
        )}

        {/* 항목 정보 */}
        <p><strong>카테고리:</strong> {item.category}</p>
        <p><strong>추천 주기:</strong> {item.recommended_cycle}</p>
        <p><strong>관련 부품:</strong> {item.parts}</p>
        <p><strong>예상 비용:</strong> {item.cost_range}</p>
        {item.warning_light && (
          <p><strong>경고등:</strong> {item.warning_light}</p>
        )}
        <p className="detail">{item.detail}</p>

        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}