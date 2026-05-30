const departments = [
  {
    id: 1,
    name: 'Kỹ thuật',
    manager: 'Nguyễn Văn An',
    count: 8,
    description: 'Phụ trách phát triển phần mềm và hạ tầng kỹ thuật.',
    color: '#0d6efd',
    createdAtText: '2024-01-15',
  },
  {
    id: 2,
    name: 'Marketing',
    manager: 'Trần Thị Bình',
    count: 5,
    description: 'Chịu trách nhiệm truyền thông và quảng bá thương hiệu.',
    color: '#d63384',
    createdAtText: '2024-02-10',
  },
  {
    id: 3,
    name: 'Kế toán',
    manager: 'Lê Văn Cường',
    count: 4,
    description: 'Quản lý tài chính và báo cáo kế toán.',
    color: '#198754',
    createdAtText: '2024-01-20',
  },
  {
    id: 4,
    name: 'Nhân sự',
    manager: 'Phạm Thị Dung',
    count: 3,
    description: 'Tuyển dụng, đào tạo và quản lý nhân viên.',
    color: '#fd7e14',
    createdAtText: '2024-03-05',
  },
  {
    id: 5,
    name: 'Hành chính',
    manager: 'Hoàng Văn Em',
    count: 4,
    description: 'Hỗ trợ hành chính và quản lý văn phòng.',
    color: '#6f42c1',
    createdAtText: '2024-02-25',
  },
];

const employees = [
  { id: 1, name: 'Nguyễn Văn An', department: 'Kỹ thuật', position: 'Lập trình viên', status: 'Đang làm', email: 'an.nv@hrm.com', phone: '0901234567', joinDate: '01/03/2022' },
  { id: 2, name: 'Trần Thị Bình', department: 'Marketing', position: 'Chuyên viên', status: 'Đang làm', email: 'binh.tt@hrm.com', phone: '0902345678', joinDate: '15/06/2021' },
  { id: 3, name: 'Lê Văn Cường', department: 'Kế toán', position: 'Kế toán viên', status: 'Nghỉ phép', email: 'cuong.lv@hrm.com', phone: '0903456789', joinDate: '10/01/2020' },
  { id: 4, name: 'Phạm Thị Dung', department: 'Nhân sự', position: 'Chuyên viên HR', status: 'Đang làm', email: 'dung.pt@hrm.com', phone: '0904567890', joinDate: '20/09/2023' },
  { id: 5, name: 'Hoàng Văn Em', department: 'Kỹ thuật', position: 'Kỹ sư', status: 'Đang làm', email: 'em.hv@hrm.com', phone: '0905678901', joinDate: '05/04/2022' },
  { id: 6, userId: 2, name: 'Trần Thị Nhân Viên', department: 'Nhân sự', position: 'Nhân viên', status: 'Đang làm', email: 'nhanvien@hrm.com', phone: '0911111111', joinDate: '01/05/2026', avatar: null },
];

const attendance = [
  { id: 1, name: 'Phạm Thị Dung', date: '2026-05-22', checkIn: '07:55', checkOut: '17:05', status: 'Đúng giờ' },
  { id: 2, name: 'Nguyễn Văn An', date: '2026-05-22', checkIn: '08:02', checkOut: '17:10', status: 'Đúng giờ' },
  { id: 3, name: 'Lê Văn Cường', date: '2026-05-22', checkIn: '--', checkOut: '--', status: 'Nghỉ phép' },
  { id: 4, name: 'Trần Thị Bình', date: '2026-05-22', checkIn: '08:45', checkOut: '17:00', status: 'Đi muộn' },
  { id: 5, name: 'Phạm Thị Dung', date: '2026-05-21', checkIn: '--', checkOut: '--', status: 'Nghỉ phép' },
  { id: 6, name: 'Nguyễn Văn An', date: '2026-05-21', checkIn: '08:00', checkOut: '17:00', status: 'Đúng giờ' },
  { id: 7, name: 'Lê Văn Cường', date: '2026-05-21', checkIn: '09:10', checkOut: '17:30', status: 'Đi muộn' },
  { id: 8, name: 'Trần Thị Bình', date: '2026-05-21', checkIn: '07:50', checkOut: '17:15', status: 'Đúng giờ' },
  { id: 9, name: 'Phạm Thị Dung', date: '2026-05-20', checkIn: '08:05', checkOut: '17:02', status: 'Đúng giờ' },
  { id: 10, name: 'Nguyễn Văn An', date: '2026-05-20', checkIn: '08:30', checkOut: '17:00', status: 'Đi muộn' },
  { id: 11, name: 'Lê Văn Cường', date: '2026-05-20', checkIn: '07:45', checkOut: '17:00', status: 'Đúng giờ' },
  { id: 12, name: 'Trần Thị Bình', date: '2026-05-20', checkIn: '--', checkOut: '--', status: 'Nghỉ phép' },
];

const leaveRequests = [
  { id: 1, name: 'Nguyễn Văn An', type: 'Nghỉ phép năm', from: '20/05/2026', to: '22/05/2026', days: 3, reason: 'Việc gia đình', status: 'Đã duyệt' },
  { id: 2, name: 'Trần Thị Bình', type: 'Nghỉ bệnh', from: '21/05/2026', to: '21/05/2026', days: 1, reason: 'Khám bệnh', status: 'Chờ duyệt' },
  { id: 3, name: 'Hoàng Văn Em', type: 'Nghỉ không lương', from: '25/05/2026', to: '27/05/2026', days: 3, reason: 'Du lịch cá nhân', status: 'Từ chối' },
  { id: 4, name: 'Phạm Thị Dung', type: 'Nghỉ phép năm', from: '01/06/2026', to: '03/06/2026', days: 3, reason: 'Nghỉ hè', status: 'Chờ duyệt' },
];

const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: 'Admin',
    role: 'admin',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    email: 'admin@hrm.com',
    phone: '0900000000',
    department: 'Ban quản trị',
    bio: 'Quản trị viên hệ thống HRM.',
    avatar: null,
  },
  {
    id: 2,
    username: 'nhanvien',
    password: '123456',
    name: 'Trần Thị Nhân Viên',
    role: 'employee',
    approvalStatus: 'approved',
    approvedAt: new Date(),
    email: 'nhanvien@hrm.com',
    phone: '0911111111',
    department: 'Nhân sự',
    position: 'Nhân viên',
    employeeId: 6,
    bio: 'Nhân viên sử dụng hệ thống.',
    avatar: null,
  },
];

const activities = [
  { userId: 1, text: 'Đăng nhập hệ thống', icon: '🔑', time: new Date().toISOString() },
  { userId: 1, text: 'Dữ liệu mẫu đã được khởi tạo từ MongoDB', icon: '🗄️', time: new Date().toISOString() },
];

module.exports = { departments, employees, attendance, leaveRequests, users, activities };
