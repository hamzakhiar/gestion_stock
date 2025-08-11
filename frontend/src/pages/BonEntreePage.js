import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

export default function BonEntreePage() {
  const { user } = useAuth();
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    magasin_id: '',
    items: [{ produit_id: '', quantite: '' }]
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pRes, mRes] = await Promise.all([
          api.get('/produits'),
          api.get('/magasins'),
        ]);
        setProduits(pRes.data || []);
        setMagasins(mRes.data || []);
      } catch (e) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { produit_id: '', quantite: '' }]
    }));
  };

  const removeItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.magasin_id) {
      setError('Veuillez sélectionner un magasin');
      return;
    }

    const validItems = form.items.filter(item => item.produit_id && item.quantite);
    if (validItems.length === 0) {
      setError('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      // Create entrée movements for each item
      const promises = validItems.map(item => 
        api.post('/mouvements', {
          type: 'entrée',
          produit_id: Number(item.produit_id),
          quantite: Number(item.quantite),
          user_id: user.id,
          magasin_id: Number(form.magasin_id),
        })
      );

      await Promise.all(promises);
      setSuccess('Bon d\'entrée créé avec succès');
      setForm({ magasin_id: '', items: [{ produit_id: '', quantite: '' }] });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Erreur lors de la création du bon d\'entrée';
      setError(msg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Créer un bon d'entrée</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={onSubmit} className="card p-3 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Magasin</label>
          <select 
            className="form-select" 
            value={form.magasin_id} 
            onChange={(e) => setForm(prev => ({ ...prev, magasin_id: e.target.value }))} 
            required
          >
            <option value="">Choisir un magasin...</option>
            {magasins.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Produits à entrer</label>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
              + Ajouter un produit
            </button>
          </div>
          
          {form.items.map((item, index) => (
            <div key={index} className="row g-2 mb-2">
              <div className="col-6">
                <select 
                  className="form-select" 
                  value={item.produit_id} 
                  onChange={(e) => updateItem(index, 'produit_id', e.target.value)}
                  required
                >
                  <option value="">Choisir un produit...</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-4">
                <input 
                  type="number" 
                  min="1" 
                  className="form-control" 
                  placeholder="Quantité"
                  value={item.quantite} 
                  onChange={(e) => updateItem(index, 'quantite', e.target.value)}
                  required
                />
              </div>
              <div className="col-2">
                {form.items.length > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger w-100"
                    onClick={() => removeItem(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary">Créer le bon d'entrée</button>
      </form>
    </div>
  );
}
