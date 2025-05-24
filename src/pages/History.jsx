import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/history.css';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [carNumber, setCarNumber] = useState('');
  const [form, setForm] = useState({
    date: '',
    inspection_type: '',
    shop_name: '',
    note: ''
  });
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const saved = localStorage.getItem('car_user');
    if (!saved) {
      alert('로그인 후 이용해주세요!');
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed.carNumber) {
        alert('차량 정보가 없습니다.');
        navigate('/');
        return;
      }

      setCarNumber(parsed.carNumber);
      loadHistory(parsed.carNumber);
    } catch (e) {
      console.error('car_user 파싱 오류:', e);
      navigate('/');
    }
  }, [navigate]);

  const loadHistory = (carNum) => {
    fetch(`${baseUrl}/api/history/car/${carNum}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('비정상 응답:', data);
          setHistory([]);
          return;
        }

        const unique = [];
        const map = new Map();
        data.forEach(item => {
          const key = `${item.inspection_type}-${item.date}`;
          if (!map.has(key)) {
            map.set(key, true);
            unique.push(item);
          }
        });

        setHistory(unique);
      })
      .catch(err => {
        console.error('이력 불러오기 실패:', err);
        setHistory([]);
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.inspection_type) return;

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${baseUrl}/api/history/${editId}`
      : `${baseUrl}/api/history`;

    const body = editId
      ? { ...form }
      : { car_number: carNumber, ...form };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(() => {
      setForm({ date: '', inspection_type: '', shop_name: '', note: '' });
      setEditId(null);
      loadHistory(carNumber);
    });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      date: item.date ? item.date.slice(0, 10) : '',
      inspection_type: item.inspection_type || '',
      shop_name: item.shop_name || '',
      note: item.note || ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      fetch(`${baseUrl}/api/history/${id}`, {
        method: 'DELETE'
      }).then(() => loadHistory(carNumber));
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    return sortNewest
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  const filteredHistory = sortedHistory.filter(item =>
    (item.inspection_type || '').includes(searchText) ||
    (item.shop_name || '').includes(searchText) ||
    (item.note || '').includes(searchText)
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="history-container">
      <h2>정비 이력</h2>

      <form className="history-form" onSubmit={handleSubmit}>
        <p className="mobile-hint">📅 점검일을 선택해주세요</p>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="inspection_type"
          placeholder="점검 항목"
          value={form.inspection_type}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="shop_name"
          placeholder="정비소 이름"
          value={form.shop_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="note"
          placeholder="메모"
          value={form.note}
          onChange={handleChange}
        />
        <button type="submit">{editId ? '수정' : '등록'}</button>
      </form>

      <div className="history-controls">
        <input
          type="text"
          placeholder="점검 항목, 정비소, 메모 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={() => setSortNewest(!sortNewest)}>
          {sortNewest ? '최신순' : '과거순'} 보기 전환
        </button>
      </div>

      {currentItems.length === 0 ? (
        <p>조건에 맞는 이력이 없습니다.</p>
      ) : (
        <ul className="timeline-list">
          {currentItems.map(item => (
            <li key={item.id} className="timeline-item">
              <div className="timeline-date">{item.date?.slice(0, 10)}</div>
              <div className="timeline-content">
                <strong>{item.inspection_type}</strong> - {item.shop_name}<br />
                <span className="note">{item.note}</span>
                <div className="timeline-actions">
                  <button onClick={() => handleEdit(item)}>수정</button>
                  <button onClick={() => handleDelete(item.id)}>삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>이전</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>다음</button>
        </div>
      )}
    </main>
  );
}

export default History;
