import { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './StatisticsModal.css';

// Chart.js에 사용할 요소들 등록
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement, Tooltip, Legend);

const StatisticsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0); // 현재 선택된 탭 상태

  // 계절별 미점검 사고 건수 데이터 (Line Chart)
  const seasonalAccidentData = {
    labels: ['봄', '여름', '장마', '가을', '겨울', '한파'],
    datasets: [
      {
        label: '미점검 사고 건수',
        data: [15, 30, 40, 22, 50, 35],
        fill: false,
        borderColor: '#ff6b6b',
        tension: 0.3,
        pointBackgroundColor: '#ff6b6b',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#ff0000',
      },
    ],
  };

  const seasonalAccidentOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const labels = [
              '봄 - 미세먼지로 인한 에어컨 고장',
              '여름 - 타이어 파열 사고',
              '장마 - 브레이크 고장 사고',
              '가을 - 타이어 마모 사고',
              '겨울 - 배터리 방전 사고',
              '한파 - 냉각수 부족 사고',
            ];
            return labels[index];
          },
        },
      },
    },
  };

  // 가성비 인기 차량 순위 데이터 (Bar Chart)
  const popularCarData = {
    labels: ['아반떼', 'K3', '스파크', 'XM3', '캐스퍼', '레이', '베뉴', '티볼리', '코나', '트레일블레이저'],
    datasets: [
      {
        label: '가성비 차량 순위',
        data: [35, 30, 28, 26, 24, 22, 20, 18, 17, 15],
        backgroundColor: '#ffa07a',
        hoverBackgroundColor: '#ff7043',
      },
    ],
  };

  const popularCarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const car = context.label;
            const preferences = {
              아반떼: '20대 선호도 45%',
              K3: '30대 선호도 40%',
              스파크: '60대 선호도 38%',
              XM3: '30~40대 선호도 35%',
              캐스퍼: '여성 운전자 선호도 42%',
              레이: '초보 운전자 선호도 47%',
              베뉴: '1인 가구 선호도 36%',
              티볼리: '대학생 선호도 32%',
              코나: '직장인 선호도 41%',
              트레일블레이저: '패밀리카 선호도 38%',
            };
            return `${car}: ${preferences[car]}`;
          },
        },
      },
    },
  };

  // 평균 점검 비용 데이터 (Doughnut Chart)
  const costData = {
    labels: ['엔진오일', '타이어', '브레이크 패드', '와이퍼', '에어컨 필터'],
    datasets: [
      {
        data: [40000, 250000, 80000, 15000, 30000],
        backgroundColor: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const item = context.label;
            const value = context.raw;
            if (typeof value !== 'number') return `${item}: 데이터 없음`;
            return `${item}: ₩${value.toLocaleString()}원`;
          },
        },
      },
    },
  };

  // 사용자들이 자주 검색한 점검 항목 (Bar Chart)
  const commonItemsData = {
    labels: ['냉각수 보충', '배터리 교체', '타이어 점검', '에어컨 점검', '브레이크 점검'],
    datasets: [
      {
        label: '사용자 선택률(%)',
        data: [45, 38, 34, 29, 22],
        backgroundColor: '#A0CED9',
      },
    ],
  };

  const commonItemsOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label;
            const value = context.raw;
            if (typeof value !== 'number') return `${label}: 데이터 없음`;
            return `${label}: ${value}% 선택`;
          },
        },
      },
    },
  };

  return (
    <div className="statistics-modal-overlay">
      <div className="statistics-modal">
        {/* 모달 상단 */}
        <div className="modal-header">
          <h2>차량 점검 통계</h2>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="tab-buttons">
          <button className={activeTab === 0 ? 'active' : ''} onClick={() => setActiveTab(0)}>
            계절별 사고
          </button>
          <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>
            차량 인기순위
          </button>
          <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>
            평균 점검 비용
          </button>
          <button className={activeTab === 3 ? 'active' : ''} onClick={() => setActiveTab(3)}>
            자주 검색된 항목
          </button>
        </div>

        {/* 차트 영역 */}
        {activeTab !== 2 && (
          <div className="chart-area">
            {activeTab === 0 && <Line data={seasonalAccidentData} options={seasonalAccidentOptions} />}
            {activeTab === 1 && <Bar data={popularCarData} options={popularCarOptions} />}
            {activeTab === 3 && <Bar data={commonItemsData} options={commonItemsOptions} />}
          </div>
        )}

        {/* 도넛 차트 영역 */}
        {activeTab === 2 && (
          <div className="doughnut-area">
            <Doughnut data={costData} options={doughnutOptions} />
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
              ※ 차량 종류 및 모델에 따라 실제 점검 비용은 상이할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsModal;
