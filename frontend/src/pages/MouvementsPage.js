import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';

export default function MouvementsPage() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: '', produit_id: '', magasin_id: '', from: '', to: '' });
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [res, pRes, mRes] = await Promise.all([
          api.get('/mouvements'),
          api.get('/produits'),
          api.get('/magasins'),
        ]);
        setMouvements(res.data || []);
        setProduits(pRes.data || []);
        setMagasins(mRes.data || []);
      } catch (e) {
        setError('Erreur de chargement des mouvements');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return (mouvements || []).filter((m) => {
      if (filters.type && m.type !== filters.type) return false;
      if (filters.produit_id && Number(filters.produit_id) !== Number(m.produit_id)) return false;
      if (filters.magasin_id && Number(filters.magasin_id) !== Number(m.magasin_id)) return false;
      if (filters.from) {
        const d = new Date(m.created_at || m.updated_at || m.date || m.createdAt);
        if (isFinite(d) && d < new Date(filters.from)) return false;
      }
      if (filters.to) {
        const d = new Date(m.created_at || m.updated_at || m.date || m.createdAt);
        if (isFinite(d) && d > new Date(filters.to)) return false;
      }
      return true;
    });
  }, [mouvements, filters]);

  if (loading) return <Loading />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Historique des mouvements</h2>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-2">
          <select className="form-select" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">Tous les types</option>
            <option value="entrée">Entrée</option>
            <option value="sortie">Sortie</option>
            <option value="transfert">Transfert</option>
          </select>
        </div>
        <div className="col-12 col-md-3">
          <select className="form-select" value={filters.produit_id} onChange={(e) => setFilters((f) => ({ ...f, produit_id: e.target.value }))}>
            <option value="">Tous les produits</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <select className="form-select" value={filters.magasin_id} onChange={(e) => setFilters((f) => ({ ...f, magasin_id: e.target.value }))}>
            <option value="">Tous les magasins</option>
            {magasins.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
        </div>
        <div className="col-6 col-md-2">
          <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Produit</th>
              <th>Magasin</th>
              <th>Quantité</th>
              <th>Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                <td className="text-capitalize">{m.type}</td>
                <td>{m.produit?.nom || m.produit_id}</td>
                <td>{m.magasin?.nom || m.magasin_id}</td>
                <td>{m.quantite}</td>
                <td>{m.user?.name || m.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


