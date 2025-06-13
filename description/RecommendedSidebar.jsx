import React, { useEffect, useState } from 'react';
import './RecommendedSidebar.css';
import axios from 'axios';

const ITEMS_PER_PAGE = 5; // 한 페이지당 표시할 정비소 수

export default function RecommendedSidebar({ isOpen, onClose, onSelectShop }) {
  // 전체 정비소 목록
  const [shops, setShops] = useState([]);
  // 정렬 순서: 'desc' = 별점 높은순, 'asc' = 낮은순
  const [sortOrder, setSortOrder] = useState('desc');
  // 현재 페이지 번호
  const [currentPage, setCurrentPage] = useState(1);
  // 클릭된 카드 ID (눌림 효과를 위한 상태)
  const [clickedId, setClickedId] = useState(null);

  // 사이드탭이 열릴 때 추천 정비소 API 호출
  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recommended-shops`)
        .then(res => setShops(res.data))
        .catch(err => console.error('🚨 추천 정비소 불러오기 실패:', err));
    }
  }, [isOpen]);


  // 정렬된 정비소 목록
  const sortedShops = [...shops].sort((a, b) =>
    sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE);

  // 현재 페이지에 해당하는 정비소만 슬라이싱
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* 상단 헤더 영역 */}
      <div className="sidebar-header">
        <h3>추천 정비소</h3>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>

      {/* 정렬 토글 버튼 */}
      <div className="sort-toggle">
        <button onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}>
          {sortOrder === 'desc' ? '별점 낮은순' : '별점 높은순'}
        </button>
      </div>

      {/* 정비소 리스트 출력 */}
      <div className="shop-list">
        {paginatedShops.map(shop => (
          <div
            key={shop.id}
            className={`shop-card ${clickedId === shop.id ? 'clicked' : ''}`}
            onClick={() => {
              setClickedId(shop.id);
              setTimeout(() => setClickedId(null), 300); // 클릭 효과 잠깐 유지
              if (onSelectShop) {
                onSelectShop({
                  id: shop.id,
                  name: shop.name,
                  address: shop.address,
                  phone: shop.phone,
                  lat: shop.lat,
                  lng: shop.lng
                });
              }
            }}
          >
            <img src={shop.image_url} alt={shop.name} />
            <div className="shop-info">
              <h4>{shop.name}</h4>
              <p>{shop.address}</p>
              <p><strong>📞 {shop.phone}</strong></p>
              <p>⭐ {(shop.rating ?? 0).toFixed(1)}</p>
              <div className="tags">
                {(shop.tags ?? []).map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="pagination">
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={currentPage === idx + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
