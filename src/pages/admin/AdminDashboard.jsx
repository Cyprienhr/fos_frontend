import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { adminAPI } from '../../services/api';
import { logout, getUser, formatDate } from '../../utils/auth';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [newFertilizer, setNewFertilizer] = useState({
    name: '',
    ratePerHectare: '',
    unit: 'kg',
    description: ''
  });
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
    if (!currentUser || currentUser.userType !== 'admin') {
      navigate('/admin-login');
      return;
    }
    setUser(currentUser);
    fetchMetrics();
    fetchOrders();
    fetchFertilizers();
  }, [navigate, filterStatus]);

  const fetchMetrics = async () => {
    try {
      const response = await adminAPI.getMetrics();
      setMetrics(response.data.metrics);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders(filterStatus, currentPage);
      setOrders(response.data.orders);
      setError('');
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFertilizers = async () => {
    try {
      const response = await adminAPI.getFertilizers();
      setFertilizers(response.data.fertilizers);
    } catch (err) {
      console.error('Failed to fetch fertilizers', err);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      setLoading(true);
      await adminAPI.approveOrder(orderId, remarks);
      setSuccess('Order approved successfully!');
      setSelectedOrder(null);
      setRemarks('');
      fetchOrders();
      fetchMetrics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    if (!remarks.trim()) {
      setError('Please provide remarks for declining');
      return;
    }
    try {
      setLoading(true);
      await adminAPI.declineOrder(orderId, remarks);
      setSuccess('Order declined successfully!');
      setSelectedOrder(null);
      setRemarks('');
      fetchOrders();
      fetchMetrics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline order');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFertilizer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newFertilizer.name || !newFertilizer.ratePerHectare) {
      setError('Name and rate are required');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.addFertilizer(newFertilizer);
      setSuccess('Fertilizer added successfully!');
      setNewFertilizer({ name: '', ratePerHectare: '', unit: 'kg', description: '' });
      fetchFertilizers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add fertilizer');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const chartData = metrics ? [
    { name: 'Approved', value: metrics.approvedOrders },
    { name: 'Declined', value: metrics.declinedOrders },
    { name: 'Pending', value: metrics.pendingOrders }
  ] : [];

  const COLORS = ['#28a745', '#dc3545', '#ffc107'];

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <div className="navbar-content">
          <h2>⚙️ Admin Dashboard</h2>
          <div className="navbar-right">
            {user && <span className="user-info">{user.fullName}</span>}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="nav-menu">
            <button
              className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-item ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => setTab('orders')}
            >
              📋 Manage Orders
            </button>
            <button
              className={`nav-item ${tab === 'fertilizers' ? 'active' : ''}`}
              onClick={() => setTab('fertilizers')}
            >
              🌾 Fertilizer Rates
            </button>
          </div>
        </div>

        <div className="admin-main">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {tab === 'dashboard' && (
            <div className="section">
              <h2>Dashboard Overview</h2>

              {metrics && (
                <>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <h3>Total Orders</h3>
                      <p className="metric-value">{metrics.totalOrders}</p>
                    </div>
                    <div className="metric-card approved">
                      <h3>Approved</h3>
                      <p className="metric-value">{metrics.approvedOrders}</p>
                    </div>
                    <div className="metric-card declined">
                      <h3>Declined</h3>
                      <p className="metric-value">{metrics.declinedOrders}</p>
                    </div>
                    <div className="metric-card pending">
                      <h3>Pending</h3>
                      <p className="metric-value">{metrics.pendingOrders}</p>
                    </div>
                    <div className="metric-card">
                      <h3>Approval Rate</h3>
                      <p className="metric-value">{metrics.approvalRate}%</p>
                    </div>
                    <div className="metric-card">
                      <h3>Declined Rate</h3>
                      <p className="metric-value">{metrics.declinedRate}%</p>
                    </div>
                    <div className="metric-card">
                      <h3>Pending Rate</h3>
                      <p className="metric-value">{metrics.pendingRate}%</p>
                    </div>
                    <div className="metric-card">
                      <h3>This Week</h3>
                      <p className="metric-value">{metrics.weeklyOrders}</p>
                    </div>
                  </div>

                  <div className="charts-container">
                    <div className="chart">
                      <h3>Order Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart">
                      <h3>Orders Status Summary</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#667eea" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="section">
              <h2>Manage Orders</h2>

              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              {loading ? (
                <p className="loading">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="empty-state">No orders found</p>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Farmer</th>
                        <th>Phone</th>
                        <th>Land (Ha)</th>
                        <th>Fertilizer</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.farmerName}</td>
                          <td>{order.farmerPhone}</td>
                          <td>{order.landArea}</td>
                          <td>{order.fertilizer}</td>
                          <td>{order.quantity.toFixed(2)}</td>
                          <td>
                            <span
                              className={`status-badge status-${order.status}`}
                            >
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            {order.status === 'pending' && (
                              <button
                                className="btn-action"
                                onClick={() => setSelectedOrder(order)}
                              >
                                Review
                              </button>
                            )}
                            {order.status !== 'pending' && (
                              <span className="badge-resolved">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Review Order</h2>
                    <div className="order-details">
                      <p><strong>Farmer:</strong> {selectedOrder.farmerName}</p>
                      <p><strong>Phone:</strong> {selectedOrder.farmerPhone}</p>
                      <p><strong>Land Area:</strong> {selectedOrder.landArea} hectares</p>
                      <p><strong>Fertilizer:</strong> {selectedOrder.fertilizer}</p>
                      <p><strong>Quantity:</strong> {selectedOrder.quantity.toFixed(2)} kg</p>
                      <p><strong>Rate/Hectare:</strong> {selectedOrder.ratePerUnit}</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="remarks">Remarks</label>
                      <textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks (required for declining)"
                        disabled={loading}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApproveOrder(selectedOrder.id)}
                        disabled={loading}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => handleDeclineOrder(selectedOrder.id)}
                        disabled={loading}
                      >
                        ✗ Decline
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setSelectedOrder(null);
                          setRemarks('');
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'fertilizers' && (
            <div className="section">
              <h2>Manage Fertilizer Rates</h2>

              <div className="fertilizer-grid">
                <div className="add-fertilizer">
                  <h3>Add New Fertilizer</h3>
                  <form onSubmit={handleAddFertilizer}>
                    <input
                      type="text"
                      placeholder="Fertilizer Name"
                      value={newFertilizer.name}
                      onChange={(e) =>
                        setNewFertilizer({ ...newFertilizer, name: e.target.value })
                      }
                      disabled={loading}
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Rate per Hectare"
                      value={newFertilizer.ratePerHectare}
                      onChange={(e) =>
                        setNewFertilizer({ ...newFertilizer, ratePerHectare: e.target.value })
                      }
                      disabled={loading}
                    />
                    <select
                      value={newFertilizer.unit}
                      onChange={(e) =>
                        setNewFertilizer({ ...newFertilizer, unit: e.target.value })
                      }
                      disabled={loading}
                    >
                      <option value="kg">kg</option>
                      <option value="bags">Bags</option>
                      <option value="liters">Liters</option>
                    </select>
                    <textarea
                      placeholder="Description (optional)"
                      value={newFertilizer.description}
                      onChange={(e) =>
                        setNewFertilizer({ ...newFertilizer, description: e.target.value })
                      }
                      disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Fertilizer'}
                    </button>
                  </form>
                </div>

                <div className="fertilizers-list">
                  <h3>Current Fertilizers</h3>
                  {fertilizers.length === 0 ? (
                    <p className="empty-state">No fertilizers added yet</p>
                  ) : (
                    <div className="fertilizer-cards">
                      {fertilizers.map(fert => (
                        <div key={fert.id} className="fert-card">
                          <h4>{fert.name}</h4>
                          <p>
                            <strong>Rate:</strong> {fert.ratePerHectare} {fert.unit}/hectare
                          </p>
                          <p>
                            <strong>Status:</strong>{' '}
                            <span className={fert.isActive ? 'active' : 'inactive'}>
                              {fert.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          {fert.description && (
                            <p className="description">{fert.description}</p>
                          )}
                          <small>Updated: {formatDate(fert.updatedAt)}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
