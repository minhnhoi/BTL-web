import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutTeam from "./pages/AboutTeam";

import Departments from "./pages/Department";
import Profile from "./pages/Profile";

import Employees from "./pages/Employees";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDetail from "./pages/EmployeeDetail";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";
import AccountApprovals from "./pages/AccountApprovals";
import { getLocalData } from "./utils/storage";

function getHomePath(role) {
  return role === "admin" ? "/dashboard" : "/attendance";
}

function HomeRedirect() {
  const currentUser = getLocalData("currentUser");
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={getHomePath(currentUser.role)} replace />;
}

function PrivatePage({ children, allowedRoles }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

const adminOnly = ["admin"];
const workPages = ["admin", "employee"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/dashboard"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <Dashboard />
            </PrivatePage>
          }
        />

        <Route
          path="/account-approvals"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <AccountApprovals />
            </PrivatePage>
          }
        />

        <Route
          path="/about-team"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <AboutTeam />
            </PrivatePage>
          }
        />

        <Route
          path="/departments"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <Departments />
            </PrivatePage>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivatePage allowedRoles={workPages}>
              <Profile />
            </PrivatePage>
          }
        />

        <Route
          path="/employees"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <Employees />
            </PrivatePage>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <EmployeeDetail />
            </PrivatePage>
          }
        />

        <Route
          path="/employee/:id"
          element={
            <PrivatePage allowedRoles={adminOnly}>
              <EmployeeDetail />
            </PrivatePage>
          }
        />

        <Route
          path="/attendance"
          element={
            <PrivatePage allowedRoles={workPages}>
              <Attendance />
            </PrivatePage>
          }
        />

        <Route
          path="/leave-request"
          element={
            <PrivatePage allowedRoles={workPages}>
              <LeaveRequests />
            </PrivatePage>
          }
        />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
