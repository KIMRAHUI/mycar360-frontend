import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios'; // 커스텀 Axios 인스턴스
import '../styles/inspection.css';
import StatisticsModal from '../components/StatisticsModal'; // 통계 보기 모달 컴포넌트

function Inspection() {
  // 상태 변수들 선언
  const [items, setItems] = useState([]);            // 전체 점검 항목 리스트
  const [filtered, setFiltered] = useState([]);      // 필터링된 항목 리스트
  const [category, setCategory] = useState('');      // 선택된 카테고리
  const [search, setSearch] = useState('');          // 검색어
  const [selected, setSelected] = useState(null);    // 모달로 띄울 선택된 항목
  const [error, setError] = useState(null);          // 오류 메시지
  const [page, setPage] = useState(1);               // 현재 페이지
  const [total, setTotal] = useState(0);             // 전체 항목 수
  const [sort, setSort] = useState('title_asc');     // 정렬 방식
  const [favorites, setFavorites] = useState([]);    // 찜한 항목 ID 배열
  const [showStats, setShowStats] = useState(false); // 통계 모달 토글

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.toLowerCase() || '';
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('car_user'));
  const userId = user?.id || null;
  const limit = 10; // 페이지당 항목 수

  // ✅ 점검 항목 목록을 서버에서 불러오는 useEffect
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

  // ✅ 검색어 또는 카테고리로 필터링하는 useEffect
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

  // ✅ 로그인된 사용자라면 찜한 항목 불러오기
  useEffect(() => {
    if (userId) {
      axios.get(`/api/favorites/${userId}`)
        .then(res => setFavorites(res.data.map(f => f.inspection_item_id)))
        .catch(err => console.error('❌ 찜 목록 불러오기 실패:', err));
    }
  }, [userId]);

  // 찜 여부 확인
  const isFavorite = (id) => favorites.includes(id);

  // 찜 토글 함수
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

  const totalPages = Math.ceil(total / limit); // 총 페이지 수 계산

  return (
    <main className="inspection-container">
      <h2>🚗 차량 점검하기</h2>
      <p>점검 항목 검색과 카테고리 검색 가능해요!</p>

      {/* 검색 및 정렬 */}
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

        {/* 카테고리 버튼 및 통계 모달 버튼 */}
        <div className="quick-buttons">
          <button onClick={() => setCategory('기본점검')}>기본점검</button>
          <button onClick={() => setCategory('계절점검')}>계절점검</button>
          <button onClick={() => setCategory('장거리점검')}>장거리점검</button>
          <button onClick={() => setShowStats(true)}>통계 보기</button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* 점검 항목 카드 리스트 */}
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
                      e.stopPropagation();
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

      {/* 페이지네이션 */}
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

      {/* 상세 모달 */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <p><strong>카테고리:</strong> {selected.category}</p>
            <p><strong>추천 주기:</strong> {selected.recommended_cycle}</p>
            <p><strong>관련 부품:</strong> {selected.parts}</p>
            <p><strong>예상 비용:</strong> {selected.cost_range}</p>
            {selected.warning_light && (
              <p><strong>경고등:</strong> {selected.warning_light}</p>
            )}
            <p className="detail">{selected.detail}</p>
            <button onClick={() => setSelected(null)}>닫기</button>
          </div>
        </div>
      )}

      {/* 통계 모달 */}
      {showStats && <StatisticsModal onClose={() => setShowStats(false)} />}
    </main>
  );
}

export default Inspection;
