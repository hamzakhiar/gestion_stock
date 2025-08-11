import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';

async function fetchAllPaginated(path) {
  const first = await api.get(path);
  const data = first.data;
  if (!data?.meta) return data?.data || data;
  const totalPages = data.meta.last_page;
  let items = data.data || [];
  for (let page = 2; page <= totalPages; page += 1) {
    const res = await api.get(path + (path.includes('?') ? '&' : '?') + `page=${page}`);
    items = items.concat(res.data?.data || []);
  }
  return items;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pRes, mRes, sAll] = await Promise.all([
          api.get('/produits'),
          api.get('/magasins'),
          fetchAllPaginated('/stocks'),
        ]);
        setProduits(pRes.data || []);
        setMagasins(mRes.data || []);
        setStocks(sAll || []);
      } catch (e) {
        setError('Impossible de charger le tableau de bord');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lowStock = useMemo(() => {
    // Aggregate stock by produit_id
    const byProduit = new Map();
    stocks.forEach((s) => {
      const current = byProduit.get(s.produit_id) || 0;
      byProduit.set(s.produit_id, current + Number(s.quantite || 0));
    });
    return produits
      .filter((p) => p.seuil_critique != null)
      .filter((p) => (byProduit.get(p.id) || 0) <= Number(p.seuil_critique))
      .slice(0, 5);
  }, [stocks, produits]);

  if (loading) return <Loading />;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Produits</h5>
              <p className="display-6 mb-0">{produits.length}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Magasins</h5>
              <p className="display-6 mb-0">{magasins.length}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Lignes de stock</h5>
              <p className="display-6 mb-0">{stocks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">
            Alertes de stock bas 
            {lowStock.length > 0 && (
              <span className="badge bg-danger ms-2">{lowStock.length}</span>
            )}
          </h5>
          {lowStock.length === 0 ? (
            <p className="text-muted mb-0">Aucune alerte.</p>
          ) : (
            <div className="list-group list-group-flush">
              {lowStock.map((p) => {
                const currentStock = stocks.reduce((sum, s) => 
                  s.produit_id === p.id ? sum + Number(s.quantite || 0) : sum, 0
                );
                return (
                  <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{p.nom}</strong>
                      <br />
                      <small className="text-muted">Stock actuel: {currentStock} | Seuil: {p.seuil_critique}</small>
                    </div>
                    <span className="badge bg-warning text-dark">Stock bas</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


