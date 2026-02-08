import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setAuthToken } from '../../utils/auth';
import './Auth.css';

export default function FarmerRegister() {
  const [step, setStep] = useState('details'); // details or otp
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    landArea: '',
    email: ''
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.phoneNumber || !formData.fullName || !formData.landArea) {
      setError('Phone number, name, and land area are required');
      return;
    }

    if (isNaN(parseFloat(formData.landArea)) || parseFloat(formData.landArea) <= 0) {
      setError('Please enter a valid land area in hectares');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.registerFarmer(formData);
      
      // Check if token is provided (auto-login in development)
      if (response.data.token) {
        setAuthToken(response.data.token, response.data.user);
        navigate('/farmer-dashboard');
      } else {
        // Fall back to OTP verification if no token
        setGeneratedOtp(response.data.otp);
        setStep('otp');
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      const response = await authAPI.verifyOTP(formData.phoneNumber, otp);
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
        <h1>Farmer Registration</h1>
        <p className="subtitle">Create your account</p>

        {error && <div className="error-message">{error}</div>}

        {step === 'details' ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="landArea">Land Area (Hectares)</label>
              <input
                id="landArea"
                name="landArea"
                type="number"
                step="0.1"
                placeholder="e.g., 2.5"
                value={formData.landArea}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
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
              <label htmlFor="otp">Verify OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="4"
                disabled={loading}
              />
              <small>Check your SMS for the OTP sent to {formData.phoneNumber}</small>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('details');
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
            Already have an account? <Link to="/farmer-login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
