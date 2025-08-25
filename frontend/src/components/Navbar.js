import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const userDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        {/* Brand - Left aligned */}
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <img src="/logo.jpeg" alt="Logo" style={{ height: '80px', width: 'auto' }} />
        </Link>
        
        {/* Mobile toggle button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon">
            <i className="fas fa-bars"></i>
          </span>
        </button>

        {/* Navigation menu and user section */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          {/* Center navigation menu */}
          {isAuthenticated && (
            <ul className="navbar-nav navbar-nav-center">
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                  to="/" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/produits') ? 'active' : ''}`} 
                  to="/produits" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-boxes me-2"></i>
                  Produits
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/stocks') ? 'active' : ''}`} 
                  to="/stocks" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-warehouse me-2"></i>
                  Stocks
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/bon-entree') ? 'active' : ''}`} 
                  to="/bon-entree" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Bon d'Entrée
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/bon-sortie') ? 'active' : ''}`} 
                  to="/bon-sortie" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Bon de Sortie
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/transferts') ? 'active' : ''}`} 
                  to="/transferts" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-exchange-alt me-2"></i>
                  Transferts
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/mouvements') ? 'active' : ''}`} 
                  to="/mouvements" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-chart-line me-2"></i>
                  Mouvements
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className={`nav-link ${isActive('/demandes-reapprovisionnement') ? 'active' : ''}`} 
                  to="/demandes-reapprovisionnement" 
                  onClick={closeMenu}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Demandes
                </NavLink>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <NavLink 
                    className={`nav-link ${isActive('/users') ? 'active' : ''}`} 
                    to="/users" 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-users me-2"></i>
                    Utilisateurs
                  </NavLink>
                </li>
              )}
            </ul>
          )}

          {/* User dropdown - Right side */}
          <div className="navbar-user-dropdown" ref={userDropdownRef}>
            {isAuthenticated ? (
              <button 
                className="btn btn-user-dropdown"
                onClick={toggleUserDropdown}
                aria-expanded={isUserDropdownOpen}
              >
                <div className="user-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <span className="user-name">{user?.name}</span>
                <i className={`fas fa-chevron-down ms-2 ${isUserDropdownOpen ? 'rotate' : ''}`}></i>
              </button>
            ) : (
              <NavLink className="nav-link" to="/login" onClick={closeMenu}>
                <i className="fas fa-sign-in-alt me-2"></i>
                Connexion
              </NavLink>
            )}
            
            {/* User dropdown menu */}
            {isAuthenticated && (
              <div className={`user-dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-header">
                  <div className="user-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-role">{user?.role}</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }} 
                  className="btn btn-logout dropdown-item"
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


