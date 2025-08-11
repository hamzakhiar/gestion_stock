import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'utilisateur' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data?.data || res.data || []);
    } catch (e) {
      setError('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
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
      alert('Erreur lors de la sauvegarde');
    }
  };

  const onEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name || '', email: u.email || '', password: '', role: u.role || 'utilisateur' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      await load();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Gestion des utilisateurs</h2>
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th style={{ width: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="text-capitalize">{u.role}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(u)}>Modifier</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{editing ? 'Modifier' : 'Créer'} un utilisateur</h5>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">Nom</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mot de passe {editing && <small className="text-muted">(laisser vide pour ne pas changer)</small>}</label>
                  <input type="password" className="form-control" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rôle</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                    <option value="utilisateur">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


