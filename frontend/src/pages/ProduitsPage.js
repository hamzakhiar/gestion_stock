import React, { useEffect, useMemo, useState } from "react";
import api, { extractApiError } from "../api";
import Loading from "../components/Loading";

async function fetchAllMouvements() {
  const res = await api.get("/mouvements");
  return res.data || [];
}

export default function ProduitsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    categorie: "",
    fournisseur: "",
    date_peremption: "",
    seuil_critique: "",
  });
  const [mouvements, setMouvements] = useState([]);

  // Enhanced filters
  const [filters, setFilters] = useState({
    categorie: "",
    fournisseur: "",
    stockMin: "",
    stockMax: "",
    datePeremption: "",
    seuilCritique: "",
  });

  // Filter panel toggle state
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [res, allMouvements] = await Promise.all([
        api.get("/produits"),
        fetchAllMouvements(),
      ]);
      setItems(res.data || []);
      setMouvements(allMouvements || []);
      setError(null);
    } catch (e) {
      setError(extractApiError(e, "Erreur de chargement des produits"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Get unique categories and suppliers for filters
  const uniqueCategories = useMemo(() => {
    const categories = [
      ...new Set(items.map((item) => item.categorie).filter(Boolean)),
    ];
    return categories.sort();
  }, [items]);

  const uniqueFournisseurs = useMemo(() => {
    const fournisseurs = [
      ...new Set(items.map((item) => item.fournisseur).filter(Boolean)),
    ];
    return fournisseurs.sort();
  }, [items]);

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

  const filtered = useMemo(() => {
    let filtered = items;

    // Text search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((i) =>
        [i.nom, i.categorie, i.fournisseur].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(s)
        )
      );
    }

    // Category filter
    if (filters.categorie) {
      filtered = filtered.filter((i) => i.categorie === filters.categorie);
    }

    // Supplier filter
    if (filters.fournisseur) {
      filtered = filtered.filter((i) => i.fournisseur === filters.fournisseur);
    }

    // Stock range filter
    if (filters.stockMin !== "") {
      filtered = filtered.filter(
        (i) => calculateCurrentStock(i.id) >= Number(filters.stockMin)
      );
    }
    if (filters.stockMax !== "") {
      filtered = filtered.filter(
        (i) => calculateCurrentStock(i.id) <= Number(filters.stockMax)
      );
    }

    // Low stock filter
    if (filterLowStock) {
      filtered = filtered.filter((i) => {
        const currentStock = calculateCurrentStock(i.id);
        return i.seuil_critique && currentStock <= Number(i.seuil_critique);
      });
    }

    return filtered;
  }, [items, search, filters, filterLowStock, mouvements]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.nom.trim()) {
      setFormError("Le nom du produit est requis");
      return;
    }

    // Prepare the payload with proper data types
    const payload = {
      nom: form.nom.trim(),
      categorie: form.categorie.trim() || null,
      fournisseur: form.fournisseur.trim() || null,
      date_peremption: form.date_peremption || null,
      seuil_critique: form.seuil_critique ? Number(form.seuil_critique) : null,
    };

    try {
      if (editing && editing.id) {
        await api.put(`/produits/${editing.id}`, payload);
      } else {
        await api.post("/produits", payload);
      }
      setForm({
        nom: "",
        categorie: "",
        fournisseur: "",
        date_peremption: "",
        seuil_critique: "",
      });
      setEditing(null);
      setShowModal(false);
      load();
    } catch (e) {
      setFormError(extractApiError(e, "Erreur lors de la sauvegarde"));
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))
      return;

    try {
      await api.delete(`/produits/${id}`);
      load();
    } catch (e) {
      // Check if it's a foreign key constraint error
      const errorMessage = e?.response?.data?.message || e?.message || '';
      if (errorMessage.includes('foreign key constraint fails') || 
          errorMessage.includes('Integrity constraint violation') ||
          errorMessage.includes('Cannot delete or update a parent row')) {
        setError("Le produit a des mouvements et ne peut pas être supprimé");
      } else {
        setError(extractApiError(e, "Erreur lors de la suppression"));
      }
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({
      nom: item.nom || "",
      categorie: item.categorie || "",
      fournisseur: item.fournisseur || "",
      date_peremption: item.date_peremption || "",
      seuil_critique: item.seuil_critique || "",
    });
    setShowModal(true);
  };

  const openNewProductModal = () => {
    setEditing(null);
    setForm({
      nom: "",
      categorie: "",
      fournisseur: "",
      date_peremption: "",
      seuil_critique: "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({
      nom: "",
      categorie: "",
      fournisseur: "",
      date_peremption: "",
      seuil_critique: "",
    });
    setFormError(null);
  };

  const clearFilters = () => {
    setFilters({
      categorie: "",
      fournisseur: "",
      stockMin: "",
      stockMax: "",
      datePeremption: "",
      seuilCritique: "",
    });
    setSearch("");
    setFilterLowStock(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-boxes text-primary me-3"></i>
              Gestion des Produits
            </h1>
            <p className="text-muted mb-0">
              Gérez votre catalogue de produits de nettoyage
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={openNewProductModal}>
              <i className="fas fa-plus me-2"></i>
              Nouveau Produit
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

        {/* Search and Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="form-group mb-0">
                  <label className="form-label">
                    <i className="fas fa-search me-2"></i>
                    Rechercher
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nom, catégorie, fournisseur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="d-flex gap-2 align-items-end">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="filterLowStock"
                      checked={filterLowStock}
                      onChange={(e) => setFilterLowStock(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="filterLowStock"
                    >
                      Stock bas uniquement
                    </label>
                  </div>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="fas fa-filter me-1"></i>
                    Filtres avancés
                  </button>

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

            {/* Advanced Filters */}
            {showFilters && (
              <div className="row g-3 mt-3 pt-3 border-top">
                <div className="col-12 col-md-3">
                  <div className="form-group mb-0">
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-control"
                      value={filters.categorie}
                      onChange={(e) =>
                        setFilters({ ...filters, categorie: e.target.value })
                      }
                    >
                      <option value="">Toutes les catégories</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <div className="form-group mb-0">
                    <label className="form-label">Fournisseur</label>
                    <select
                      className="form-control"
                      value={filters.fournisseur}
                      onChange={(e) =>
                        setFilters({ ...filters, fournisseur: e.target.value })
                      }
                    >
                      <option value="">Tous les fournisseurs</option>
                      {uniqueFournisseurs.map((four) => (
                        <option key={four} value={four}>
                          {four}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <div className="form-group mb-0">
                    <label className="form-label">Stock min</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={filters.stockMin}
                      onChange={(e) =>
                        setFilters({ ...filters, stockMin: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <div className="form-group mb-0">
                    <label className="form-label">Stock max</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="1000"
                      value={filters.stockMax}
                      onChange={(e) =>
                        setFilters({ ...filters, stockMax: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Produits ({filtered.length})
              </h3>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const csv = [
                      [
                        "Nom",
                        "Catégorie",
                        "Fournisseur",
                        "Stock Actuel",
                        "Seuil Critique",
                        "Date Péremption",
                      ],
                      ...filtered.map((item) => [
                        item.nom,
                        item.categorie || "",
                        item.fournisseur || "",
                        calculateCurrentStock(item.id),
                        item.seuil_critique || "",
                        item.date_peremption || "",
                      ]),
                    ]
                      .map((row) => row.join(","))
                      .join("\n");

                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "produits.csv";
                    a.click();
                  }}
                >
                  <i className="fas fa-download me-1"></i>
                  Exporter CSV
                </button>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="fas fa-box-open text-muted"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="text-muted mt-3">Aucun produit trouvé</h4>
                <p className="text-muted mb-0">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Fournisseur</th>
                      <th>Stock Actuel</th>
                      <th>Seuil Critique</th>
                      <th>Date Péremption</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const currentStock = calculateCurrentStock(item.id);
                      const isLowStock =
                        item.seuil_critique &&
                        currentStock <= Number(item.seuil_critique);

                      return (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong>{item.nom}</strong>
                              {item.description && (
                                <>
                                  <br />
                                  <small className="text-muted">
                                    {item.description}
                                  </small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.categorie ? (
                              <span className="badge badge-secondary">
                                {item.categorie}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {item.fournisseur || (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span
                                className={`fw-bold me-2 ${
                                  isLowStock ? "text-danger" : ""
                                }`}
                              >
                                {currentStock}
                              </span>
                              {item.seuil_critique && (
                                <div
                                  className="progress flex-grow-1"
                                  style={{ height: "8px", width: "80px" }}
                                >
                                  <div
                                    className={`progress-bar ${
                                      isLowStock ? "bg-danger" : "bg-success"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        (currentStock / item.seuil_critique) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.seuil_critique ? (
                              <span className="badge badge-warning">
                                {item.seuil_critique}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {item.date_peremption ? (
                              <span
                                className={`badge ${
                                  new Date(item.date_peremption) < new Date()
                                    ? "badge-danger"
                                    : "badge-info"
                                }`}
                              >
                                {new Date(
                                  item.date_peremption
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => onEdit(item)}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onDelete(item.id)}
                                title="Supprimer"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-edit me-2"></i>
                    {editing && editing.id
                      ? "Modifier le produit"
                      : "Nouveau produit"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>

                <form onSubmit={onSubmit}>
                  <div className="modal-body">
                    {formError && (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {formError}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label">Nom du produit *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.nom}
                            onChange={(e) =>
                              setForm({ ...form, nom: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Catégorie</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.categorie}
                            onChange={(e) =>
                              setForm({ ...form, categorie: e.target.value })
                            }
                            placeholder="ex: Désinfectant"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Fournisseur</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.fournisseur}
                            onChange={(e) =>
                              setForm({ ...form, fournisseur: e.target.value })
                            }
                            placeholder="ex: Fournisseur ABC"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">
                            Date de péremption
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.date_peremption}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                date_peremption: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Seuil critique</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.seuil_critique}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                seuil_critique: e.target.value,
                              })
                            }
                            placeholder="ex: 10"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeModal}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-2"></i>
                      {editing && editing.id ? "Mettre à jour" : "Créer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
