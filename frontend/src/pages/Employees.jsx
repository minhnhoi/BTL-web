import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function statusBadge(status) {
  if (status === 'Đang làm') return <span className="badge bg-success">{status}</span>;
  if (status === 'Nghỉ phép') return <span className="badge bg-warning text-dark">{status}</span>;
  return <span className="badge bg-secondary">{status}</span>;
}

function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const { data } = await api.get('/employees');
        setEmployees(data);
      } catch (error) {
        console.error('Không thể tải danh sách nhân viên:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h4 className="mb-1">Nhân viên</h4>
      <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
        Danh sách toàn bộ nhân viên trong hệ thống.
      </p>

      {/* Tìm kiếm */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên hoặc phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="alert alert-info py-2" style={{ fontSize: '13px' }}>
          Đang tải dữ liệu từ MongoDB...
        </div>
      )}

      {/* Bảng nhân viên */}
      <div className="card">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, index) => (
                <tr key={emp.id}>
                  <td>{index + 1}</td>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>{statusBadge(emp.status)}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    {loading ? 'Đang tải...' : 'Không tìm thấy nhân viên nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Employees;
