import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';

export default function ProduitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', categorie: '', fournisseur: '', date_peremption: '', seuil_critique: '' });
  const [stocks, setStocks] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [res, stocksRes] = await Promise.all([
        api.get('/produits'),
        api.get('/stocks'),
      ]);
      setItems(res.data || []);
      setStocks(stocksRes.data?.data || stocksRes.data || []);
    } catch (e) {
      setError('Erreur de chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let filtered = items;
    
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((i) =>
        [i.nom, i.categorie, i.fournisseur].some((v) => String(v || '').toLowerCase().includes(s))
      );
    }
    
    // Low stock filter
    if (filterLowStock) {
      filtered = filtered.filter((p) => {
        if (p.seuil_critique == null) return false;
        const currentStock = stocks.reduce((sum, s) => 
          s.produit_id === p.id ? sum + Number(s.quantite || 0) : sum, 0
        );
        return currentStock <= Number(p.seuil_critique);
      });
    }
    
    return filtered;
  }, [items, search, filterLowStock, stocks]);

  const resetForm = () => {
    setForm({ nom: '', categorie: '', fournisseur: '', date_peremption: '', seuil_critique: '' });
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.date_peremption) delete payload.date_peremption;
      payload.seuil_critique = payload.seuil_critique ? Number(payload.seuil_critique) : null;
      if (editing) {
        await api.put(`/produits/${editing.id}`, payload);
      } else {
        await api.post('/produits', payload);
      }
      await load();
      resetForm();
    } catch (e) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const onEdit = (it) => {
    setEditing(it);
    setForm({
      nom: it.nom || '',
      categorie: it.categorie || '',
      fournisseur: it.fournisseur || '',
      date_peremption: it.date_peremption ? it.date_peremption.slice(0, 10) : '',
      seuil_critique: it.seuil_critique ?? '',
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      await load();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Produits</h2>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="lowStockFilter"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="lowStockFilter">
              Stock bas
            </label>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Fournisseur</th>
                  <th>Stock actuel</th>
                  <th>Péremption</th>
                  <th>Seuil</th>
                  <th style={{ width: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const currentStock = stocks.reduce((sum, s) => 
                    s.produit_id === it.id ? sum + Number(s.quantite || 0) : sum, 0
                  );
                  const isLowStock = it.seuil_critique != null && currentStock <= Number(it.seuil_critique);
                  
                  return (
                    <tr key={it.id} className={isLowStock ? 'table-warning' : ''}>
                      <td>{it.nom}</td>
                      <td>{it.categorie}</td>
                      <td>{it.fournisseur}</td>
                      <td>
                        <span className={isLowStock ? 'text-danger fw-bold' : ''}>
                          {currentStock}
                        </span>
                        {isLowStock && <span className="badge bg-warning text-dark ms-1">Stock bas</span>}
                      </td>
                      <td>{it.date_peremption ? new Date(it.date_peremption).toLocaleDateString() : '-'}</td>
                      <td>{it.seuil_critique ?? '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(it)}>Modifier</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(it.id)}>Supprimer</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h5>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">Nom</label>
                  <input className="form-control" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Catégorie</label>
                  <input className="form-control" value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fournisseur</label>
                  <input className="form-control" value={form.fournisseur} onChange={(e) => setForm((f) => ({ ...f, fournisseur: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date de péremption</label>
                  <input type="date" className="form-control" value={form.date_peremption} onChange={(e) => setForm((f) => ({ ...f, date_peremption: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Seuil critique</label>
                  <input type="number" min="0" className="form-control" value={form.seuil_critique} onChange={(e) => setForm((f) => ({ ...f, seuil_critique: e.target.value }))} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
                  {editing && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


