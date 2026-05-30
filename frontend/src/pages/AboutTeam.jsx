const members = [
  {
    id: 1,
    name: "Lê Trọng Hiếu",
    studentId: "B23DVCN051",
    tasks: [
      "Xây dựng khung hệ thống, cấu hình route và layout chung.",
      "Phụ trách Header, Sidebar, ProtectedRoute và xử lý lưu phiên người dùng.",
      "Tạo thêm trang Giới thiệu nhóm và tổng hợp source code.",
    ],
  },
  {
    id: 2,
    name: "Bùi Thị Khánh Uyên",
    studentId: "B23DVCN175",
    tasks: [
      "Xây dựng chức năng đăng nhập.",
      "Xây dựng trang Dashboard thống kê tổng quan.",
      "Hiển thị thông tin tổng quan về nhân viên, phòng ban và đơn nghỉ phép.",
    ],
  },
  {
    id: 3,
    name: "Nguyễn Tiến Hiếu",
    studentId: "B23DVCN055",
    tasks: [
      "Xây dựng module Quản lý nhân viên.",
      "Thực hiện chức năng thêm, sửa, xóa, tìm kiếm và lọc nhân viên.",
      "Xây dựng trang xem chi tiết thông tin nhân viên.",
    ],
  },
  {
    id: 4,
    name: "Phạm Quang Minh",
    studentId: "B23DVCN107",
    tasks: [
      "Xây dựng module Quản lý phòng ban.",
      "Thực hiện chức năng thêm, sửa, xóa, tìm kiếm và lọc phòng ban.",
      "Xây dựng trang Hồ sơ cá nhân và chức năng cập nhật thông tin người dùng.",
    ],
  },
  {
    id: 5,
    name: "Phạm Ngọc Minh Hoàng",
    studentId: "B23DVCN059",
    tasks: [
      "Xây dựng module Chấm công.",
      "Xây dựng module Quản lý nghỉ phép.",
      "Thực hiện chức năng tạo, sửa, xóa, duyệt và từ chối đơn nghỉ phép.",
    ],
  },
];

const assignments = [
  {
    id: 1,
    name: "Lê Trọng Hiếu",
    studentId: "B23DVCN051",
    files: [
      "App.js",
      "index.js",
      "Layout.jsx",
      "Header.jsx",
      "Sidebar.jsx",
      "ProtectedRoute.jsx",
      "storage.js",
      "AboutTeam.jsx",
    ],
    content:
      "Xây dựng khung hệ thống, điều hướng, layout chung, bảo vệ route, xử lý lưu phiên người dùng và trang giới thiệu nhóm.",
  },
  {
    id: 2,
    name: "Bùi Thị Khánh Uyên",
    studentId: "B23DVCN175",
    files: ["Login.jsx", "Dashboard.jsx"],
    content:
      "Xây dựng chức năng đăng nhập và trang dashboard thống kê tổng quan.",
  },
  {
    id: 3,
    name: "Nguyễn Tiến Hiếu",
    studentId: "B23DVCN055",
    files: ["Employees.jsx", "EmployeeDetail.jsx"],
    content: "Xây dựng module quản lý nhân viên và trang chi tiết nhân viên.",
  },
  {
    id: 4,
    name: "Phạm Quang Minh",
    studentId: "B23DVCN107",
    files: ["Departments.jsx", "Profile.jsx"],
    content: "Xây dựng module quản lý phòng ban và hồ sơ cá nhân.",
  },
  {
    id: 5,
    name: "Phạm Ngọc Minh Hoàng",
    studentId: "B23DVCN059",
    files: ["Attendance.jsx", "LeaveRequests.jsx"],
    content: "Xây dựng module chấm công và quản lý nghỉ phép.",
  },
  {
    id: 6,
    name: "Toàn bộ nhóm",
    studentId: "---",
    files: ["Backend API", "MongoDB", "Tích hợp hệ thống"],
    content: [
      "Vì backend khá phức tạp nên cả nhóm cùng trao đổi và thống nhất hướng xây dựng backend chứ không chia ra như phần frontend. ",
      "Các thành viên phối hợp xây dựng backend API, kết nối cơ sở dữ liệu MongoDB, xử lý dữ liệu, tích hợp với frontend và test hệ thống. ",
      "A,B,C phụ trách tổng hợp ý kiến của nhóm, tích hợp các phần backend, tích hợp các ý kiến sửa lỗi từ mọi người và cập nhật source code backend lên GitHub.",
    ],
  },
];

function AboutTeam() {
  return (
    <div>
      <h4 className="mb-1">Giới thiệu nhóm thực hiện</h4>

      <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
        Đây là nhóm sinh viên thực hiện project HRM System - Website quản lý
        nhân sự công ty.
      </p>

      {/* Thông tin project */}
      <div className="card mb-4">
        <div className="card-header bg-white fw-semibold">
          Thông tin project
        </div>

        <div className="card-body p-0">
          <table className="table table-bordered mb-0">
            <tbody>
              {[
                {
                  label: "Tên project",
                  value: "HRM System",
                },
                {
                  label: "Chủ đề",
                  value: "Website quản lý nhân sự công ty",
                },
                {
                  label: "Công nghệ sử dụng",
                  value: "ReactJS, JavaScript, MongoDB",
                },
                {
                  label: "Hình thức dữ liệu",
                  value: "Dữ liệu lưu trong MongoDB thông qua backend API",
                },
              ].map((row) => (
                <tr key={row.label}>
                  <th
                    className="table-light"
                    style={{ width: "220px", fontSize: "14px" }}
                  >
                    {row.label}
                  </th>

                  <td style={{ fontSize: "14px" }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danh sách thành viên */}
      <h6 className="mb-3">Danh sách thành viên</h6>

      <div className="row g-3 mb-4">
        {members.map((member) => (
          <div key={member.id} className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: "36px",
                      height: "36px",
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {member.id}
                  </div>

                  <div>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "15px" }}
                    >
                      {member.name}
                    </p>

                    <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                      {member.studentId}
                    </p>
                  </div>
                </div>

                <ul className="mb-0 ps-3">
                  {member.tasks.map((task, index) => (
                    <li
                      key={index}
                      className="text-muted"
                      style={{ fontSize: "13px" }}
                    >
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng phân công */}
      <h6 className="mb-3">Phân công công việc</h6>

      <div className="card">
        <div className="card-body p-0">
          <table className="table table-bordered mb-0">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Thành viên</th>
                <th>Mã sinh viên</th>
                <th>File phụ trách</th>
                <th>Nội dung công việc</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} style={{ verticalAlign: "top" }}>
                  <td>{assignment.id}</td>

                  <td className="fw-semibold">{assignment.name}</td>

                  <td>{assignment.studentId}</td>

                  <td style={{ fontSize: "13px" }}>
                    {assignment.files.map((file, index) => (
                      <span key={index} className="d-block">
                        {file}
                      </span>
                    ))}
                  </td>

                  <td style={{ fontSize: "13px" }}>{assignment.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AboutTeam;
