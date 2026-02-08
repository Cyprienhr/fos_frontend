import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setAuthToken } from '../../utils/auth';
import './Auth.css';

export default function FarmerLogin() {
  const [step, setStep] = useState('phone'); // phone or otp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); // Store OTP from response
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-dismiss error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.requestOTP(phoneNumber);
      setGeneratedOtp(response.data.otp); // Store OTP from response
      setStep('otp');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phoneNumber, otp);
      const { token, user } = response.data;
      setAuthToken(token, user);
      navigate('/farmer-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Farmer Login</h1>
        <p className="subtitle">Welcome to Farmer Ordering System</p>

        {error && <div className="error-message">{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <small>Format: +250 or 25078815000</small>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit}>
            {generatedOtp && (
              <div className="alert-info">
                <strong>✓ Your OTP (for testing):</strong>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#667eea', margin: '8px 0' }}>
                  {generatedOtp}
                </p>
                <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>
                  Copy this OTP and paste it below. In production, this would be sent via SMS.
                </p>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="4"
                disabled={loading}
              />
              <small>Check your SMS or use the OTP sent to {phoneNumber}</small>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setGeneratedOtp('');
              }}
              className="btn-secondary"
            >
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/farmer-register">Register here</Link>
          </p>
          <p>
            Admin? <Link to="/admin-login">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
