import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'utilisateur' });
  const [formError, setFormError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data?.data || res.data || []);
      setError(null);
    } catch (e) {
      setError('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Le nom et l\'email sont requis');
      return;
    }

    if (!editing && !form.password.trim()) {
      setFormError('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      
      await load();
      setEditing(null);
      setForm({ name: '', email: '', password: '', role: 'utilisateur' });
    } catch (e) {
      setFormError('Erreur lors de la sauvegarde');
    }
  };

  const onEdit = (user) => {
    setEditing(user);
    setForm({ 
      name: user.name || '', 
      email: user.email || '', 
      password: '', 
      role: user.role || 'utilisateur' 
    });
    setFormError(null);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      await load();
    } catch (e) {
      setError('Erreur lors de la suppression');
    }
  };

  const clearForm = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'utilisateur' });
    setFormError(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = users.slice(startIndex, endIndex);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-users text-primary me-3"></i>
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted mb-0">Administrez les comptes utilisateurs et leurs rôles</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setEditing({})}
          >
            <i className="fas fa-user-plus me-2"></i>
            Nouvel Utilisateur
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Utilisateurs ({users.length})
              </h3>
              {totalPages > 1 && (
                <div className="text-muted">
                  Page {currentPage} sur {totalPages}
                </div>
              )}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const csv = [
                      ['Nom', 'Email', 'Rôle', 'Date de création'],
                      ...users.map(user => [
                        user.name,
                        user.email,
                        user.role,
                        user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'utilisateurs.csv';
                    a.click();
                  }}
                >
                  <i className="fas fa-download me-1"></i>
                  Exporter CSV
                </button>
              </div>
            </div>
          </div>
          
          <div className="card-body p-0">
            {paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-users text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted mt-3">Aucun utilisateur trouvé</h4>
                <p className="text-muted mb-0">Commencez par créer votre premier utilisateur</p>
              </div>
            ) : (
          <div className="table-responsive">
                <table className="table mb-0">
              <thead>
                <tr>
                      <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                      <th>Statut</th>
                      <th>Actions</th>
                </tr>
              </thead>
                                <tbody>
                    {paginatedData.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '40px', height: '40px' }}>
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <strong>{user.name}</strong>
                              <br />
                              <small className="text-muted">ID: {user.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span>{user.email}</span>
                            {user.email_verified_at && (
                              <>
                                <br />
                                <small className="text-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Vérifié
                                </small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-secondary'}`}>
                            <i className={`fas ${user.role === 'admin' ? 'fa-shield-alt' : 'fa-user'} me-1`}></i>
                            {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            <i className="fas fa-circle me-1"></i>
                            Actif
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onEdit(user)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onDelete(user.id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            )}
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {(editing !== null) && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-user-edit me-2"></i>
                    {editing.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={clearForm}
                  ></button>
                </div>
                
                <form onSubmit={onSubmit}>
                  <div className="modal-body">
                    {formError && (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {formError}
                      </div>
                    )}
                    
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="fas fa-user me-2"></i>
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            placeholder="Prénom Nom"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="fas fa-envelope me-2"></i>
                            Adresse email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            placeholder="utilisateur@exemple.com"
                            required
                          />
        </div>
                </div>
                      
                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="fas fa-lock me-2"></i>
                            Mot de passe {editing.id && <small className="text-muted">(laisser vide pour ne pas changer)</small>}
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            placeholder={editing.id ? "Nouveau mot de passe" : "Mot de passe"}
                            required={!editing.id}
                          />
                </div>
                </div>
                      
                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            <i className="fas fa-shield-alt me-2"></i>
                            Rôle
                          </label>
                          <select
                            className="form-control"
                            value={form.role}
                            onChange={(e) => setForm({...form, role: e.target.value})}
                          >
                    <option value="utilisateur">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                  </select>
                </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>Note :</strong> Les administrateurs ont accès à toutes les fonctionnalités du système, 
                        y compris la gestion des utilisateurs.
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={clearForm}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-2"></i>
                      {editing.id ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                    </button>
                  </div>
              </form>
            </div>
          </div>
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}


