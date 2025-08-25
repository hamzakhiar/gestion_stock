import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loading from "../components/Loading";

async function fetchAllPaginated(path) {
  const first = await api.get(path);
  const data = first.data;
  if (!data?.meta) return data?.data || data;
  const totalPages = data.meta.last_page;
  let items = data.data || [];
  for (let page = 2; page <= totalPages; page += 1) {
    const res = await api.get(
      path + (path.includes("?") ? "&" : "?") + `page=${page}`
    );
    items = items.concat(res.data?.data || []);
  }
  return items;
}

async function fetchAllMouvements() {
  const res = await api.get("/mouvements");
  return res.data || [];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [mouvements, setMouvements] = useState([]);

  // Calculate current stock for each product based on movements
  const calculateCurrentStock = (produitId) => {
    return mouvements.reduce((total, mouvement) => {
      if (mouvement.produit_id === produitId) {
        if (mouvement.type === "entrée") {
          return total + Number(mouvement.quantite || 0);
        } else if (mouvement.type === "sortie") {
          return total - Number(mouvement.quantite || 0);
        }
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pRes, mRes, sAll, mouvementsData] = await Promise.all([
          api.get("/produits"),
          api.get("/magasins"),
          fetchAllPaginated("/stocks"),
          fetchAllMouvements(),
        ]);
        setProduits(pRes.data || []);
        setMagasins(mRes.data || []);
        setStocks(sAll || []);
        setMouvements(mouvementsData || []);
      } catch (e) {
        setError("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lowStock = useMemo(() => {
    return produits
      .filter((p) => p.seuil_critique != null)
      .filter((p) => {
        const currentStock = calculateCurrentStock(p.id);
        return currentStock <= Number(p.seuil_critique);
      })
      .slice(0, 5);
  }, [produits, mouvements]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="page-container">
        <div className="container">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-tachometer-alt me-3 text-primary"></i>
              Tableau de Bord
            </h1>
            <p className="text-muted mb-0">
              Vue d'ensemble de votre gestion de stock
            </p>
          </div>
          <div className="d-none d-md-block">
            <div className="badge badge-info">
              <i className="fas fa-clock me-1"></i>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-number text-primary">
                <i className="fas fa-boxes me-3"></i>
                {produits.length}
              </div>
              <div className="stat-label">Produits</div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Total des produits enregistrés
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-number text-success">
                <i className="fas fa-warehouse me-3"></i>
                {magasins.length}
              </div>
              <div className="stat-label">Magasins</div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Points de stockage actifs
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-number text-info">
                <i className="fas fa-list me-3"></i>
                {stocks.length}
              </div>
              <div className="stat-label">Lignes de Stock</div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Entrées de stock totales
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                Alertes de Stock Bas
              </h3>
              <div className="d-flex align-items-center gap-2">
                {lowStock.length > 0 && (
                  <span className="badge badge-danger">
                    {lowStock.length} alerte{lowStock.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="card-body">
            {lowStock.length === 0 ? (
              <div className="text-center py-4">
                <i
                  className="fas fa-check-circle text-success"
                  style={{ fontSize: "3rem" }}
                ></i>
                <p className="text-muted mt-3 mb-0">
                  Aucune alerte de stock bas. Tous les niveaux sont
                  satisfaisants.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Stock Actuel</th>
                      <th>Seuil Critique</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => {
                      const currentStock = calculateCurrentStock(p.id);
                      const stockPercentage = p.seuil_critique
                        ? (currentStock / p.seuil_critique) * 100
                        : 0;

                      return (
                        <tr key={p.id}>
                          <td>
                            <div>
                              <strong>{p.nom}</strong>
                              <br />
                              <small className="text-muted">
                                {p.description || "Aucune description"}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="fw-bold me-2 text-danger">
                                {currentStock}
                              </span>
                              <div
                                className="progress flex-grow-1"
                                style={{ height: "8px", width: "80px" }}
                              >
                                <div
                                  className="progress-bar bg-danger"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(stockPercentage, 0),
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-secondary">
                              {p.seuil_critique}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-warning">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Stock Bas
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mt-5">
          <div className="col-12 col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-plus-circle text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="mt-3">Nouveau Produit</h4>
                <p className="text-muted">
                  Ajouter un nouveau produit au catalogue
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/produits')}>
                  <i className="fas fa-plus me-2"></i>
                  Ajouter un Produit
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-sign-in-alt text-warning"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="mt-3">Bon d'entrée</h4>
                <p className="text-muted">
                  Créer un bon d'entrée pour ajouter du stock
                </p>
                <button 
                  className="btn btn-warning"
                  onClick={() => window.location.href = '/bon-entree'}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Créer un Bon d'entrée
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <i
                  className="fas fa-exchange-alt text-success"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="mt-3">Nouveau Transfert</h4>
                <p className="text-muted">
                  Effectuer un transfert entre magasins
                </p>
                <button className="btn btn-success" onClick={() => navigate('/transferts')}>
                  <i className="fas fa-exchange-alt me-2"></i>
                  Créer un Transfert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
