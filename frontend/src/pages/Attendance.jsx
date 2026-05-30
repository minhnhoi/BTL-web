import { useEffect, useMemo, useState } from 'react';
import api, { getApiError } from '../services/api';
import { getLocalData } from '../utils/storage';

function statusBadge(status) {
  if (status === 'Đúng giờ') return <span className="badge bg-success">{status}</span>;
  if (status === 'Đi muộn') return <span className="badge bg-warning text-dark">{status}</span>;
  if (status === 'Nghỉ phép') return <span className="badge bg-secondary">{status}</span>;
  if (status === 'Chưa chấm công') return <span className="badge bg-info text-dark">{status}</span>;
  return <span className="badge bg-danger">{status}</span>;
}

function getTodayString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  if (!dateString.includes('-')) return dateString;
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function Attendance() {
  const currentUser = getLocalData('currentUser');
  const isAdmin = currentUser?.role === 'admin';
  const today = useMemo(() => getTodayString(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  async function loadAttendance(date) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/attendance', { params: { date } });
      setAttendance(data);
    } catch (err) {
      console.error('Không thể tải dữ liệu chấm công:', err);
      setAttendance([]);
      setError(getApiError(err, 'Không thể tải dữ liệu chấm công.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/attendance/check-in', { date: today });
      setSelectedDate(today);
      setAttendance([data]);
      setMessage('Chấm công vào thành công.');
    } catch (err) {
      setError(getApiError(err, 'Không thể chấm công vào.'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/attendance/check-out', { date: today });
      setSelectedDate(today);
      setAttendance([data]);
      setMessage('Chấm công ra thành công.');
    } catch (err) {
      setError(getApiError(err, 'Không thể chấm công ra.'));
    } finally {
      setActionLoading(false);
    }
  }

  const todayRecord = attendance.find((row) => row.date === today) || null;
  const hasCheckedIn = !!todayRecord && todayRecord.checkIn && todayRecord.checkIn !== '--';
  const hasCheckedOut = !!todayRecord && todayRecord.checkOut && todayRecord.checkOut !== '--';

  return (
    <div>
      <h4 className="mb-1">{isAdmin ? 'Chấm công' : 'Chấm công nhân viên'}</h4>
      <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
        {isAdmin
          ? 'Admin xem danh sách chấm công của toàn bộ nhân viên.'
          : 'Nhân viên chỉ được chấm công và xem lịch sử chấm công của chính mình.'}
      </p>

      {!isAdmin && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <div className="fw-semibold">Hôm nay: {formatDateForDisplay(today)}</div>
                <div className="text-muted" style={{ fontSize: '13px' }}>
                  {todayRecord
                    ? `Giờ vào: ${todayRecord.checkIn || '--'} | Giờ ra: ${todayRecord.checkOut || '--'}`
                    : 'Bạn chưa chấm công hôm nay.'}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleCheckIn}
                  disabled={actionLoading || hasCheckedIn}
                >
                  {hasCheckedIn ? 'Đã chấm công vào' : 'Chấm công vào'}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleCheckOut}
                  disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
                >
                  {hasCheckedOut ? 'Đã chấm công ra' : 'Chấm công ra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-success py-2" style={{ fontSize: '13px' }}>
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 text-nowrap">Ngày:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="alert alert-info py-2" style={{ fontSize: '13px' }}>
          Đang tải dữ liệu từ MongoDB...
        </div>
      )}

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-bordered table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((row, index) => (
                  <tr key={row.id || row._id}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{formatDateForDisplay(row.date)}</td>
                    <td>{row.checkIn || '--'}</td>
                    <td>{row.checkOut || '--'}</td>
                    <td>{statusBadge(row.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {loading ? 'Đang tải...' : 'Không có dữ liệu chấm công cho ngày này.'}
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

export default Attendance;
