import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Stock Nettoyage</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Dashboard</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/produits">Produits</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/stocks">Stocks</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/bon-entree">Bon d'Entrée</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/bon-sortie">Bon de Sortie</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/transferts">Transferts</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/mouvements">Mouvements</NavLink>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/users">Utilisateurs</NavLink>
                </li>
              )}
            </ul>
          )}

          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">{user?.name} ({user?.role})</span>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="btn btn-outline-light btn-sm">Logout</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">Login</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}


