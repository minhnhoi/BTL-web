import { useEffect, useMemo, useState } from 'react';
import api, { getApiError } from '../services/api';
import { getLocalData } from '../utils/storage';

function statusBadge(status) {
  if (status === 'Đã duyệt') return <span className="badge bg-success">{status}</span>;
  if (status === 'Chờ duyệt') return <span className="badge bg-warning text-dark">{status}</span>;
  if (status === 'Từ chối') return <span className="badge bg-danger">{status}</span>;
  return <span className="badge bg-secondary">{status}</span>;
}

function getTodayString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function calculateDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
}

function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  if (!dateString.includes('-')) return dateString;
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function LeaveRequests() {
  const currentUser = getLocalData('currentUser');
  const isAdmin = currentUser?.role === 'admin';
  const today = useMemo(() => getTodayString(), []);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'Nghỉ phép năm',
    from: today,
    to: today,
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const days = useMemo(() => calculateDays(form.from, form.to), [form.from, form.to]);

  async function loadLeaves() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/leave-requests');
      setLeaves(data);
    } catch (err) {
      console.error('Không thể tải đơn nghỉ phép:', err);
      setLeaves([]);
      setError(getApiError(err, 'Không thể tải đơn nghỉ phép.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.type || !form.from || !form.to) {
      setError('Vui lòng nhập đủ loại nghỉ, ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (new Date(form.to).getTime() < new Date(form.from).getTime()) {
      setError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/leave-requests', {
        ...form,
        days,
      });
      setLeaves((prev) => [data, ...prev]);
      setForm({ type: 'Nghỉ phép năm', from: today, to: today, reason: '' });
      setMessage('Gửi đơn xin nghỉ phép thành công. Vui lòng chờ admin duyệt.');
    } catch (err) {
      setError(getApiError(err, 'Không thể gửi đơn nghỉ phép.'));
    } finally {
      setSubmitting(false);
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/leave-requests/${id}/status`, { status });
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === id ? data : leave,
        ),
      );
    } catch (err) {
      alert(getApiError(err, 'Không thể cập nhật trạng thái nghỉ phép.'));
    }
  };

  const handleApprove = (id) => updateStatus(id, 'Đã duyệt');
  const handleReject = (id) => updateStatus(id, 'Từ chối');

  return (
    <div>
      <h4 className="mb-1">{isAdmin ? 'Nghỉ phép' : 'Xin nghỉ phép'}</h4>
      <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
        {isAdmin
          ? 'Admin xem, duyệt hoặc từ chối đơn xin nghỉ phép của nhân viên.'
          : 'Nhân viên chỉ được gửi đơn xin nghỉ phép và xem trạng thái đơn của chính mình.'}
      </p>

      {!isAdmin && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Tạo đơn xin nghỉ phép</h6>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Loại nghỉ</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    disabled={submitting}
                  >
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Nghỉ bệnh">Nghỉ bệnh</option>
                    <option value="Nghỉ không lương">Nghỉ không lương</option>
                    <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Từ ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.from}
                    onChange={(e) => setForm((prev) => ({ ...prev, from: e.target.value }))}
                    disabled={submitting}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Đến ngày</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.to}
                    onChange={(e) => setForm((prev) => ({ ...prev, to: e.target.value }))}
                    disabled={submitting}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Số ngày</label>
                  <input className="form-control" value={days} readOnly />
                </div>

                <div className="col-12">
                  <label className="form-label">Lý do</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.reason}
                    onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Nhập lý do xin nghỉ"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="mt-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi đơn xin nghỉ'}
                </button>
              </div>
            </form>
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
                <th>Nhân viên</th>
                <th>Loại nghỉ</th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Số ngày</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                {isAdmin && <th className="text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave, index) => (
                <tr key={leave.id || leave._id}>
                  <td>{index + 1}</td>
                  <td>{leave.name}</td>
                  <td>{leave.type}</td>
                  <td>{formatDateForDisplay(leave.from)}</td>
                  <td>{formatDateForDisplay(leave.to)}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>{statusBadge(leave.status)}</td>
                  {isAdmin && (
                    <td className="text-center">
                      {leave.status === 'Chờ duyệt' ? (
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(leave.id)}
                          >
                            Đồng ý
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleReject(leave.id)}
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="text-center text-muted py-3">
                    {loading ? 'Đang tải...' : 'Chưa có đơn nghỉ phép nào.'}
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

export default LeaveRequests;
