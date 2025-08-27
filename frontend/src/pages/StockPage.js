// Page Stocks: vue consolidée des stocks par magasin et par produit
import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

/**
 * Composant StockPage
 *
 * - Charge les mouvements, magasins et produits
 * - Calcule le stock courant par (magasin, produit)
 * - Offre des filtres et une exportation CSV
 */
export default function StockPage() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [magasins, setMagasins] = useState([]);
  const [produits, setProduits] = useState([]);
  const [filters, setFilters] = useState({ magasin_id: '', produit_id: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showFilters, setShowFilters] = useState(false);

  // Charge la liste des mouvements
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
  }, []);

  // Calcule le stock courant par couple (magasin, produit) à partir des mouvements
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

  // Construit les lignes de stock à afficher (avec application des filtres)
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

  // Logique de pagination
  const totalPages = Math.ceil(stockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = stockData.slice(startIndex, endIndex);

  // Réinitialise la pagination lorsque les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Met à jour un filtre (magasin ou produit)
  const onFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Efface tous les filtres
  const clearFilters = () => {
    setFilters({ magasin_id: '', produit_id: '' });
  };

  if (loading) return <Loading />;
  if (error) return (
    <div className="page-container">
      <div className="container">
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="container">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="mb-2" style={{ color: '#000000' }}>
              <i className="fas fa-warehouse text-primary me-3"></i>
              Stocks par Magasin
            </h1>
            <p className="text-muted mb-0">Vue consolidée des stocks par produit et magasin</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline btn-sm btn-action-neutral"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter me-1"></i>
              Filtres
            </button>
            <button
              className="btn btn-outline btn-sm btn-action-neutral"
              onClick={() => {
                const csv = [
                  ['Magasin', 'Produit', 'Quantité'],
                  ...stockData.map(s => [
                    s.magasin?.nom || `Magasin #${s.magasin_id}`,
                    s.produit?.nom || `Produit #${s.produit_id}`,
                    s.quantite
                  ])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'stocks.csv';
                a.click();
              }}
            >
              <i className="fas fa-download me-1"></i>
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Section filtres */}
        {showFilters && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="form-group">
                    <label className="form-label">Magasin</label>
                    <select 
                      className="form-control" 
                      value={filters.magasin_id} 
                      onChange={(e) => onFilterChange('magasin_id', e.target.value)}
                    >
                      <option value="">Tous les magasins</option>
                      {magasins.map((m) => (
                        <option key={m.id} value={m.id}>{m.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="form-group">
                    <label className="form-label">Produit</label>
                    <select 
                      className="form-control" 
                      value={filters.produit_id} 
                      onChange={(e) => onFilterChange('produit_id', e.target.value)}
                    >
                      <option value="">Tous les produits</option>
                      {produits.map((p) => (
                        <option key={p.id} value={p.id}>{p.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="form-group">
                    <label className="form-label">Actions</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={clearFilters}
                      >
                        <i className="fas fa-times me-1"></i>
                        Effacer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Résumé des résultats */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-muted">
              <strong>{stockData.length}</strong> ligne{stockData.length !== 1 ? 's' : ''} de stock trouvée{stockData.length !== 1 ? 's' : ''}
            </span>
            {(filters.magasin_id || filters.produit_id) && (
              <span className="badge badge-primary ms-2">Filtré</span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-muted">
              Page {currentPage} sur {totalPages}
            </div>
          )}
        </div>

        {/* Tableau des stocks */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Stocks
              </h3>
            </div>
          </div>

          <div className="card-body p-0">
            {paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-warehouse text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted mt-3">Aucun stock trouvé</h4>
                <p className="text-muted mb-0">
                  {(filters.magasin_id || filters.produit_id) 
                    ? 'Essayez de modifier vos critères de recherche' 
                    : "Aucune donnée de stock n'est disponible"}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Magasin</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-warehouse text-info me-2"></i>
                            <span>{s.magasin?.nom || `Magasin #${s.magasin_id}`}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-box text-primary me-2"></i>
                            <span>{s.produit?.nom || `Produit #${s.produit_id}`}</span>
                          </div>
                        </td>
                        <td>
                          <span className={s.quantite < 0 ? 'text-danger' : ''}>
                            {s.quantite}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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


