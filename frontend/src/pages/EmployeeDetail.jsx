import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadEmployee() {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmployee(data);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [id]);

  if (loading) {
    return (
      <div>
        <button className="btn btn-link p-0 mb-3" onClick={() => navigate('/employees')}>
          ← Quay lại
        </button>
        <p className="text-muted">Đang tải dữ liệu nhân viên...</p>
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <div>
        <button className="btn btn-link p-0 mb-3" onClick={() => navigate('/employees')}>
          ← Quay lại
        </button>
        <p className="text-muted">Không tìm thấy nhân viên.</p>
      </div>
    );
  }

  const rows = [
    { label: 'Họ tên', value: employee.name },
    { label: 'Phòng ban', value: employee.department },
    { label: 'Chức vụ', value: employee.position },
    { label: 'Trạng thái', value: employee.status },
    { label: 'Email', value: employee.email },
    { label: 'Số điện thoại', value: employee.phone },
    { label: 'Ngày vào làm', value: employee.joinDate },
  ];

  return (
    <div>
      <button className="btn btn-link p-0 mb-3" onClick={() => navigate('/employees')}>
        ← Quay lại danh sách
      </button>

      <h4 className="mb-1">Chi tiết nhân viên</h4>
      <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
        Thông tin chi tiết của nhân viên #{id}
      </p>

      <div className="card" style={{ maxWidth: '520px' }}>
        <div className="card-body">
          <table className="table table-bordered mb-0">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th className="table-light" style={{ width: '160px', fontSize: '14px' }}>
                    {row.label}
                  </th>
                  <td style={{ fontSize: '14px' }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;
