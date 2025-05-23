import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Inspection.css';

function Inspection() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('title_asc');
  const [favorites, setFavorites] = useState([]);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.toLowerCase() || '';

  const user = JSON.parse(localStorage.getItem('car_user'));
  const userId = user?.id || null;

  const limit = 10;

  useEffect(() => {
    const params = {
      page,
      limit,
      sort,
      ...(category && { category }),
    };
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

  useEffect(() => {
    let temp = [...items];
    if (keyword) {
      temp = temp.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.summary?.toLowerCase().includes(keyword) ||
        item.parts?.toLowerCase().includes(keyword)
      );
    } else if (search.trim()) {
      temp = temp.filter(item =>
        item.title.includes(search) || item.summary.includes(search)
      );
    }
    setFiltered(temp);
  }, [search, items, keyword]);

  useEffect(() => {
    if (userId) {
      axios.get(`/api/favorites/${userId}`)
        .then(res => setFavorites(res.data.map(f => f.inspection_item_id)))
        .catch(err => console.error('❌ 찜 목록 불러오기 실패:', err));
    }
  }, [userId]);

  const isFavorite = (itemId) => favorites.includes(itemId);

  const toggleFavorite = (itemId) => {
    if (!userId) return alert('로그인 후 사용 가능합니다');
    if (isFavorite(itemId)) {
      axios.delete(`/api/favorites/${itemId}`, { params: { user_id: userId } })
        .then(() => setFavorites(favorites.filter(id => id !== itemId)))
        .catch(err => console.error('❌ 찜 해제 실패:', err));
    } else {
      axios.post('/api/favorites', { user_id: userId, inspection_item_id: itemId })
        .then(() => setFavorites([...favorites, itemId]))
        .catch(err => console.error('❌ 찜 추가 실패:', err));
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="inspection-container">
      <h2>🚗 차량 점검하기</h2>
      <p>점검 항목을 검색하거나 카테고리를 선택해보세요.</p>

      <div className="inspection-controls">
        <input
          type="text"
          placeholder="점검 항목 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="category-buttons">
          {['기본점검', '계절점검', '장거리점검'].map(cat => (
            <button
              key={cat}
              className={category === cat ? 'active' : ''}
              onClick={() => setCategory(category === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <label>정렬: </label>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="title_asc">항목이름(가나다순)</option>
            <option value="title_desc">항목이름(역순)</option>
            <option value="category_asc">점검 유형(ㄱ-ㅎ순)</option>
            <option value="category_desc">점검 유형 (ㅎ-ㄱ순)</option>
          </select>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

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
    </main>
  );
}

export default Inspection;
