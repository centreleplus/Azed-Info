# Plan d'Implémentation : Persistance Permanente des Documents en Admin & Affichage Ciblé dans l'Espace Étudiant

## 1. Objectifs & Périmètre Strict

1. **Persistance Permanente en Administration (`#/admin/gestion-docs`)** :
   - Garantir que tous les documents créés ou importés par l'administrateur sont conservés de manière permanente et synchronisés entre le stockage local (`localStorage` : `zed_admin_documents`, `admin_documents`, `zed_documents` + `IndexedDB` pour les données binaires/Base64 volumineuses) et la base de données serveur (`/api/admin/documents` & `/api/courses`).
   - Supprimer toute purge automatique ou écrasement destructif de `fileData`/`blobUrl` lors des rafraîchissements de liste.
   - Verrouiller la suppression : un document ne disparaît de la liste et du stockage **que si et seulement si** l'administrateur clique explicitement sur le bouton de suppression de la ligne et valide la **modale de confirmation**.
   - Mémoriser les identifiants explicitement supprimés (`zed_deleted_document_ids`) pour éviter toute réapparition involontaire lors d'une synchronisation tout en protégeant l'intégralité des documents actifs.

2. **Affichage Cohérent et Direct dans l'Espace Étudiant** :
   - Garantir que chaque document actif présent dans `#/admin/gestion-docs` est immédiatement récupéré et affiché dans la section correspondante de l'espace étudiant (`Fiches & cours`, `Devoirs & Exercices`, `Zone Correction`, `Révision`).
   - Appliquer rigoureusement le ciblage selon :
     - **Catégorie** (`Fiches & cours`, `Devoirs & Exercices`, `Zone Correction`, `Révision`)
     - **Sous-menu / Trimestre** (`1er Trimestre`, `2ème Trimestre`, `3ème Trimestre`, `Live Enregistré` / `Révision`)
     - **Niveau scolaire** (`1ère`, `2ème`, `3ème`, `4ème` ou `Tous les niveaux`)
     - **Filière / Section** (correspondance normalisée sans accents/casse ou `Toutes les filières`)
     - **Privilèges de Badge** (validation hiérarchique du rang de l'élève `userRank >= requiredRank` ou inclusion dans la liste des badges autorisés).

---

## 2. Fichiers Modifiés (Strict Boundary Lock)

- **`/src/utils/documentAccess.ts`** :
  - Ajout de la gestion de `zed_deleted_document_ids` pour suivre uniquement les suppressions administratives explicites.
  - Renforcement de `getStoredDocuments()`, `saveDocument()` et `deleteStoredDocument(docId)` (incluant le nettoyage IndexedDB sur suppression explicite et la préservation intégrale de `fileData`, `blobUrl` et `fileUrl` lors des lectures/fusions).
  - Ajout d'un utilitaire `mergeAndPersistDocuments(apiDocs)` qui fusionne les documents serveur et locaux sans jamais écraser les données de fichier (`fileData` / `blobUrl`) ni supprimer un document local non présent sur le serveur.
- **`/src/components/admin/AdminDocs.tsx` & `/src/components/GestionDocuments.tsx`** :
  - Remplacement de `window.confirm` par une modale de confirmation dédiée avant toute suppression définitive d'une ligne.
  - Utilisation de `mergeAndPersistDocuments` et `deleteStoredDocument` pour garantir la synchronisation permanente entre `localStorage` et le serveur sans perte de fichiers lors du rechargement.
- **`/src/components/StudentDashboard.tsx` & `/src/components/CoursView.tsx`** :
  - Harmonisation de la fusion des documents (`apiDocs` + `getStoredDocuments()`) en filtrant uniquement les documents explicitement supprimés.
  - Vérification et alignement strict du filtrage par catégorie, sous-menu/trimestre, niveau, filière et hiérarchie de badges dans `filterDocuments`.

---

## 3. Étapes de Vérification

1. Vérifier qu'un document créé dans `#/admin/nouveau-doc` persiste dans `#/admin/gestion-docs` après rechargement ou changement d'onglet, avec son fichier PDF ouvrable.
2. Vérifier que le clic sur l'icône de suppression ouvre la modale de confirmation et que seul le bouton de confirmation supprime définitivement le document du tableau, du `localStorage`, d'`IndexedDB` et du serveur.
3. Vérifier que tout document actif apparaît immédiatement dans la section et le trimestre ciblés du tableau de bord étudiant pour les profils correspondants.
4. Exécuter `compile_applet` pour valider l'absence d'erreurs TypeScript ou de build.
