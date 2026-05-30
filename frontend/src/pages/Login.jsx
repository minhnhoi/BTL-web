import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { saveAuthData } from '../utils/storage';
import api, { getApiError } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      saveAuthData(data.user, data.token);

      const defaultPath = data.user?.role === 'admin' ? '/dashboard' : '/attendance';
      const fromPath = location.state?.from;
      const employeeAllowedPaths = ['/attendance', '/leave-request', '/profile'];
      const nextPath = data.user?.role === 'employee'
        ? (employeeAllowedPaths.includes(fromPath) ? fromPath : defaultPath)
        : (fromPath || defaultPath);

      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Đăng nhập thất bại.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light d-flex align-items-center justify-content-center px-3" style={{ minHeight: '100vh' }}>
      <div className="col-xl-3 col-lg-4 col-md-5 col-sm-8 col-12">
        <div className="card border-0 shadow" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="card-body p-4">
            <h4 className="fw-bold text-center mb-1">Đăng nhập</h4>
            <p className="text-muted text-center mb-4" style={{ fontSize: '13px' }}>
              Nhập tài khoản và mật khẩu để vào hệ thống
            </p>

            {error && (
              <div className="alert alert-danger py-2" style={{ fontSize: '13px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                  Tài khoản
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản"
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                  Mật khẩu
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="text-center mt-3" style={{ fontSize: '13px' }}>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="fw-semibold text-decoration-none">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
