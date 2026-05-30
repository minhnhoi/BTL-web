import { useEffect, useState } from 'react';
import { getLocalData } from '../utils/storage';
import api from '../services/api';

const defaultStats = [
  { label: 'Tổng nhân viên', value: '0', colorClass: 'text-primary' },
  { label: 'Phòng ban', value: '0', colorClass: 'text-success' },
  { label: 'Đang nghỉ phép', value: '0', colorClass: 'text-warning' },
  { label: 'Chấm công hôm nay', value: '0', colorClass: 'text-purple' },
];

function Dashboard() {
  const currentUser = getLocalData('currentUser');
  const name = currentUser ? currentUser.name || currentUser.username : 'bạn';
  const [stats, setStats] = useState(defaultStats);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.stats || defaultStats);
        setRecentActivity(data.recentActivity || []);
      } catch (error) {
        console.error('Không thể tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div>
      <h4 className="mb-1">Dashboard</h4>
      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        Xin chào, <strong>{name}</strong>! Đây là tổng quan hệ thống.
      </p>

      {loading && (
        <div className="alert alert-info py-2" style={{ fontSize: '13px' }}>
          Đang tải dữ liệu từ MongoDB...
        </div>
      )}

      {/* Thẻ thống kê */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="col-sm-6 col-md-3">
            <div className="card h-100">
              <div className="card-body">
                <p className="text-muted mb-1" style={{ fontSize: '13px' }}>{stat.label}</p>
                <p className={`fw-bold mb-0 fs-3 ${stat.colorClass}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hoạt động gần đây */}
      <div className="card">
        <div className="card-header bg-white fw-semibold">Hoạt động gần đây</div>
        <ul className="list-group list-group-flush">
          {recentActivity.map((item, i) => (
            <li key={i} className="list-group-item" style={{ fontSize: '14px' }}>
              {item}
            </li>
          ))}
          {recentActivity.length === 0 && (
            <li className="list-group-item text-muted" style={{ fontSize: '14px' }}>
              Chưa có hoạt động nào.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
