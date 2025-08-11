# Gestion du Stock des Produits de Nettoyage - Frontend React

## 🎯 Objectif du module
Permettre une gestion efficace du stock de produits de nettoyage utilisés pour les opérations d'entretien, incluant :
- Le suivi des quantités
- La gestion des entrées/sorties
- Les demandes de réapprovisionnement

## ✅ Fonctionnalités développées

### 🔐 Authentification et gestion des accès
- **Login/Logout** avec token JWT
- **Rôles utilisateurs** : `admin` et `utilisateur`
- **Accès limité** selon le profil utilisateur
- **Routes protégées** avec redirection automatique

### 📦 Catalogue des produits
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Informations gérées** :
  - Nom du produit
  - Catégorie
  - Fournisseur
  - Date de péremption
  - Seuil critique
- **Filtres avancés** :
  - Recherche par nom, catégorie, fournisseur
  - Filtre "Stock bas" pour voir les produits critiques
- **Indicateurs visuels** :
  - Affichage du stock actuel
  - Badges "Stock bas" pour les produits critiques
  - Mise en évidence des lignes avec stock insuffisant

### 📊 Visualisation du stock
- **Liste des stocks** par magasin avec pagination
- **Filtres** par magasin et produit
- **Quantités disponibles** en temps réel
- **Alertes visuelles** pour produits critiques

### 📋 Bon de sortie
- **Création de bons de sortie** pour consommer des produits
- **Sélection multiple** de produits
- **Déduction automatique** du stock
- **Validation** des quantités disponibles
- **Historique** des mouvements créés

### 📥 Bon d'entrée
- **Création de bons d'entrée** pour ajouter des produits
- **Sélection multiple** de produits
- **Ajout automatique** au stock
- **Traçabilité** complète des entrées

### 🔄 Transfert entre magasins
- **Formulaire simple** pour transférer des produits
- **Sélection** source et destination
- **Mise à jour automatique** des stocks
- **Création de mouvements** liés

### 📈 Historique des mouvements
- **Affichage complet** de l'historique des entrées, sorties, transferts
- **Filtrage avancé** :
  - Par type de mouvement (entrée, sortie, transfert)
  - Par produit
  - Par magasin
  - Par date (du/au)
- **Informations détaillées** : utilisateur, quantité, date

### 🏠 Dashboard
- **Vue d'ensemble** avec statistiques :
  - Nombre total de produits
  - Nombre de magasins
  - Nombre de lignes de stock
- **Alertes de stock bas** :
  - Liste des produits critiques
  - Affichage du stock actuel vs seuil
  - Badges visuels d'alerte
  - Compteur d'alertes

### 👥 Gestion des utilisateurs (Admin uniquement)
- **CRUD complet** des utilisateurs
- **Gestion des rôles** (admin/utilisateur)
- **Modification des mots de passe**
- **Accès restreint** aux administrateurs

## 🛠️ Technologies utilisées

- **React 19** avec hooks
- **React Router v6** pour la navigation
- **Axios** pour les appels API
- **Bootstrap 5** pour l'interface responsive
- **Context API** pour la gestion d'état global

## 🚀 Installation et démarrage

1. **Installer les dépendances** :
```bash
cd frontend
npm install
```

2. **Configurer l'API** (optionnel) :
Créer un fichier `.env` :
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

3. **Démarrer l'application** :
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Variables d'environnement
- `REACT_APP_API_BASE_URL` : URL de l'API Laravel (défaut: `http://localhost:8000/api`)

### Rôles utilisateurs
- **`admin`** : Accès complet à toutes les fonctionnalités
- **`utilisateur`** : Accès limité (pas de gestion des utilisateurs)

## 📱 Interface utilisateur

### Navigation
- **Dashboard** : Vue d'ensemble et alertes
- **Produits** : Gestion du catalogue
- **Stocks** : Visualisation des stocks
- **Bon d'Entrée** : Création d'entrées
- **Bon de Sortie** : Création de sorties
- **Transferts** : Transfert entre magasins
- **Mouvements** : Historique des opérations
- **Utilisateurs** : Gestion des utilisateurs (admin)

### Fonctionnalités responsives
- Interface adaptée mobile/desktop
- Navigation collapsible sur mobile
- Tableaux avec scroll horizontal
- Formulaires optimisés pour tous les écrans

## 🔒 Sécurité

- **Authentification** par token JWT
- **Intercepteurs Axios** pour gestion automatique des tokens
- **Redirection automatique** en cas d'expiration
- **Protection des routes** selon les rôles
- **Validation côté client** des formulaires

## 📊 Fonctionnalités secondaires implémentées

- ✅ **Système d'alerte** pour seuil critique avec notifications visuelles
- ✅ **Interface de transfert** entre magasins
- ✅ **Filtrage avancé** des produits et mouvements
- ✅ **Indicateurs visuels** pour les stocks bas
- ✅ **Gestion des dates** de péremption
- ✅ **Traçabilité complète** des opérations

## 🎨 Améliorations UX

- **Loading states** pour tous les appels API
- **Messages d'erreur** contextuels
- **Confirmations** pour les actions destructives
- **Feedback visuel** pour les actions réussies
- **Formulaires intuitifs** avec validation
- **Interface moderne** avec Bootstrap 5
