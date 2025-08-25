import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Email et mot de passe sont requis');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            
            <div className="card">
              <div className="card-body p-4">
                <h3 className="card-title text-center mb-4">
                  <img src="/logo.jpeg" alt="Logo" style={{ height: '150px'}} />
                </h3>
                
                {formError && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {formError}
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form onSubmit={onSubmit}>
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Adresse Email
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="votre@email.com"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Mot de passe
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Votre mot de passe"
                      required 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`btn ${loading ? 'btn-soft' : 'btn-primary'} w-100 btn-lg`} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner me-2"></div>
                        Connexion en cours...
                      </>
                    ) : (
                      <>Se connecter</>
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Vos données sont sécurisées et confidentielles
                  </small>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}


