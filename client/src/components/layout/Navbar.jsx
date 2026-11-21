import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Navbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => api.auth.getUser());

  useEffect(() => {
    setCurrentUser(api.auth.getUser());
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <header>
      <div className="navbar-container">
        <div className="hero-container navbar-hero-container">
          <nav className="navbar navbar-expand-xl">
            <div className="navbar-nav-container">
              {/* Logo Container */}
              <div className="logo-container">
                <Link className="navbar-brand fw-bold" to="/">
                  <img
                    src="/assets/images/Adelux-Logo.png"
                    alt="Adelux Logo"
                    className="img-fluid"
                    style={{ maxHeight: '48px', objectFit: 'contain' }}
                  />
                </Link>
              </div>

              {/* Nav Link Buttons Container */}
              <div className="nav-link-container">
                <nav className="navbar-nav-links" aria-label="Main Navigation">
                  <Link to="/" className={`nav-link-btn ${isActive('/') ? 'active' : ''}`}>
                    Home
                  </Link>
                  <Link to="/booking" className={`nav-link-btn ${isActive('/booking') ? 'active' : ''}`}>
                    Book Court
                  </Link>
                  <Link to="/about" className={`nav-link-btn ${isActive('/about') ? 'active' : ''}`}>
                    About Us
                  </Link>
                  <Link to="/contact" className={`nav-link-btn ${isActive('/contact') ? 'active' : ''}`}>
                    Contact Us
                  </Link>
                  <Link to="/front-desk" className={`nav-link-btn ${isActive('/front-desk') ? 'active' : ''}`}>
                    Front Desk
                  </Link>
                  {!currentUser && (
                    <Link
                      to="/login"
                      className={`nav-link-btn ${isActive('/login') || isActive('/register') ? 'active' : ''}`}
                    >
                      Login / Register
                    </Link>
                  )}
                </nav>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button className="nav-btn" type="button" onClick={onOpenSidebar} aria-label="Open mobile menu">
                <i className="fa-solid fa-bars-staggered"></i>
              </button>

              {/* Navbar Right Actions / CTA Container */}
              <div className="navbar-cta-container">
                <div className="d-flex align-items-center gap-2">
                  {currentUser ? (
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-[#1F1F1F] rounded-full border border-[#333333]">
                        <span className="w-2 h-2 rounded-full bg-[#C6EF2E]"></span>
                        <span className="text-white text-xs font-semibold">{currentUser.name || currentUser.email}</span>
                        {currentUser.role && currentUser.role !== 'MEMBER' && (
                          <span className="px-1.5 py-0.5 bg-[#C6EF2E]/20 text-[#C6EF2E] rounded text-[10px] font-bold">
                            {currentUser.role}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-auth-nav text-xs hover:text-red-400"
                        title="Sign Out"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket mr-1"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" className="btn-auth-nav" title="Sign In or Register">
                      <i className="fa-regular fa-user mr-1.5"></i>
                      <span>Login</span>
                    </Link>
                  )}
                  <Link to="/membership" className="btn btn-accent">
                    <span className="btn-title">Join The Club</span>
                    <span className="icon-circle">
                      <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
