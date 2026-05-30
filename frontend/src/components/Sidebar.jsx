import { NavLink } from 'react-router-dom';
import { getLocalData } from '../utils/storage';

const adminMenuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Duyệt tài khoản', path: '/account-approvals' },
  { label: 'Nhân viên', path: '/employees' },
  { label: 'Phòng ban', path: '/departments' },
  { label: 'Chấm công', path: '/attendance' },
  { label: 'Nghỉ phép', path: '/leave-request' },
  { label: 'Hồ sơ cá nhân', path: '/profile' },
  { label: 'Giới thiệu nhóm', path: '/about-team' },
];

const employeeMenuItems = [
  { label: 'Chấm công', path: '/attendance' },
  { label: 'Xin nghỉ phép', path: '/leave-request' },
  { label: 'Hồ sơ cá nhân', path: '/profile' },
];

function Sidebar() {
  const currentUser = getLocalData('currentUser');
  const menuItems = currentUser?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div
      className="bg-light border-end"
      style={{ width: '200px', minHeight: '100vh' }}
    >
      <div className="px-3 pt-3 pb-2 text-muted fw-semibold" style={{ fontSize: '12px' }}>
        {currentUser?.role === 'admin' ? 'QUẢN TRỊ' : 'NHÂN VIÊN'}
      </div>

      <ul className="nav flex-column pt-1">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                'nav-link px-3 py-2' +
                (isActive
                  ? ' active bg-primary text-white'
                  : ' text-dark')
              }
              style={{ fontSize: '14px', borderRadius: 0 }}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
