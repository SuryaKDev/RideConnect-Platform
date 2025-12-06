import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/driver/DriverDashboard';
import PostRide from './pages/driver/PostRide';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import MyBookings from './pages/passenger/MyBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="container">Access Denied</div>; // Or redirect to their dashboard
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-ride"
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <PostRide />
              </ProtectedRoute>
            }
          />

          <Route
            path="/passenger-dashboard"
            element={
              <ProtectedRoute allowedRoles={['PASSENGER']}>
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['PASSENGER']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
