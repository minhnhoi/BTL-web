import { useEffect, useState } from 'react';
import api, { getApiError } from '../services/api';
import { getLocalData } from '../utils/storage';

function getStatusBadge(status) {
  if (status === 'approved') return <span className="badge bg-success">Đã duyệt</span>;
  if (status === 'rejected') return <span className="badge bg-danger">Đã từ chối</span>;
  return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
}

function AccountApprovals() {
  const currentUser = getLocalData('currentUser');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadUsers() {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(getApiError(err, 'Không thể tải danh sách tài khoản.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function approveUser(user) {
    setActionLoading(user.id);
    setMessage('');
    setError('');
    try {
      const { data } = await api.patch(`/users/${user.id}/approve`);
      setMessage(data.message || 'Đã duyệt tài khoản và thêm vào danh sách nhân viên.');
      await loadUsers();
    } catch (err) {
      setError(getApiError(err, 'Không thể duyệt tài khoản.'));
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectUser(user) {
    const reason = window.prompt('Nhập lý do từ chối tài khoản:', 'Không đủ điều kiện tạo tài khoản.');
    if (reason === null) return;

    setActionLoading(user.id);
    setMessage('');
    setError('');
    try {
      const { data } = await api.patch(`/users/${user.id}/reject`, { reason });
      setMessage(data.message || 'Đã từ chối tài khoản.');
      await loadUsers();
    } catch (err) {
      setError(getApiError(err, 'Không thể từ chối tài khoản.'));
    } finally {
      setActionLoading(null);
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="alert alert-danger">
        Chỉ tài khoản admin mới được duyệt tài khoản đăng ký mới.
      </div>
    );
  }

  const pendingUsers = users.filter((user) => user.approvalStatus === 'pending');
  const otherUsers = users.filter((user) => user.approvalStatus !== 'pending');

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="fw-bold mb-1">Duyệt tài khoản</h4>
          <div className="text-muted" style={{ fontSize: '14px' }}>
            Khi bấm duyệt, hệ thống tự tạo nhân viên theo đúng phòng ban/chức vụ người dùng đã đăng ký.
          </div>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadUsers} disabled={loading}>
          Tải lại
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white fw-semibold">
          Tài khoản chờ duyệt ({pendingUsers.length})
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-3 text-muted">Đang tải...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-3 text-muted">Không có tài khoản nào đang chờ duyệt.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tài khoản</th>
                    <th>Thông tin nhân viên</th>
                    <th>Phòng ban</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng ký</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="fw-semibold">{user.username}</td>
                      <td>
                        <div className="fw-semibold">{user.name || '-'}</div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>
                          {user.email || 'Chưa có email'} {user.phone ? `• ${user.phone}` : ''}
                        </div>
                      </td>
                      <td>
                        <div>{user.department || 'Chưa chọn'}</div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>{user.position || 'Nhân viên'}</div>
                      </td>
                      <td>{getStatusBadge(user.approvalStatus)}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm me-2"
                          disabled={actionLoading === user.id}
                          onClick={() => approveUser(user)}
                        >
                          {actionLoading === user.id ? 'Đang xử lý...' : 'Duyệt'}
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={actionLoading === user.id}
                          onClick={() => rejectUser(user)}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white fw-semibold">Tài khoản khác</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tài khoản</th>
                  <th>Họ tên</th>
                  <th>Quyền</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th>Lý do từ chối</th>
                </tr>
              </thead>
              <tbody>
                {otherUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-semibold">{user.username}</td>
                    <td>{user.name || '-'}</td>
                    <td>{user.role === 'admin' ? 'Admin' : 'Nhân viên'}</td>
                    <td>
                      {user.department || '-'}
                      {user.employeeId && <span className="badge bg-light text-dark ms-2">NV #{user.employeeId}</span>}
                    </td>
                    <td>{getStatusBadge(user.approvalStatus)}</td>
                    <td className="text-muted">{user.rejectReason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountApprovals;
