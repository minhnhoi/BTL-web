import { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Tab,
  Nav,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { getLocalData, setLocalData } from "../utils/storage";
import api, { getApiError } from "../services/api";

const ACTIVITY_KEY = "userActivities";
function Profile() {
  const initialUser = getLocalData("currentUser") || {
    name: "Người dùng",
    username: "user",
    role: "employee",
    email: "",
    phone: "",
    department: "",
    avatar: null,
    bio: "",
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialUser);
  const [errors, setErrors] = useState({});
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwdErrors, setPwdErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [activities, setActivities] = useState(() => getLocalData(ACTIVITY_KEY) || []);
  const [activeTab, setActiveTab] = useState("info");
  const fileInputRef = useRef(null);

  const logActivity = async (text, icon = "📝") => {
    const entry = {
      id: Date.now(),
      text,
      icon,
      time: new Date().toISOString(),
    };
    const next = [entry, ...activities].slice(0, 30);
    setActivities(next);
    setLocalData(ACTIVITY_KEY, next);

    if (user.id) {
      try {
        await api.post(`/users/${user.id}/activities`, { text, icon });
      } catch (error) {
        console.error("Không thể ghi hoạt động:", error);
      }
    }
  };

  useEffect(() => {
    async function loadUserProfile() {
      if (!initialUser.id) return;
      try {
        const [{ data: freshUser }, { data: freshActivities }] = await Promise.all([
          api.get(`/users/${initialUser.id}`),
          api.get(`/users/${initialUser.id}/activities`),
        ]);
        setUser(freshUser);
        setForm(freshUser);
        setActivities(freshActivities);
        setLocalData("currentUser", freshUser);
        setLocalData(ACTIVITY_KEY, freshActivities);
      } catch (error) {
        console.error("Không thể tải hồ sơ từ MongoDB:", error);
      }
    }

    loadUserProfile();
  }, []);

  useEffect(() => {
    setLocalData("currentUser", user);
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const firstLetter = (user.name || user.username || "U")
    .charAt(0)
    .toUpperCase();

  const completion = useMemo(() => {
    const fields = ["name", "email", "phone", "department", "position", "bio", "avatar"];
    const done = fields.filter((f) => user[f]).length;
    return Math.round((done / fields.length) * 100);
  }, [user]);

  const startEdit = () => {
    setForm(user);
    setErrors({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setErrors({});
  };

  const validateProfile = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (form.phone && !/^[0-9+\-\s()]{6,20}$/.test(form.phone))
      e.phone = "Số điện thoại không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;

    try {
      if (user.id) {
        const { data } = await api.put(`/users/${user.id}/profile`, form);
        setUser(data);
        setForm(data);
        setLocalData("currentUser", data);
      } else {
        setUser(form);
      }
      setEditMode(false);
      logActivity("Đã cập nhật thông tin cá nhân", "✏️");
      setToast({ type: "success", msg: "Đã lưu thông tin thành công" });
    } catch (error) {
      setToast({ type: "danger", msg: getApiError(error, "Không thể lưu hồ sơ") });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ type: "danger", msg: "Vui lòng chọn file ảnh." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: "danger", msg: "Ảnh phải nhỏ hơn 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const updated = { ...user, avatar: ev.target.result };
      try {
        if (user.id) {
          const { data } = await api.put(`/users/${user.id}/profile`, updated);
          setUser(data);
          setForm((prev) => ({ ...prev, avatar: data.avatar }));
          setLocalData("currentUser", data);
        } else {
          setUser(updated);
          setForm((prev) => ({ ...prev, avatar: ev.target.result }));
        }
        logActivity("Đã cập nhật ảnh đại diện", "🖼️");
        setToast({ type: "success", msg: "Đã cập nhật ảnh đại diện" });
      } catch (error) {
        setToast({ type: "danger", msg: getApiError(error, "Không thể cập nhật ảnh") });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    const updated = { ...user, avatar: null };
    try {
      if (user.id) {
        const { data } = await api.put(`/users/${user.id}/profile`, updated);
        setUser(data);
        setLocalData("currentUser", data);
      } else {
        setUser(updated);
      }
      setForm((prev) => ({ ...prev, avatar: null }));
      logActivity("Đã xóa ảnh đại diện", "🗑️");
      setToast({ type: "info", msg: "Đã xóa ảnh đại diện" });
    } catch (error) {
      setToast({ type: "danger", msg: getApiError(error, "Không thể xóa ảnh") });
    }
  };

  const openPwdModal = () => {
    setPwdForm({ current: "", next: "", confirm: "" });
    setPwdErrors({});
    setShowPwdModal(true);
  };

  const savePassword = async () => {
    const e = {};
    if (!pwdForm.current) e.current = "Vui lòng nhập mật khẩu hiện tại";
    if (!pwdForm.next || pwdForm.next.length < 6)
      e.next = "Mật khẩu mới phải ≥ 6 ký tự";
    if (pwdForm.next !== pwdForm.confirm)
      e.confirm = "Mật khẩu xác nhận không khớp";
    setPwdErrors(e);
    if (Object.keys(e).length) return;

    try {
      if (user.id) {
        await api.put(`/users/${user.id}/password`, {
          currentPassword: pwdForm.current,
          newPassword: pwdForm.next,
        });
      }
      setShowPwdModal(false);
      logActivity("Đã đổi mật khẩu", "🔐");
      setToast({ type: "success", msg: "Đã đổi mật khẩu thành công" });
    } catch (error) {
      setPwdErrors({ current: getApiError(error, "Không thể đổi mật khẩu") });
    }
  };

  const pwdStrength = useMemo(() => {
    const p = pwdForm.next || "";
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"];
    const variants = [
      "danger",
      "danger",
      "warning",
      "info",
      "success",
      "success",
    ];
    return {
      score,
      percent: (score / 5) * 100,
      label: labels[score],
      variant: variants[score],
    };
  }, [pwdForm.next]);

  const clearActivities = async () => {
    if (window.confirm("Xóa toàn bộ lịch sử hoạt động?")) {
      try {
        if (user.id) await api.delete(`/users/${user.id}/activities`);
        setActivities([]);
        setLocalData(ACTIVITY_KEY, []);
        setToast({ type: "info", msg: "Đã xóa lịch sử hoạt động" });
      } catch (error) {
        setToast({ type: "danger", msg: getApiError(error, "Không thể xóa lịch sử") });
      }
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="mb-1">Hồ sơ cá nhân</h4>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Quản lý thông tin tài khoản và bảo mật của bạn.
          </p>
        </div>
        <div className="d-flex gap-2">
          {!editMode ? (
            <>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={openPwdModal}
                data-testid="change-password-btn"
              >
                🔐 Đổi mật khẩu
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={startEdit}
                data-testid="edit-profile-btn"
              >
                ✏️ Chỉnh sửa
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={cancelEdit}>
                Hủy
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={saveProfile}
                data-testid="save-profile-btn"
              >
                💾 Lưu
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                    }}
                    data-testid="profile-avatar"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto"
                    style={{
                      width: "110px",
                      height: "110px",
                      fontSize: "42px",
                    }}
                    data-testid="profile-avatar"
                  >
                    {firstLetter}
                  </div>
                )}
                <Button
                  variant="light"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle shadow-sm border"
                  style={{ width: "34px", height: "34px", padding: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Đổi ảnh"
                  data-testid="upload-avatar-btn"
                >
                  📷
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <h5 className="mb-1">{user.name || user.username}</h5>
              <Badge
                bg={user.role === "admin" ? "danger" : "primary"}
                className="mb-2"
              >
                {user.role === "admin" ? "👑 Quản trị viên" : "👤 Nhân viên"}
              </Badge>
              {user.department && (
                <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
                  🏢 {user.department}
                </p>
              )}
              {user.avatar && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger p-0"
                  onClick={removeAvatar}
                >
                  Xóa ảnh đại diện
                </Button>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-semibold" style={{ fontSize: "14px" }}>
                  Hoàn thiện hồ sơ
                </span>
                <span className="text-primary fw-bold">{completion}%</span>
              </div>
              <ProgressBar
                now={completion}
                variant={completion === 100 ? "success" : "primary"}
                style={{ height: "8px" }}
              />
              <p className="text-muted mb-0 mt-2" style={{ fontSize: "12px" }}>
                {completion === 100
                  ? "🎉 Hồ sơ của bạn đã đầy đủ!"
                  : "Cập nhật đầy đủ thông tin để hồ sơ chuyên nghiệp hơn."}
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <h6 className="mb-3" style={{ fontSize: "14px" }}>
                📊 Thống kê
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted" style={{ fontSize: "13px" }}>
                  Hoạt động gần đây
                </span>
                <strong>{activities.length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted" style={{ fontSize: "13px" }}>
                  Ngày tham gia
                </span>
                <strong style={{ fontSize: "13px" }}>
                  {user.joinedAt || "--"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <div className="card-header bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="info" data-testid="tab-info">
                      Thông tin
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="activity" data-testid="tab-activity">
                      Hoạt động{" "}
                      {activities.length > 0 && (
                        <Badge bg="secondary">{activities.length}</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
              <Tab.Content>
                <Tab.Pane eventKey="info">
                  <div className="card-body">
                    {!editMode ? (
                      <table className="table table-borderless mb-0">
                        <tbody>
                          {[
                            { label: "Họ tên", value: user.name || "--" },
                            {
                              label: "Tên đăng nhập",
                              value: user.username || "--",
                            },
                            {
                              label: "Vai trò",
                              value:
                                user.role === "admin"
                                  ? "Quản trị viên"
                                  : "Nhân viên",
                            },
                            {
                              label: "Email",
                              value: user.email || (
                                <span className="text-muted">
                                  Chưa cập nhật
                                </span>
                              ),
                            },
                            {
                              label: "Số điện thoại",
                              value: user.phone || (
                                <span className="text-muted">
                                  Chưa cập nhật
                                </span>
                              ),
                            },
                            {
                              label: "Phòng ban",
                              value: user.department || (
                                <span className="text-muted">
                                  Chưa cập nhật
                                </span>
                              ),
                            },
                            {
                              label: "Chức vụ",
                              value: user.position || (
                                <span className="text-muted">
                                  Chưa cập nhật
                                </span>
                              ),
                            },
                            {
                              label: "Giới thiệu",
                              value: user.bio || (
                                <span className="text-muted">
                                  Chưa cập nhật
                                </span>
                              ),
                            },
                          ].map((row) => (
                            <tr
                              key={row.label}
                              style={{ borderBottom: "1px solid #f0f0f0" }}
                            >
                              <th
                                style={{
                                  width: "180px",
                                  fontSize: "13px",
                                  color: "#6c757d",
                                  fontWeight: 500,
                                }}
                              >
                                {row.label}
                              </th>
                              <td style={{ fontSize: "14px" }}>{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <Form>
                        <div className="row g-3">
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Họ tên <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              value={form.name || ""}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              isInvalid={!!errors.name}
                              data-testid="input-name"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Tên đăng nhập
                            </Form.Label>
                            <Form.Control
                              value={form.username || ""}
                              disabled
                            />
                          </Form.Group>
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              value={form.email || ""}
                              onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                              }
                              isInvalid={!!errors.email}
                              placeholder="example@company.com"
                              data-testid="input-email"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Số điện thoại
                            </Form.Label>
                            <Form.Control
                              value={form.phone || ""}
                              onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                              }
                              isInvalid={!!errors.phone}
                              placeholder="0912 345 678"
                              data-testid="input-phone"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.phone}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Phòng ban
                            </Form.Label>
                            <Form.Control
                              value={form.department || ""}
                              onChange={(e) =>
                                setForm({ ...form, department: e.target.value })
                              }
                              placeholder="VD: Kỹ thuật"
                              disabled={user.role !== "admin"}
                              data-testid="input-department"
                            />
                            {user.role !== "admin" && (
                              <Form.Text className="text-muted">
                                Phòng ban do admin duyệt và quản lý.
                              </Form.Text>
                            )}
                          </Form.Group>
                          <Form.Group className="col-md-6">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Chức vụ
                            </Form.Label>
                            <Form.Control
                              value={form.position || ""}
                              onChange={(e) =>
                                setForm({ ...form, position: e.target.value })
                              }
                              placeholder="VD: Nhân viên"
                              disabled={user.role !== "admin"}
                              data-testid="input-position"
                            />
                            {user.role !== "admin" && (
                              <Form.Text className="text-muted">
                                Chức vụ do admin duyệt và quản lý.
                              </Form.Text>
                            )}
                          </Form.Group>
                          <Form.Group className="col-12">
                            <Form.Label
                              style={{ fontSize: "13px" }}
                              className="fw-semibold"
                            >
                              Giới thiệu bản thân
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={form.bio || ""}
                              onChange={(e) =>
                                setForm({ ...form, bio: e.target.value })
                              }
                              placeholder="Vài dòng giới thiệu về bản thân..."
                              maxLength={200}
                            />
                            <Form.Text className="text-muted">
                              {(form.bio || "").length}/200 ký tự
                            </Form.Text>
                          </Form.Group>
                        </div>
                      </Form>
                    )}
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="activity">
                  <div className="card-body">
                    {activities.length > 0 && (
                      <div className="d-flex justify-content-end mb-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={clearActivities}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    )}
                    {activities.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <div style={{ fontSize: "40px" }}>📭</div>
                        <p className="mb-0">Chưa có hoạt động nào.</p>
                      </div>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {activities.map((a) => (
                          <li
                            key={a.id}
                            className="d-flex align-items-start py-2"
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <span className="me-3" style={{ fontSize: "20px" }}>
                              {a.icon}
                            </span>
                            <div className="flex-grow-1">
                              <p className="mb-0" style={{ fontSize: "14px" }}>
                                {a.text}
                              </p>
                              <small className="text-muted">
                                {formatTime(a.time)}
                              </small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert alert-${toast.type} shadow`}
          style={{ zIndex: 1080, minWidth: "260px" }}
          data-testid="toast-notification"
        >
          {toast.msg}
        </div>
      )}

      <Modal show={showPwdModal} onHide={() => setShowPwdModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>
            🔐 Đổi mật khẩu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px" }} className="fw-semibold">
                Mật khẩu hiện tại
              </Form.Label>
              <Form.Control
                type="password"
                value={pwdForm.current}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, current: e.target.value })
                }
                isInvalid={!!pwdErrors.current}
                data-testid="input-current-password"
              />
              <Form.Control.Feedback type="invalid">
                {pwdErrors.current}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px" }} className="fw-semibold">
                Mật khẩu mới
              </Form.Label>
              <Form.Control
                type="password"
                value={pwdForm.next}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, next: e.target.value })
                }
                isInvalid={!!pwdErrors.next}
                data-testid="input-new-password"
              />
              <Form.Control.Feedback type="invalid">
                {pwdErrors.next}
              </Form.Control.Feedback>
              {pwdForm.next && (
                <div className="mt-2">
                  <ProgressBar
                    now={pwdStrength.percent}
                    variant={pwdStrength.variant}
                    style={{ height: "6px" }}
                  />
                  <small className={`text-${pwdStrength.variant}`}>
                    Độ mạnh: {pwdStrength.label}
                  </small>
                </div>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ fontSize: "14px" }} className="fw-semibold">
                Xác nhận mật khẩu mới
              </Form.Label>
              <Form.Control
                type="password"
                value={pwdForm.confirm}
                onChange={(e) =>
                  setPwdForm({ ...pwdForm, confirm: e.target.value })
                }
                isInvalid={!!pwdErrors.confirm}
                data-testid="input-confirm-password"
              />
              <Form.Control.Feedback type="invalid">
                {pwdErrors.confirm}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPwdModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={savePassword}
            data-testid="submit-password-btn"
          >
            Cập nhật mật khẩu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile;
