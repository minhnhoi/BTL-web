import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalData, clearAuthData, getAuthToken, setLocalData } from '../utils/storage';
import api from '../services/api';

function Header() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getLocalData('currentUser'));

  useEffect(() => {
    function refreshUser() {
      setCurrentUser(getLocalData('currentUser'));
    }

    window.addEventListener('authUserUpdated', refreshUser);
    window.addEventListener('storage', refreshUser);

    async function loadFreshUser() {
      if (!getAuthToken()) return;
      try {
        const { data } = await api.get('/auth/me');
        setLocalData('currentUser', data);
        setCurrentUser(data);
      } catch (error) {
        console.error('Không thể tải thông tin người dùng mới nhất:', error);
      }
    }

    loadFreshUser();

    return () => {
      window.removeEventListener('authUserUpdated', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  const userName = currentUser ? currentUser.name || currentUser.username || 'User' : 'User';
  const roleLabel = currentUser?.role === 'admin' ? 'Admin' : 'Nhân viên';
  const firstLetter = userName.charAt(0).toUpperCase();

  function handleLogout() {
    clearAuthData();
    navigate('/login', { replace: true });
  }

  return (
    <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-white border-bottom">
      <span className="fw-bold text-primary fs-5">HRM System</span>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="border-0 bg-transparent p-0"
          onClick={() => navigate('/profile')}
          title="Mở hồ sơ cá nhân"
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="Avatar"
              className="rounded-circle border"
              style={{ width: '32px', height: '32px', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}
            >
              {firstLetter}
            </div>
          )}
        </button>

        <div className="d-none d-sm-block lh-sm">
          <div className="text-secondary" style={{ fontSize: '14px' }}>{userName}</div>
          <div className="text-muted" style={{ fontSize: '11px' }}>{roleLabel}</div>
        </div>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Header;
