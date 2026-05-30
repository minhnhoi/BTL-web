import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Badge,
  Dropdown,
} from "react-bootstrap";
import api, { getApiError } from "../services/api";

const emptyForm = {
  id: null,
  name: "",
  manager: "",
  count: 0,
  description: "",
  color: "#0d6efd",
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setLoading(true);
    try {
      const { data } = await api.get("/departments");
      setDepartments(data);
    } catch (error) {
      console.error("Không thể tải phòng ban:", error);
      setToast({ type: "danger", msg: "Không thể tải dữ liệu phòng ban từ MongoDB" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = departments.filter(
      (d) =>
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.manager.toLowerCase().includes(term) ||
        (d.description || "").toLowerCase().includes(term),
    );

    const sorters = {
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      "count-asc": (a, b) => a.count - b.count,
      "count-desc": (a, b) => b.count - a.count,
    };
    return [...list].sort(sorters[sortBy] || sorters["name-asc"]);
  }, [departments, search, sortBy]);

  const stats = useMemo(() => {
    const totalDept = departments.length;
    const totalEmp = departments.reduce(
      (sum, d) => sum + Number(d.count || 0),
      0,
    );
    const avg = totalDept ? (totalEmp / totalDept).toFixed(1) : 0;
    const biggest = departments.reduce(
      (max, d) => (d.count > (max?.count || 0) ? d : max),
      null,
    );
    return { totalDept, totalEmp, avg, biggest };
  }, [departments]);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setForm({ ...dept });
    setErrors({});
    setShowModal(true);
  };

  const openMembers = async (dept) => {
    setSelectedDepartment(dept);
    setMembers([]);
    setShowMembersModal(true);
    setMembersLoading(true);

    try {
      const { data } = await api.get(`/departments/${dept.id}/employees`);
      const total = Number(data.total || 0);
      setMembers(data.employees || []);
      setDepartments((prev) =>
        prev.map((item) =>
          item.id === dept.id ? { ...item, count: total } : item,
        ),
      );
      setSelectedDepartment((current) =>
        current ? { ...current, count: total } : current,
      );
    } catch (error) {
      setToast({
        type: "danger",
        msg: getApiError(error, "Không thể tải danh sách thành viên"),
      });
    } finally {
      setMembersLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập tên phòng ban";
    if (!form.manager.trim()) e.manager = "Vui lòng nhập tên trưởng phòng";
    if (form.count < 0 || form.count === "") e.count = "Số lượng phải >= 0";
    if (
      departments.some(
        (d) =>
          d.name.toLowerCase() === form.name.trim().toLowerCase() &&
          d.id !== form.id,
      )
    ) {
      e.name = "Tên phòng ban đã tồn tại";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (form.id) {
        const { data } = await api.put(`/departments/${form.id}`, {
          ...form,
          count: Number(form.count),
        });
        setDepartments((prev) =>
          prev.map((d) => (d.id === form.id ? data : d)),
        );
        setToast({ type: "success", msg: `Đã cập nhật "${form.name}"` });
      } else {
        const { data } = await api.post("/departments", {
          ...form,
          count: Number(form.count) || 0,
        });
        setDepartments((prev) => [...prev, data]);
        setToast({ type: "success", msg: `Đã thêm "${form.name}"` });
      }
      setShowModal(false);
    } catch (error) {
      setToast({ type: "danger", msg: getApiError(error, "Không thể lưu phòng ban") });
    }
  };

  const handleDelete = async () => {
    const dept = departments.find((d) => d.id === deleteId);
    try {
      await api.delete(`/departments/${deleteId}`);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      if (dept) setToast({ type: "danger", msg: `Đã xóa "${dept.name}"` });
    } catch (error) {
      setToast({ type: "danger", msg: getApiError(error, "Không thể xóa phòng ban") });
    }
  };

  const handleExportCSV = () => {
    const header = [
      "ID",
      "Tên phòng ban",
      "Trưởng phòng",
      "Số nhân viên",
      "Mô tả",
      "Ngày tạo",
    ];
    const rows = departments.map((d) => [
      d.id,
      d.name,
      d.manager,
      d.count,
      d.description,
      d.createdAt,
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phong-ban-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ type: "info", msg: "Đã xuất file CSV" });
  };


  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="mb-1">Phòng ban</h4>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Quản lý danh sách các phòng ban trong công ty. Nhấn vào phòng ban để xem thành viên.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleExportCSV}
            data-testid="export-csv-btn"
          >
            <i className="bi bi-download me-1" />⬇ Xuất CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAdd}
            data-testid="add-department-btn"
          >
            + Thêm phòng ban
          </Button>
        </div>
      </div>

      {loading && (
        <div className="alert alert-info py-2" style={{ fontSize: "13px" }}>
          Đang tải dữ liệu từ MongoDB...
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                TỔNG PHÒNG BAN
              </p>
              <h4 className="mb-0 text-primary" data-testid="stat-total-dept">
                {stats.totalDept}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                TỔNG NHÂN VIÊN
              </p>
              <h4 className="mb-0 text-success" data-testid="stat-total-emp">
                {stats.totalEmp}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                TRUNG BÌNH / PHÒNG
              </p>
              <h4 className="mb-0 text-info">{stats.avg}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                PHÒNG LỚN NHẤT
              </p>
              <h6
                className="mb-0 text-dark text-truncate"
                title={stats.biggest?.name}
              >
                {stats.biggest?.name || "--"}
              </h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên, trưởng phòng, mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="search-input"
                />
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </div>
            <div className="col-md-4">
              <Form.Select
                size="sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                data-testid="sort-select"
              >
                <option value="name-asc">Tên A → Z</option>
                <option value="name-desc">Tên Z → A</option>
                <option value="count-desc">Nhân viên: nhiều → ít</option>
                <option value="count-asc">Nhân viên: ít → nhiều</option>
              </Form.Select>
            </div>
            <div className="col-md-2 d-flex justify-content-end">
              <div className="btn-group btn-group-sm" role="group">
                <Button
                  variant={
                    viewMode === "grid" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("grid")}
                  data-testid="view-grid-btn"
                >
                  ▦
                </Button>
                <Button
                  variant={
                    viewMode === "list" ? "primary" : "outline-secondary"
                  }
                  onClick={() => setViewMode("list")}
                  data-testid="view-list-btn"
                >
                  ☰
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-2" style={{ fontSize: "15px" }}>
              {search
                ? `Không tìm thấy kết quả cho "${search}"`
                : "Chưa có phòng ban nào"}
            </p>
            {!search && (
              <Button variant="primary" size="sm" onClick={openAdd}>
                + Tạo phòng ban đầu tiên
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="row g-3" data-testid="dept-grid">
          {filtered.map((dept) => (
            <div key={dept.id} className="col-md-6 col-xl-4">
              <div
                className="card h-100 border-0 shadow-sm position-relative"
                role="button"
                tabIndex={0}
                onClick={() => openMembers(dept)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMembers(dept);
                  }
                }}
                data-testid={`members-btn-${dept.id}`}
                style={{
                  cursor: "pointer",
                  borderLeft: `4px solid ${dept.color} !important`,
                  borderLeftWidth: "4px",
                  borderLeftStyle: "solid",
                  borderLeftColor: dept.color,
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0 fw-bold">{dept.name}</h6>
                    <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                      <Dropdown.Toggle
                        as="button"
                        className="btn btn-sm btn-link text-muted p-0 border-0"
                        style={{ boxShadow: "none" }}
                      >
                        ⋮
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => openEdit(dept)}
                          data-testid={`edit-btn-${dept.id}`}
                        >
                          ✏️ Sửa
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => {
                            setDeleteId(dept.id);
                            setShowDeleteModal(true);
                          }}
                          data-testid={`delete-btn-${dept.id}`}
                        >
                          🗑️ Xóa
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <p
                    className="text-muted mb-2"
                    style={{ fontSize: "13px", minHeight: "36px" }}
                  >
                    {dept.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        TRƯỞNG PHÒNG
                      </p>
                      <p
                        className="mb-0 fw-semibold"
                        style={{ fontSize: "13px" }}
                      >
                        {dept.manager}
                      </p>
                    </div>
                    <Badge
                      bg=""
                      style={{ backgroundColor: dept.color, fontSize: "12px" }}
                    >
                      👥 {dept.count}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr style={{ fontSize: "13px" }}>
                  <th>Phòng ban</th>
                  <th>Trưởng phòng</th>
                  <th>Số NV</th>
                  <th>Ngày tạo</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept) => (
                  <tr
                    key={dept.id}
                    style={{ fontSize: "14px", cursor: "pointer" }}
                    onClick={() => openMembers(dept)}
                    data-testid={`members-row-${dept.id}`}
                  >
                    <td>
                      <div className="d-flex align-items-center">
                        <span
                          className="rounded-circle me-2"
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: dept.color,
                            display: "inline-block",
                          }}
                        />
                        <div>
                          <div className="fw-semibold">{dept.name}</div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                          >
                            {dept.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{dept.manager}</td>
                    <td>
                      <Badge bg="primary">{dept.count}</Badge>
                    </td>
                    <td className="text-muted" style={{ fontSize: "13px" }}>
                      {dept.createdAt}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(dept);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteId(dept.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type} shadow`}
          style={{ zIndex: 1080, minWidth: "260px" }}
          data-testid="toast-notification"
        >
          {toast.msg}
        </div>
      )}

      <Modal
        show={showMembersModal}
        onHide={() => setShowMembersModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>
            👥 Thành viên phòng {selectedDepartment?.name || ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="fw-semibold">{selectedDepartment?.manager || "--"}</div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                Trưởng phòng
              </div>
            </div>
            <Badge
              bg=""
              style={{
                backgroundColor: selectedDepartment?.color || "#0d6efd",
                fontSize: "13px",
              }}
            >
              {members.length} thành viên
            </Badge>
          </div>

          {membersLoading ? (
            <div className="text-center text-muted py-5">
              Đang tải danh sách thành viên...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center text-muted py-5 border rounded">
              Phòng ban này chưa có thành viên được duyệt.
            </div>
          ) : (
            <div className="table-responsive border rounded">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: "13px" }}>
                    <th>Nhân viên</th>
                    <th>Chức vụ</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              width="38"
                              height="38"
                              className="rounded-circle object-fit-cover border"
                            />
                          ) : (
                            <span
                              className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: "38px",
                                height: "38px",
                                backgroundColor: selectedDepartment?.color || "#0d6efd",
                              }}
                            >
                              {(member.name || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <div className="fw-semibold">{member.name}</div>
                            <div className="text-muted" style={{ fontSize: "12px" }}>
                              Mã NV: {member.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{member.position || "--"}</td>
                      <td style={{ fontSize: "13px" }}>
                        <div>{member.email || "--"}</div>
                        <div className="text-muted">{member.phone || "--"}</div>
                      </td>
                      <td>
                        <Badge bg={member.status === "Đang làm" ? "success" : "secondary"}>
                          {member.status || "Đang làm"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMembersModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>
            {form.id ? "✏️ Chỉnh sửa phòng ban" : "+ Thêm phòng ban mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: "14px" }}>
                Tên phòng ban <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                isInvalid={!!errors.name}
                placeholder="VD: Kinh doanh"
                data-testid="form-name-input"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ fontSize: "14px" }}>
                Trưởng phòng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                isInvalid={!!errors.manager}
                placeholder="VD: Nguyễn Văn A"
                data-testid="form-manager-input"
              />
              <Form.Control.Feedback type="invalid">
                {errors.manager}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "14px" }}
                >
                  Số nhân viên
                </Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.count}
                  onChange={(e) => setForm({ ...form, count: e.target.value })}
                  isInvalid={!!errors.count}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.count}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "14px" }}
                >
                  Màu nhãn
                </Form.Label>
                <Form.Control
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  style={{ height: "38px" }}
                />
              </Form.Group>
            </div>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold" style={{ fontSize: "14px" }}>
                Mô tả
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Mô tả ngắn về chức năng của phòng ban..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            data-testid="form-submit-btn"
          >
            {form.id ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <Modal.Body className="text-center py-4">
          <div style={{ fontSize: "36px" }}>⚠️</div>
          <h6 className="mt-2">Xác nhận xóa</h6>
          <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa phòng ban này? Hành động không thể hoàn tác.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              data-testid="confirm-delete-btn"
            >
              Xóa
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Departments;
