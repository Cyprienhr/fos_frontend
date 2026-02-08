import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserType } from './utils/auth';

// Import pages
import FarmerLogin from './pages/farmer/FarmerLogin';
import FarmerRegister from './pages/farmer/FarmerRegister';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

import './App.css';

const ProtectedRoute = ({ element, requiredRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/farmer-login" />;
  }

  if (requiredRole && getUserType() !== requiredRole) {
    return <Navigate to="/not-found" />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Farmer Routes */}
        <Route path="/farmer-login" element={<FarmerLogin />} />
        <Route path="/farmer-register" element={<FarmerRegister />} />
        <Route
          path="/farmer-dashboard"
          element={<ProtectedRoute element={<FarmerDashboard />} requiredRole="farmer" />}
        />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/farmer-login" />} />
        <Route path="/not-found" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
