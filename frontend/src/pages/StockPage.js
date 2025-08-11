import React, { useEffect, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [magasins, setMagasins] = useState([]);
  const [produits, setProduits] = useState([]);
  const [filters, setFilters] = useState({ magasin_id: '', produit_id: '' });

  const load = async (page = 1, flt = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (flt.magasin_id) params.append('magasin_id', flt.magasin_id);
      if (flt.produit_id) params.append('produit_id', flt.produit_id);
      params.append('page', page);
      const res = await api.get(`/stocks?${params.toString()}`);
      setStocks(res.data?.data || []);
      setMeta(res.data?.meta || { current_page: 1, last_page: 1 });
    } catch (e) {
      setError('Erreur de chargement des stocks');
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
    load(1, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    load(1, next);
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
            {stocks.map((s) => (
              <tr key={s.id}>
                <td>{s.magasin?.nom || s.magasin_id}</td>
                <td>{s.produit?.nom || s.produit_id}</td>
                <td>{s.quantite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={meta.current_page || 1}
        totalPages={meta.last_page || 1}
        onPageChange={(p) => load(p)}
      />
    </div>
  );
}


