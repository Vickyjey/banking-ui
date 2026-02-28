import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateAccount from "./pages/CreateAccount";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Balance from "./pages/Balance";
import Deposit from "./pages/Deposit";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import Loan from "./pages/Loan";
import AdminSupportInbox from "./pages/AdminSupportInbox";
import AdminSupportConversation from "./pages/AdminSupportConversation";
import AdminLoans from "./pages/AdminLoans";
import { getAuth } from "./services/auth";

function App() {
  const auth = getAuth();
  const homeRoute = auth
    ? auth.role === "ADMIN"
      ? "/admin"
      : "/dashboard"
    : "/login";

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to={homeRoute} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-account"
          element={
            <ProtectedRoute>
              <CreateAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/balance"
          element={
            <ProtectedRoute>
              <Balance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminSupportInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support/:username"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminSupportConversation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLoans />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
