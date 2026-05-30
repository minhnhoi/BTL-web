import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../services/api';

const fallbackDepartments = ['Kỹ thuật', 'Marketing', 'Kế toán', 'Nhân sự', 'Hành chính'];
const fallbackPositions = ['Nhân viên', 'Thực tập sinh', 'Chuyên viên', 'Kỹ thuật viên', 'Lập trình viên'];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: 'Nhân viên',
    bio: '',
  });
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [positions, setPositions] = useState(fallbackPositions);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const { data } = await api.get('/auth/register-options');
        const departmentNames = (data.departments || []).map((item) => item.name).filter(Boolean);
        if (departmentNames.length > 0) setDepartments(departmentNames);
        if ((data.positions || []).length > 0) setPositions(data.positions);
      } catch (err) {
        console.error('Không thể tải phòng ban đăng ký:', err);
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    if (!form.department && departments.length > 0) {
      setForm((prev) => ({ ...prev, department: departments[0] }));
    }
  }, [departments, form.department]);

  const canSubmit = useMemo(() => {
    return form.username.trim() && form.password && form.confirmPassword && form.name.trim() && form.department;
  }, [form]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim() || !form.password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    if (!form.name.trim()) {
      setError('Vui lòng nhập họ tên nhân viên.');
      return;
    }

    if (!form.department) {
      setError('Vui lòng chọn phòng ban.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        position: form.position.trim() || 'Nhân viên',
        bio: form.bio.trim(),
      });

      setSuccess(data.message || 'Đăng ký thành công. Vui lòng chờ admin duyệt.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(getApiError(err, 'Không thể đăng ký tài khoản.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light d-flex align-items-center justify-content-center px-3 py-4" style={{ minHeight: '100vh' }}>
      <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-12">
        <div className="card border-0 shadow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-body p-4">
            <h4 className="fw-bold text-center mb-1">Đăng ký tài khoản nhân viên</h4>
            <p className="text-muted text-center mb-4" style={{ fontSize: '13px' }}>
              Nhập thông tin cá nhân. Sau khi admin duyệt, dữ liệu sẽ tự thêm vào danh sách nhân viên đúng phòng ban.
            </p>

            {error && (
              <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success py-2" style={{ fontSize: '13px' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Tài khoản <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="VD: nguyenvana"
                    disabled={loading || !!success}
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Họ tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    disabled={loading || !!success}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    disabled={loading || !!success}
                    autoComplete="new-password"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Nhập lại mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    disabled={loading || !!success}
                    autoComplete="new-password"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@company.com"
                    disabled={loading || !!success}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="0912 345 678"
                    disabled={loading || !!success}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Phòng ban <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    disabled={loading || !!success}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Chức vụ
                  </label>
                  <select
                    className="form-select"
                    value={form.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    disabled={loading || !!success}
                  >
                    {positions.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                    Ghi chú / giới thiệu
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="VD: ứng viên phòng Kỹ thuật, ca hành chính..."
                    disabled={loading || !!success}
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="form-check my-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  id="showRegisterPassword"
                  disabled={loading || !!success}
                />
                <label className="form-check-label" htmlFor="showRegisterPassword" style={{ fontSize: '13px' }}>
                  Hiện mật khẩu
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading || !!success || !canSubmit}>
                {loading ? 'Đang gửi đăng ký...' : 'Đăng ký chờ admin duyệt'}
              </button>
            </form>

            <div className="text-center mt-3" style={{ fontSize: '13px' }}>
              Đã có tài khoản?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
