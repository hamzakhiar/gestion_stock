import React, { useEffect, useMemo, useState } from 'react';
import api, { extractApiError } from '../api';
import Loading from '../components/Loading';

async function fetchAllMouvements() {
  const res = await api.get('/mouvements');
  return res.data || [];
}

export default function ProduitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', categorie: '', fournisseur: '', date_peremption: '', seuil_critique: '' });
  const [mouvements, setMouvements] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [res, allMouvements] = await Promise.all([
        api.get('/produits'),
        fetchAllMouvements(),
      ]);
      setItems(res.data || []);
      setMouvements(allMouvements || []);
      setError(null);
    } catch (e) {
      setError(extractApiError(e, 'Erreur de chargement des produits'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Calculate current stock for each product based on movements
  const calculateCurrentStock = (produitId) => {
    return mouvements.reduce((total, mouvement) => {
      if (mouvement.produit_id === produitId) {
        if (mouvement.type === 'entrée') {
          return total + Number(mouvement.quantite || 0);
        } else if (mouvement.type === 'sortie') {
          return total - Number(mouvement.quantite || 0);
        }
      }
      return total;
    }, 0);
  };

  const filtered = useMemo(() => {
    let filtered = items;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((i) =>
        [i.nom, i.categorie, i.fournisseur].some((v) => String(v || '').toLowerCase().includes(s))
      );
    }

    if (filterLowStock) {
      filtered = filtered.filter((p) => {
        if (p.seuil_critique == null) return false;
        const currentStock = calculateCurrentStock(p.id);
        return currentStock <= Number(p.seuil_critique);
      });
    }

    return filtered;
  }, [items, search, filterLowStock, mouvements]);

  const resetForm = () => {
    setForm({ nom: '', categorie: '', fournisseur: '', date_peremption: '', seuil_critique: '' });
    setEditing(null);
    setFormError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = { nom: form.nom, categorie: form.categorie, fournisseur: form.fournisseur };
      if (form.date_peremption) payload.date_peremption = form.date_peremption;
      if (form.seuil_critique !== '') payload.seuil_critique = Number(form.seuil_critique);

      if (editing) {
        await api.put(`/produits/${editing.id}`, payload);
      } else {
        await api.post('/produits', payload);
        // Intentionally not creating stock here; quantities will be managed via transferts/entrées
      }
      await load();
      resetForm();
    } catch (e) {
      setFormError(extractApiError(e, 'Erreur lors de la sauvegarde'));
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
    setFormError(null);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      await load();
    } catch (e) {
      alert(extractApiError(e, 'Erreur lors de la suppression'));
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
                  const currentStock = calculateCurrentStock(it.id);
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
              {formError && <div className="alert alert-warning py-2">{formError}</div>}
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
                  <input type="number" min="0" className="form-control" value={form.seuil_critique} onChange={(e) => setForm((f) => ({ ...f, seuil_critique: e.target.value }))} required />

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


