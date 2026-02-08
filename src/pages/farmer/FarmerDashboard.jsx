import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../services/api';
import { logout, getUser, formatDate } from '../../utils/auth';
import './FarmerDashboard.css';

export default function FarmerDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('orders'); // orders or new-order
  const [orders, setOrders] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [selectedFertilizer, setSelectedFertilizer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Auto-dismiss error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/farmer-login');
      return;
    }
    setUser(currentUser);
    fetchOrders();
    fetchFertilizers();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getMyOrders();
      setOrders(response.data.orders);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFertilizers = async () => {
    try {
      const response = await farmerAPI.getFertilizers();
      setFertilizers(response.data.fertilizers);
    } catch (err) {
      console.error('Failed to fetch fertilizers', err);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFertilizer) {
      setError('Please select a fertilizer');
      return;
    }

    try {
      setLoading(true);
      const response = await farmerAPI.submitOrder(selectedFertilizer);
      setSuccess('Order submitted successfully!');
      setSelectedFertilizer('');
      setTimeout(() => {
        setTab('orders');
        fetchOrders();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/farmer-login');
  };

  const getStatusColor = (status) => {
    return {
      pending: '#ffc107',
      approved: '#28a745',
      declined: '#dc3545'
    }[status] || '#6c757d';
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h2>🌾 Farmer Dashboard</h2>
          <div className="navbar-right">
            {user && <span className="user-info">{user.fullName}</span>}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="user-card">
            <h3>{user?.fullName}</h3>
            <p>Phone: {user?.phoneNumber}</p>
            <p>Land Area: {user?.landArea} hectares</p>
          </div>

          <div className="nav-menu">
            <button
              className={`nav-item ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => setTab('orders')}
            >
              📋 My Orders
            </button>
            <button
              className={`nav-item ${tab === 'new-order' ? 'active' : ''}`}
              onClick={() => setTab('new-order')}
            >
              ➕ New Order
            </button>
          </div>
        </div>

        <div className="main-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {tab === 'orders' && (
            <div className="section">
              <h2>My Orders</h2>
              {loading ? (
                <p className="loading">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="empty-state">No orders yet. Create your first order!</p>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Fertilizer</th>
                        <th>Quantity (kg)</th>
                        <th>Rate/Hectare</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.fertilizer}</td>
                          <td>{order.quantity.toFixed(2)}</td>
                          <td>{order.ratePerUnit}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{order.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'new-order' && (
            <div className="section">
              <h2>Submit New Order</h2>
              <form onSubmit={handleSubmitOrder} className="order-form">
                <div className="form-info">
                  <p>
                    <strong>Your Land Area:</strong> {user?.landArea} hectares
                  </p>
                  <p>
                    <strong>Note:</strong> System will automatically calculate
                    required quantity based on your land area and selected fertilizer rate.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="fertilizer">Select Fertilizer</label>
                  <select
                    id="fertilizer"
                    value={selectedFertilizer}
                    onChange={(e) => setSelectedFertilizer(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choose a fertilizer --</option>
                    {fertilizers.map(fert => (
                      <option key={fert.id} value={fert.id}>
                        {fert.name} ({fert.ratePerHectare} {fert.unit}/hectare)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFertilizer && (
                  <div className="calculation-preview">
                    {fertilizers.map(fert => {
                      if (fert.id === selectedFertilizer) {
                        const quantity = user?.landArea * fert.ratePerHectare;
                        return (
                          <div key={fert.id} className="preview-box">
                            <h3>Order Calculation:</h3>
                            <p>Land Area: {user?.landArea} hectares</p>
                            <p>Rate: {fert.ratePerHectare} {fert.unit}/hectare</p>
                            <p className="total">
                              <strong>Total Required: {quantity.toFixed(2)} {fert.unit}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                <button type="submit" disabled={loading || !selectedFertilizer}>
                  {loading ? 'Submitting...' : 'Submit Order'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
