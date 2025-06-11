// src/pages/Inspection.jsx

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // ✅ 백엔드 API 호출용 axios 인스턴스
import '../styles/inspection.css'; // ✅ 메인 페이지 스타일
import StatisticsModal from '../components/StatisticsModal'; // ✅ 통계 모달
import InspectionModal from '../components/InspectionModal'; // ✅ 점검 항목 상세 모달

function Inspection() {
  // ✅ 상태 관리
  const [items, setItems] = useState([]);              // 전체 점검 항목
  const [filtered, setFiltered] = useState([]);        // 검색/필터링된 항목
  const [category, setCategory] = useState('');        // 선택된 점검 카테고리
  const [search, setSearch] = useState('');            // 검색어
  const [selected, setSelected] = useState(null);      // 모달로 띄울 선택 항목
  const [error, setError] = useState(null);            // 에러 메시지
  const [page, setPage] = useState(1);                 // 현재 페이지
  const [total, setTotal] = useState(0);               // 전체 항목 수
  const [sort, setSort] = useState('title_asc');       // 정렬 방식
  const [favorites, setFavorites] = useState([]);      // 찜한 항목 ID 목록
  const [showStats, setShowStats] = useState(false);   // 통계 모달 표시 여부

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.toLowerCase() || '';
  const navigate = useNavigate();

  // ✅ 로그인한 사용자 정보
  const user = JSON.parse(localStorage.getItem('car_user'));
  const userId = user?.id || null;
  const limit = 10; // 한 페이지당 항목 수

  // ✅ 서버로부터 점검 항목 목록 가져오기 (카테고리/페이지/정렬 기준 변경 시마다 실행)
  useEffect(() => {
    const params = { page, limit, sort, ...(category && { category }) };
    axios.get('/api/inspection-items', { params })
      .then(res => {
        if (Array.isArray(res.data.items)) {
          setItems(res.data.items);
          setFiltered(res.data.items);
          setTotal(res.data.total);
        } else {
          setError('서버로부터 올바른 데이터를 받지 못했습니다.');
        }
      })
      .catch(err => {
        console.error('❌ API 요청 실패:', err);
        setError('서버와 연결할 수 없습니다.');
      });
  }, [page, category, sort]);

  // ✅ 검색어/카테고리/URL 쿼리(keyword) 기준으로 항목 필터링
  useEffect(() => {
    let temp = [...items];
    const safeStr = (v) => (v ?? '').toString().toLowerCase();
    const searchTerm = keyword || search.toLowerCase();

    if (searchTerm) {
      temp = temp.filter(item =>
        safeStr(item.title).includes(searchTerm) ||
        safeStr(item.summary).includes(searchTerm) ||
        safeStr(item.parts).includes(searchTerm)
      );
    }

    if (category) {
      temp = temp.filter(item => item.category === category);
    }

    setFiltered(temp);
  }, [search, keyword, category, items]);

  // ✅ 찜 목록 가져오기 (로그인한 유저일 경우에만)
  useEffect(() => {
    if (userId) {
      axios.get(`/api/favorites/${userId}`)
        .then(res => setFavorites(res.data.map(f => f.inspection_item_id)))
        .catch(err => console.error('❌ 찜 목록 불러오기 실패:', err));
    }
  }, [userId]);

  // ✅ 특정 항목이 찜되어 있는지 확인
  const isFavorite = (id) => favorites.includes(id);

  // ✅ 찜 토글 처리 (찜 추가/삭제)
  const toggleFavorite = (id) => {
    if (!userId) return alert('로그인 후 사용 가능합니다');

    const req = isFavorite(id)
      ? axios.delete(`/api/favorites/${id}`, { params: { user_id: userId } })
      : axios.post('/api/favorites', { user_id: userId, inspection_item_id: id });

    req.then(() => {
      setFavorites(prev =>
        isFavorite(id) ? prev.filter(fid => fid !== id) : [...prev, id]
      );
    }).catch(err => console.error('❌ 찜 변경 실패:', err));
  };

  // ✅ 전체 페이지 수 계산
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="inspection-container">
      <h2>🚗 차량 점검하기</h2>
      <p>점검 항목 검색과 카테고리 검색 가능해요!</p>

      {/* ✅ 검색 & 정렬 선택 */}
      <div className="inspection-controls">
        <div className="search-sort-wrap">
          <input
            type="text"
            placeholder="점검 항목 검색"
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="title_asc">항목이름(가나다)</option>
            <option value="title_desc">항목이름(역순)</option>
            <option value="category_asc">점검 유형(ㄱ-ㅎ순)</option>
            <option value="category_desc">점검 유형 (ㅎ-ㄱ순)</option>
          </select>
        </div>

        {/* ✅ 카테고리 필터 버튼 + 통계 보기 */}
        <div className="quick-buttons">
          <button onClick={() => setCategory('기본점검')}>기본점검</button>
          <button onClick={() => setCategory('계절점검')}>계절점검</button>
          <button onClick={() => setCategory('장거리점검')}>장거리점검</button>
          <button onClick={() => setShowStats(true)}>통계 보기</button>
        </div>
      </div>

      {/* ✅ 에러 메시지 출력 */}
      {error && <p className="error-message">{error}</p>}

      {/* ✅ 점검 항목 카드 목록 */}
      <div className="card-list">
        {filtered.length === 0 ? (
          <p className="no-results">조건에 맞는 점검 항목이 없습니다.</p>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="card"
              onClick={() => setSelected(item)}
            >
              <div className="card-header">
                <h3>{item.title}</h3>
                {userId && (
                  <button
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 클릭 방지
                      toggleFavorite(item.id);
                    }}
                  >
                    {isFavorite(item.id) ? '❤️' : '🤍'}
                  </button>
                )}
              </div>
              <p className="category">{item.category}</p>
              <p>{item.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* ✅ 페이지네이션 버튼 */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={page === i + 1 ? 'active' : ''}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ✅ 상세 모달 (선택된 항목) */}
      {selected && (
        <>
          {console.log('✅ 모달 렌더링됨:', selected)}
          <InspectionModal item={selected} onClose={() => setSelected(null)} />
        </>
      )}

      {/* ✅ 통계 모달 */}
      {showStats && <StatisticsModal onClose={() => setShowStats(false)} />}
    </main>
  );
}

export default Inspection;
