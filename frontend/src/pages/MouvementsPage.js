import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';

export default function MouvementsPage() {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ 
    type: '', 
    produit_id: '', 
    magasin_id: '', 
    from: '', 
    to: '' 
  });
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
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
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || a.date || a.createdAt);
      const dateB = new Date(b.created_at || b.updated_at || b.date || b.createdAt);
      return dateB - dateA; // Most recent first
    });
  }, [mouvements, filters]);

  const clearFilters = () => {
    setFilters({
      type: '',
      produit_id: '',
      magasin_id: '',
      from: '',
      to: ''
    });
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'entrée': { color: 'badge-success', icon: 'fas fa-sign-in-alt' },
      'sortie': { color: 'badge-danger', icon: 'fas fa-sign-out-alt' },
      'transfert': { color: 'badge-primary', icon: 'fas fa-exchange-alt' }
    };
    
    const config = typeConfig[type?.toLowerCase()] || { color: 'badge-secondary', icon: 'fas fa-question' };
    
    return (
      <span className={`badge ${config.color}`}>
        <i className={`${config.icon} me-1`}></i>
        {type || 'Non défini'}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
            <h1 className="mb-2">
              <i className="fas fa-chart-line text-primary me-3"></i>
              Historique des Mouvements
              </h1>
            <p className="text-muted mb-0">Suivez tous les mouvements de stock en temps réel</p>
            </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter me-1"></i>
              Filtres
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                const csv = [
                  ['Date', 'Type', 'Produit', 'Magasin', 'Quantité', 'Utilisateur'],
                  ...filtered.map(m => [
                    m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '-',
                    m.type || '-',
                    m.produit?.nom || `Produit #${m.produit_id}`,
                    m.magasin?.nom || `Magasin #${m.magasin_id}`,
                    m.quantite || '-',
                    m.user?.name || `Utilisateur #${m.user_id}` || '-'
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mouvements.csv';
                a.click();
              }}
            >
              <i className="fas fa-download me-1"></i>
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <div className="card mb-4">
            <div className="card-body">
            <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="form-group">
                    <label className="form-label">Type de mouvement</label>
                  <select 
                      className="form-control" 
                    value={filters.type} 
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">Tous les types</option>
                    <option value="entrée">Entrée</option>
                    <option value="sortie">Sortie</option>
                    <option value="transfert">Transfert</option>
                  </select>
                </div>
              </div>
              
                <div className="col-12 col-md-3">
                  <div className="form-group">
                    <label className="form-label">Produit</label>
                  <select 
                      className="form-control" 
                    value={filters.produit_id} 
                      onChange={(e) => setFilters({...filters, produit_id: e.target.value})}
                  >
                    <option value="">Tous les produits</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              
                <div className="col-12 col-md-3">
                  <div className="form-group">
                    <label className="form-label">Magasin</label>
                  <select 
                      className="form-control" 
                    value={filters.magasin_id} 
                      onChange={(e) => setFilters({...filters, magasin_id: e.target.value})}
                  >
                    <option value="">Tous les magasins</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              
                <div className="col-12 col-md-3">
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
              
              <div className="row g-3 mt-3">
                <div className="col-12 col-md-6">
                  <div className="form-group">
                    <label className="form-label">Date de début</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={filters.from} 
                      onChange={(e) => setFilters({...filters, from: e.target.value})}
                  />
                </div>
              </div>
              
                <div className="col-12 col-md-6">
                  <div className="form-group">
                    <label className="form-label">Date de fin</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={filters.to} 
                      onChange={(e) => setFilters({...filters, to: e.target.value})}
                  />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-muted">
              <strong>{filtered.length}</strong> mouvement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            </span>
            {Object.values(filters).some(f => f !== '') && (
              <span className="badge badge-primary ms-2">Filtré</span>
            )}
          </div>
        </div>

        {/* Movements Table */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Mouvements de Stock
              </h3>
            </div>
          </div>
          
          <div className="card-body p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-chart-line text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted mt-3">Aucun mouvement trouvé</h4>
                <p className="text-muted mb-0">
                  {Object.values(filters).some(f => f !== '') 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Aucun mouvement n'est enregistré"}
                </p>
              </div>
            ) : (
          <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Date & Heure</th>
                      <th>Type</th>
                      <th>Produit</th>
                      <th>Magasin</th>
                      <th>Quantité</th>
                  <th>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                    {filtered.map((mouvement) => (
                      <tr key={mouvement.id}>
                        <td>
                          <div>
                            <strong>
                              {mouvement.created_at ? new Date(mouvement.created_at).toLocaleDateString('fr-FR') : '-'}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {mouvement.created_at ? new Date(mouvement.created_at).toLocaleTimeString('fr-FR') : ''}
                            </small>
                        </div>
                      </td>
                      <td>
                          {getTypeBadge(mouvement.type)}
                      </td>
                      <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-box text-primary me-2"></i>
                            <span>
                              {mouvement.produit?.nom || `Produit #${mouvement.produit_id}`}
                          </span>
                        </div>
                      </td>
                      <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-warehouse text-info me-2"></i>
                            <span>
                              {mouvement.magasin?.nom || `Magasin #${mouvement.magasin_id}`}
                            </span>
                        </div>
                      </td>
                      <td>
                          <span className="fw-bold">
                            {mouvement.quantite || '-'}
                        </span>
                      </td>
                      <td>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-user text-secondary me-2"></i>
                            <span>
                              {mouvement.user?.name || `Utilisateur #${mouvement.user_id}` || '-'}
                        </span>
                          </div>
                      </td>
                    </tr>
                    ))}
              </tbody>
            </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}