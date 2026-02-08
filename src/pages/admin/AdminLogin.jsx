import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setAuthToken } from '../../utils/auth';
import '../farmer/Auth.css';

export default function AdminLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || !otp) {
      setError('Phone number and OTP are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.adminLogin(phoneNumber, otp);
      const { token, user } = response.data;
      setAuthToken(token, user);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 Admin Login</h1>
        <p className="subtitle">Farmer Ordering System Administration</p>

        {error && <div className="error-message">{error}</div>}

        <div className="alert alert-info">
          <strong>Demo Credentials:</strong>
          <p>Phone: 25078815000</p>
          <p>OTP: 0001</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter admin phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="4"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Farmer? <Link to="/farmer-login">Farmer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
