import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Loading from '../components/Loading';
import './MouvementsPage.css';

// Configuration constants
const PAGE_SIZE = 10;

// Component for sortable table headers
const SortableHeader = ({ column, currentSort, currentDir, onSort, children }) => (
  <th
    className="sortable-header"
    onClick={() => onSort(column)}
    role="button"
    style={{ cursor: "pointer", userSelect: "none" }}
  >
    <div className="d-flex align-items-center justify-content-between">
      <span>{children}</span>
      <span className="sort-icon">
        {currentSort === column ? (
          currentDir === "asc" ? '▲' : '▼'
        ) : '↕'}
      </span>
    </div>
  </th>
);

// Component for type badges
const TypeBadge = ({ type }) => {
  const getBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'entrée':
        return 'type-badge type-badge-success';
      case 'sortie':
        return 'type-badge type-badge-danger';
      case 'transfert':
        return 'type-badge type-badge-primary';
      default:
        return 'type-badge type-badge-secondary';
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'entrée':
        return '↗ ';
      case 'sortie':
        return '↙ ';
      case 'transfert':
        return '↔ ';
      default:
        return '';
    }
  };

  return (
    <span className={getBadgeClass(type)}>
      {getIcon(type)}{type || 'Non défini'}
    </span>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Calculate which pages to show
  const startPage = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav>
      <ul className="custom-pagination d-flex list-unstyled">
        {/* First page */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
        </li>
        
        {/* Previous page */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
        </li>
        
        {/* Page numbers */}
        {pages.map(pageNum => (
          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          </li>
        ))}
        
        {/* Next page */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </li>
        
        {/* Last page */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
};

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
  const [sortState, setSortState] = useState({ by: 'date', dir: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

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
        console.error('Error loading movements:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const results = (mouvements || []).filter((m) => {
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

    const getTime = (m) => {
      const d = new Date(m.created_at || m.updated_at || m.date || m.createdAt);
      const t = d instanceof Date && !isNaN(d) ? d.getTime() : 0;
      return t;
    };

    const compare = (a, b) => {
      if (sortState.by === 'date') {
        const ta = getTime(a);
        const tb = getTime(b);
        return sortState.dir === 'asc' ? ta - tb : tb - ta;
      }
      if (sortState.by === 'type') {
        const at = (a.type || '').toString().toLowerCase();
        const bt = (b.type || '').toString().toLowerCase();
        if (at === bt) return 0;
        if (sortState.dir === 'asc') return at < bt ? -1 : 1;
        return at > bt ? -1 : 1;
      }
      if (sortState.by === 'produit') {
        const ap = (a.produit?.nom || a.produit_id || '').toString().toLowerCase();
        const bp = (b.produit?.nom || b.produit_id || '').toString().toLowerCase();
        if (ap === bp) return 0;
        if (sortState.dir === 'asc') return ap < bp ? -1 : 1;
        return ap > bp ? -1 : 1;
      }
      if (sortState.by === 'magasin') {
        const am = (a.magasin?.nom || a.magasin_id || '').toString().toLowerCase();
        const bm = (b.magasin?.nom || b.magasin_id || '').toString().toLowerCase();
        if (am === bm) return 0;
        if (sortState.dir === 'asc') return am < bm ? -1 : 1;
        return am > bm ? -1 : 1;
      }
      if (sortState.by === 'quantite') {
        const aq = Number(a.quantite) || 0;
        const bq = Number(b.quantite) || 0;
        return sortState.dir === 'asc' ? aq - bq : bq - aq;
      }
      return 0;
    };

    return results.sort(compare);
  }, [mouvements, filters, sortState]);

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSort = (column) => {
    setSortState((s) => ({
      by: column,
      dir: s.by === column && s.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      produit_id: '',
      magasin_id: '',
      from: '',
      to: ''
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="movements-page">
      <div className="container py-4">
        {/* Page Header */}
        <div className="page-header mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h1 className="page-title mb-1">
                📊 Historique des mouvements
              </h1>
              <p className="page-subtitle mb-0">
                Suivez tous les mouvements de stock en temps réel
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <div className="d-flex align-items-center">
              <span className="me-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="filters-card mb-4">
          <div className="filters-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <span className="me-2">🔍</span>
                <span className="fw-semibold">Filtres de recherche</span>
              </div>
              {hasActiveFilters && (
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={resetFilters}
                  title="Réinitialiser tous les filtres"
                >
                  ✕ Réinitialiser
                </button>
              )}
            </div>
          </div>
          <div className="filters-body">
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">TYPE DE MOUVEMENT</label>
                <div className="input-group">
                  <span className="input-group-text">🔄</span>
                  <select 
                    className="form-select" 
                    value={filters.type} 
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">Tous les types</option>
                    <option value="entrée">Entrée</option>
                    <option value="sortie">Sortie</option>
                    <option value="transfert">Transfert</option>
                  </select>
                </div>
              </div>
              
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label">PRODUIT</label>
                <div className="input-group">
                  <span className="input-group-text">📦</span>
                  <select 
                    className="form-select" 
                    value={filters.produit_id} 
                    onChange={(e) => setFilters((f) => ({ ...f, produit_id: e.target.value }))}
                  >
                    <option value="">Tous les produits</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label">MAGASIN</label>
                <div className="input-group">
                  <span className="input-group-text">🏪</span>
                  <select 
                    className="form-select" 
                    value={filters.magasin_id} 
                    onChange={(e) => setFilters((f) => ({ ...f, magasin_id: e.target.value }))}
                  >
                    <option value="">Tous les magasins</option>
                    {magasins.map((m) => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-6 col-md-3 col-lg-2">
                <label className="form-label">DATE DÉBUT</label>
                <div className="input-group">
                  <span className="input-group-text">📅</span>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={filters.from} 
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="col-6 col-md-3 col-lg-2">
                <label className="form-label">DATE FIN</label>
                <div className="input-group">
                  <span className="input-group-text">📅</span>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={filters.to} 
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              <strong>{filtered.length}</strong> mouvement{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters && (
                <span className="badge bg-primary ms-2">Filtré</span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination-info text-muted">
                Affichage de {startIndex + 1} à {Math.min(endIndex, filtered.length)} sur {filtered.length} résultats
              </div>
            )}
          </div>
        </div>

        {/* Main Table */}
        <div className="table-card">
          <div className="table-responsive">
            <table className="table movements-table">
              <thead className="table-header">
                <tr>
                  <SortableHeader
                    column="date"
                    currentSort={sortState.by}
                    currentDir={sortState.dir}
                    onSort={handleSort}
                  >
                    Date
                  </SortableHeader>
                  <SortableHeader
                    column="type"
                    currentSort={sortState.by}
                    currentDir={sortState.dir}
                    onSort={handleSort}
                  >
                    Type
                  </SortableHeader>
                  <SortableHeader
                    column="produit"
                    currentSort={sortState.by}
                    currentDir={sortState.dir}
                    onSort={handleSort}
                  >
                    Produit
                  </SortableHeader>
                  <SortableHeader
                    column="magasin"
                    currentSort={sortState.by}
                    currentDir={sortState.dir}
                    onSort={handleSort}
                  >
                    Magasin
                  </SortableHeader>
                  <SortableHeader
                    column="quantite"
                    currentSort={sortState.by}
                    currentDir={sortState.dir}
                    onSort={handleSort}
                  >
                    Quantité
                  </SortableHeader>
                  <th>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h5 className="empty-title">Aucun mouvement trouvé</h5>
                        <p className="empty-subtitle">
                          {hasActiveFilters 
                            ? "Essayez de modifier vos critères de recherche" 
                            : "Aucun mouvement n'est enregistré"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((m, index) => (
                    <tr 
                      key={m.id} 
                      className="table-row"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td>
                        <div className="date-info">
                          <div className="fw-semibold text-dark">
                            {m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '-'}
                          </div>
                          <small className="text-muted">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString('fr-FR') : ''}
                          </small>
                        </div>
                      </td>
                      <td>
                        <TypeBadge type={m.type} />
                      </td>
                      <td>
                        <div className="product-info">
                          <span className="me-2">📦</span>
                          <span className="fw-semibold">
                            {m.produit?.nom || `Produit #${m.produit_id}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="store-info">
                          <span className="me-2">🏪</span>
                          <span>{m.magasin?.nom || `Magasin #${m.magasin_id}`}</span>
                        </div>
                      </td>
                      <td>
                        <span className="quantity-badge">
                          {m.quantite}
                        </span>
                      </td>
                      <td>
                        <span className="user-info">
                          {m.user?.name || `Utilisateur #${m.user_id}` || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}