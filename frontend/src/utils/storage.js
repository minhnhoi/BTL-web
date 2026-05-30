// Lấy dữ liệu từ localStorage, nếu không có thì trả về defaultValue
export function getLocalData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
}

function notifyCurrentUserChanged(value = null) {
  try {
    window.dispatchEvent(new CustomEvent('authUserUpdated', { detail: value }));
  } catch (e) {
    // Bỏ qua nếu môi trường không hỗ trợ window.
  }
}

// Lưu dữ liệu vào localStorage
export function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === 'currentUser') notifyCurrentUserChanged(value);
  } catch (e) {
    console.error('Không thể lưu vào localStorage:', e);
  }
}

// Xóa dữ liệu khỏi localStorage theo key
export function removeLocalData(key) {
  try {
    localStorage.removeItem(key);
    if (key === 'currentUser') notifyCurrentUserChanged(null);
  } catch (e) {
    console.error('Không thể xóa khỏi localStorage:', e);
  }
}

export function saveAuthData(user, token) {
  setLocalData('currentUser', user);
  if (token) localStorage.setItem('authToken', token);
}

export function getAuthToken() {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    return null;
  }
}

export function clearAuthData() {
  removeLocalData('currentUser');
  try {
    localStorage.removeItem('authToken');
  } catch (e) {
    console.error('Không thể xóa token:', e);
  }
}
