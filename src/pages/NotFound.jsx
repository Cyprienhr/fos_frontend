import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or you don't have access to it.</p>
        <div className="not-found-links">
          <Link to="/farmer-login" className="btn-link">
            Farmer Login
          </Link>
          <Link to="/admin-login" className="btn-link">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
