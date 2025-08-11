import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

export default function TransferPage() {
  const { user } = useAuth();
  const [magasins, setMagasins] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ produit_id: '', quantite: '', source_id: '', destination_id: '' });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [mRes, pRes] = await Promise.all([
          api.get('/magasins'),
          api.get('/produits'),
        ]);
        setMagasins(mRes.data || []);
        setProduits(pRes.data || []);
      } catch (e) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const { produit_id, quantite, source_id, destination_id } = form;
    if (!produit_id || !quantite || !source_id || !destination_id) {
      setError('Tous les champs sont requis');
      return;
    }
    if (source_id === destination_id) {
      setError('Source et destination doivent être différentes');
      return;
    }
    try {
      // Create sortie
      const sortieRes = await api.post('/mouvements', {
        type: 'sortie',
        produit_id: Number(produit_id),
        quantite: Number(quantite),
        user_id: user.id,
        magasin_id: Number(source_id),
      });
      // Create entree
      const entreeRes = await api.post('/mouvements', {
        type: 'entrée',
        produit_id: Number(produit_id),
        quantite: Number(quantite),
        user_id: user.id,
        magasin_id: Number(destination_id),
      });
      // Link as transfert
      await api.post('/transferts', {
        mouvement_sortie_id: sortieRes.data.id,
        mouvement_entree_id: entreeRes.data.id,
      });
      setSuccess('Transfert effectué avec succès');
      setForm({ produit_id: '', quantite: '', source_id: '', destination_id: '' });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Erreur lors du transfert';
      setError(msg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Transférer un produit</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={onSubmit} className="card p-3 shadow-sm">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Produit</label>
            <select className="form-select" value={form.produit_id} onChange={(e) => setForm((f) => ({ ...f, produit_id: e.target.value }))} required>
              <option value="">Choisir...</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Quantité</label>
            <input type="number" min="1" className="form-control" value={form.quantite} onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Source</label>
            <select className="form-select" value={form.source_id} onChange={(e) => setForm((f) => ({ ...f, source_id: e.target.value }))} required>
              <option value="">Choisir...</option>
              {magasins.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Destination</label>
            <select className="form-select" value={form.destination_id} onChange={(e) => setForm((f) => ({ ...f, destination_id: e.target.value }))} required>
              <option value="">Choisir...</option>
              {magasins.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary">Transférer</button>
        </div>
      </form>
    </div>
  );
}


