import React, { useEffect, useState, useMemo } from 'react';
import api, { extractApiError } from '../api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

export default function DemandeReapprovisionnementPage() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    produit_id: '',
    magasin_id: '',
    quantite_demandee: '',
    priorite: 'normale',
    commentaire: '',
    date_limite: ''
  });
  const [editing, setEditing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dRes, pRes, mRes] = await Promise.all([
        api.get('/demandes-achat?with=produit,magasin,user'),
        api.get('/produits'),
        api.get('/magasins'),
      ]);
      setDemandes(Array.isArray(dRes.data) ? dRes.data : []);
      setProduits(Array.isArray(pRes.data) ? pRes.data : []);
      setMagasins(Array.isArray(mRes.data) ? mRes.data : []);
      setUsers([]); // Not needed since user data is included in demandes
    } catch (e) {
      setError(extractApiError(e, 'Erreur de chargement des demandes'));
      // Ensure arrays are set to empty arrays on error
      setDemandes([]);
      setProduits([]);
      setMagasins([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openNewDemandeModal = () => {
    setEditing(null);
    setForm({
      produit_id: '',
      magasin_id: '',
      quantite_demandee: '',
      priorite: 'normale',
      commentaire: '',
      date_limite: ''
    });
    setShowModal(true);
  };

  const openEditDemandeModal = (demande) => {
    setEditing(demande);
    setForm({
      produit_id: demande.produit_id || '',
      magasin_id: demande.magasin_id || '',
      quantite_demandee: demande.quantite_demandee || '',
      priorite: demande.priorite || 'normale',
      commentaire: demande.commentaire || '',
      date_limite: demande.date_limite || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({
      produit_id: '',
      magasin_id: '',
      quantite_demandee: '',
      priorite: 'normale',
      commentaire: '',
      date_limite: ''
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.produit_id || !form.magasin_id || !form.quantite_demandee) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const payload = {
        produit_id: Number(form.produit_id),
        magasin_id: Number(form.magasin_id),
        quantite_demandee: Number(form.quantite_demandee),
        priorite: form.priorite,
        commentaire: form.commentaire.trim() || null,
        date_limite: form.date_limite || null,
        user_id: user.id,
        statut: 'en_attente'
      };

      if (editing && editing.id) {
        await api.put(`/demandes-achat/${editing.id}`, payload);
        setSuccess('Demande mise à jour avec succès');
      } else {
        await api.post('/demandes-achat', payload);
        setSuccess('Demande créée avec succès');
      }
      
      closeModal();
      loadData();
    } catch (e) {
      setError(extractApiError(e, 'Erreur lors de la sauvegarde'));
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      return;
    }

    try {
      await api.delete(`/demandes-achat/${id}`);
      setSuccess('Demande supprimée avec succès');
      loadData();
    } catch (e) {
      setError(extractApiError(e, 'Erreur lors de la suppression'));
    }
  };

  const updateStatut = async (id, newStatut) => {
    try {
      await api.patch(`/demandes-achat/${id}`, { statut: newStatut });
      setSuccess('Statut mis à jour avec succès');
      loadData();
    } catch (e) {
      setError(extractApiError(e, 'Erreur lors de la mise à jour du statut'));
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      'en_attente': { color: 'badge-warning', icon: 'fas fa-clock', text: 'En attente' },
      'approuvee': { color: 'badge-success', icon: 'fas fa-check', text: 'Approuvée' },
      'rejetee': { color: 'badge-danger', icon: 'fas fa-times', text: 'Rejetée' },
      'en_cours': { color: 'badge-info', icon: 'fas fa-spinner', text: 'En cours' },
      'terminee': { color: 'badge-secondary', icon: 'fas fa-flag-checkered', text: 'Terminée' }
    };
    
    const statutConfig = config[statut] || config['en_attente'];
    
    return (
      <span className={`badge ${statutConfig.color}`}>
        <i className={`${statutConfig.icon} me-1`}></i>
        {statutConfig.text}
      </span>
    );
  };

  const getPrioriteBadge = (priorite) => {
    const config = {
      'basse': { color: 'badge-info', text: 'Basse' },
      'normale': { color: 'badge-secondary', text: 'Normale' },
      'haute': { color: 'badge-warning', text: 'Haute' },
      'urgente': { color: 'badge-danger', text: 'Urgente' }
    };
    
    const prioriteConfig = config[priorite] || config['normale'];
    
    return (
      <span className={`badge ${prioriteConfig.color}`}>
        {prioriteConfig.text}
      </span>
    );
  };

  const filteredDemandes = useMemo(() => {
    return demandes.sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder = { 'urgente': 4, 'haute': 3, 'normale': 2, 'basse': 1 };
      const priorityDiff = (priorityOrder[b.priorite] || 2) - (priorityOrder[a.priorite] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [demandes]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDemandes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredDemandes.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [demandes]);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="mb-2">
              <i className="fas fa-shopping-cart text-primary me-3"></i>
              Demandes de Réapprovisionnement
            </h1>
            <p className="text-muted mb-0">
              Gérez les demandes d'achat pour réapprovisionner le stock
            </p>
          </div>
          {user?.role !== 'admin' && (
            <button className="btn btn-primary" onClick={openNewDemandeModal}>
              <i className="fas fa-plus me-2"></i>
              Nouvelle Demande
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success mb-4">
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </div>
        )}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-3">
            <div className="stat-card">
              <div className="stat-number text-warning">
                <i className="fas fa-clock me-3"></i>
                {demandes.filter(d => d.statut === 'en_attente').length}
              </div>
              <div className="stat-label">En attente</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card">
              <div className="stat-number text-success">
                <i className="fas fa-check me-3"></i>
                {demandes.filter(d => d.statut === 'approuvee').length}
              </div>
              <div className="stat-label">Approuvées</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card">
              <div className="stat-number text-info">
                <i className="fas fa-spinner me-3"></i>
                {demandes.filter(d => d.statut === 'en_cours').length}
              </div>
              <div className="stat-label">En cours</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card">
              <div className="stat-number text-secondary">
                <i className="fas fa-flag-checkered me-3"></i>
                {demandes.filter(d => d.statut === 'terminee').length}
              </div>
              <div className="stat-label">Terminées</div>
            </div>
          </div>
        </div>

        {/* Demandes Table */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                <i className="fas fa-list me-2"></i>
                Demandes ({filteredDemandes.length})
              </h3>
              {totalPages > 1 && (
                <div className="text-muted">
                  Page {currentPage} sur {totalPages}
                </div>
              )}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                                         const csv = [
                       ['Date', 'Produit', 'Magasin', 'Quantité', 'Priorité', 'Statut', 'Demandeur', 'Commentaire'],
                       ...filteredDemandes.map(d => [
                         d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '-',
                         d.produit?.nom || 
                           (Array.isArray(produits) ? produits.find(p => p.id === d.produit_id)?.nom : null) || 
                           `Produit #${d.produit_id}`,
                         d.magasin?.nom || 
                           (Array.isArray(magasins) ? magasins.find(m => m.id === d.magasin_id)?.nom : null) || 
                           `Magasin #${d.magasin_id}`,
                         d.quantite_demandee,
                         d.priorite,
                         d.statut,
                         d.user?.name || 
                           `Utilisateur #${d.user_id}`,
                         d.commentaire || ''
                       ])
                     ].map(row => row.join(',')).join('\n');

                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'demandes-reapprovisionnement.csv';
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
            {paginatedData.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-shopping-cart text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted mt-3">Aucune demande trouvée</h4>
                <p className="text-muted mb-0">
                  Créez votre première demande de réapprovisionnement
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Produit</th>
                      <th>Magasin</th>
                      <th>Quantité</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Demandeur</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((demande) => (
                      <tr key={demande.id}>
                        <td>
                          <div>
                            <strong>
                              {demande.created_at ? new Date(demande.created_at).toLocaleDateString('fr-FR') : '-'}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {demande.created_at ? new Date(demande.created_at).toLocaleTimeString('fr-FR') : ''}
                            </small>
                          </div>
                        </td>
                                                 <td>
                           <div className="d-flex align-items-center">
                             <i className="fas fa-box text-primary me-2"></i>
                             <span>
                                                            {demande.produit?.nom || 
                               (Array.isArray(produits) ? produits.find(p => p.id === demande.produit_id)?.nom : null) || 
                               `Produit #${demande.produit_id}`}
                             </span>
                           </div>
                         </td>
                         <td>
                           <div className="d-flex align-items-center">
                             <i className="fas fa-warehouse text-info me-2"></i>
                             <span>
                                                            {demande.magasin?.nom || 
                               (Array.isArray(magasins) ? magasins.find(m => m.id === demande.magasin_id)?.nom : null) || 
                               `Magasin #${demande.magasin_id}`}
                             </span>
                           </div>
                         </td>
                        <td>
                          <span className="fw-bold">
                            {demande.quantite_demandee}
                          </span>
                        </td>
                        <td>
                          {getPrioriteBadge(demande.priorite)}
                        </td>
                        <td>
                          {getStatutBadge(demande.statut)}
                        </td>
                                                 <td>
                           <div className="d-flex align-items-center">
                             <i className="fas fa-user text-secondary me-2"></i>
                             <span>
                                                            {demande.user?.name || 
                               `Utilisateur #${demande.user_id}`}
                             </span>
                           </div>
                         </td>
                        <td>
                          <div className="d-flex gap-1">
                            {user?.role === 'admin' && demande.statut === 'en_attente' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => updateStatut(demande.id, 'approuvee')}
                                  title="Approuver"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => updateStatut(demande.id, 'rejetee')}
                                  title="Rejeter"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openEditDemandeModal(demande)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => onDelete(demande.id)}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-shopping-cart me-2"></i>
                    {editing && editing.id
                      ? 'Modifier la demande'
                      : 'Nouvelle demande de réapprovisionnement'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>

                <form onSubmit={onSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Produit *</label>
                          <select
                            className="form-control"
                            value={form.produit_id}
                            onChange={(e) =>
                              setForm({ ...form, produit_id: e.target.value })
                            }
                            required
                          >
                            <option value="">Choisir un produit...</option>
                            {produits.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Magasin *</label>
                          <select
                            className="form-control"
                            value={form.magasin_id}
                            onChange={(e) =>
                              setForm({ ...form, magasin_id: e.target.value })
                            }
                            required
                          >
                            <option value="">Choisir un magasin...</option>
                            {magasins.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Quantité demandée *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.quantite_demandee}
                            onChange={(e) =>
                              setForm({ ...form, quantite_demandee: e.target.value })
                            }
                            placeholder="ex: 50"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Priorité</label>
                          <select
                            className="form-control"
                            value={form.priorite}
                            onChange={(e) =>
                              setForm({ ...form, priorite: e.target.value })
                            }
                          >
                            <option value="basse">Basse</option>
                            <option value="normale">Normale</option>
                            <option value="haute">Haute</option>
                            <option value="urgente">Urgente</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="form-group">
                          <label className="form-label">Date limite</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.date_limite}
                            onChange={(e) =>
                              setForm({ ...form, date_limite: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label">Commentaire</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.commentaire}
                            onChange={(e) =>
                              setForm({ ...form, commentaire: e.target.value })
                            }
                            placeholder="Précisions sur la demande..."
                          ></textarea>
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
                      {editing && editing.id ? 'Mettre à jour' : 'Créer'}
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
