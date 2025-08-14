import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

export default function StockPage() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [magasins, setMagasins] = useState([]);
  const [produits, setProduits] = useState([]);
  const [filters, setFilters] = useState({ magasin_id: '', produit_id: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mouvements');
      setMouvements(res.data || []);
    } catch (e) {
      setError('Erreur de chargement des mouvements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          api.get('/magasins'),
          api.get('/produits'),
        ]);
        setMagasins(mRes.data || []);
        setProduits(pRes.data || []);
      } catch (e) {
        // ignore
      }
    })();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate current stock for each product per store based on movements
  const calculateStockByMagasin = useMemo(() => {
    const stockMap = new Map();
    
    mouvements.forEach((mouvement) => {
      const key = `${mouvement.magasin_id}-${mouvement.produit_id}`;
      const currentStock = stockMap.get(key) || 0;
      
      if (mouvement.type === 'entrée') {
        stockMap.set(key, currentStock + Number(mouvement.quantite || 0));
      } else if (mouvement.type === 'sortie') {
        stockMap.set(key, currentStock - Number(mouvement.quantite || 0));
      }
    });
    
    return stockMap;
  }, [mouvements]);

  // Generate stock data for display
  const stockData = useMemo(() => {
    const data = [];
    const processedKeys = new Set();
    
    // Get all unique magasin-produit combinations
    mouvements.forEach((mouvement) => {
      const key = `${mouvement.magasin_id}-${mouvement.produit_id}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        
        const magasin = magasins.find(m => m.id === mouvement.magasin_id);
        const produit = produits.find(p => p.id === mouvement.produit_id);
        const quantite = calculateStockByMagasin.get(key) || 0;
        
        // Apply filters
        if (filters.magasin_id && mouvement.magasin_id !== Number(filters.magasin_id)) return;
        if (filters.produit_id && mouvement.produit_id !== Number(filters.produit_id)) return;
        
        data.push({
          id: key,
          magasin_id: mouvement.magasin_id,
          produit_id: mouvement.produit_id,
          magasin: magasin,
          produit: produit,
          quantite: quantite
        });
      }
    });
    
    return data;
  }, [mouvements, magasins, produits, filters, calculateStockByMagasin]);

  const onFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
  };

  if (loading) return <Loading />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Stocks par magasin</h2>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <select className="form-select" value={filters.magasin_id} onChange={(e) => onFilterChange('magasin_id', e.target.value)}>
            <option value="">Tous les magasins</option>
            {magasins.map((m) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <select className="form-select" value={filters.produit_id} onChange={(e) => onFilterChange('produit_id', e.target.value)}>
            <option value="">Tous les produits</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Magasin</th>
              <th>Produit</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            {stockData.length > 0 ? (
              stockData.map((s) => (
                <tr key={s.id}>
                  <td>{s.magasin?.nom || s.magasin_id}</td>
                  <td>{s.produit?.nom || s.produit_id}</td>
                  <td>
                    <span className={s.quantite < 0 ? 'text-danger' : ''}>
                      {s.quantite}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  Aucun stock trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


