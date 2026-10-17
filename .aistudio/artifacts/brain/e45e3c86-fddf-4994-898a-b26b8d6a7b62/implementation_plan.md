# Plan de Refactorisation et Synchronisation A-Zed Info

## 1. Migration et Normalisation des Badges
- **Script de Migration** : Mettre à jour `src/scripts/autoGlobalMigration.ts` pour appliquer strictement les 5 badges (`FREEMIUM`, `ESSENTIEL`, `LIVE+`, `REVISION+`, `INTEGRAL`).
- **Normalisation Backend** : Appliquer `normalizeBadge` sur tous les endpoints d'entrée (`POST`/`PUT`) pour les utilisateurs et contenus.
- **Interfaces Admin** : Mettre à jour les dropdowns de badges dans `#/admin/users` et `#/admin/offres-signup` pour n'utiliser que les 5 valeurs autorisées.

## 2. Synchronisation et Contrôle d'Accès
- **Auth Sync** : Vérifier le fonctionnement de `StudentProfileSync.tsx` pour rafraîchir le profil à chaque changement de hash.
- **Accès Documents** : Mettre à jour `GET /api/student/documents` dans `server.ts` pour implémenter la hiérarchie `BADGE_HIERARCHY` et filtrer les documents selon le badge utilisateur.

## 3. Correctifs UI / UX Admin
- **Nouveau Document** : Modifier `AdminNewDoc.tsx` (ou le composant équivalent) pour forcer `setEditingDocId(null)` et `setIsEditing(false)` lors du montage sur la route `#/admin/nouveau-doc`.
- **Admin Logout** : Standardiser et sécuriser `handleAdminLogout` dans `App.tsx` et `AdminHeader.tsx`.

## 4. Système de Notifications Temps Réel
- **Backend (WebSockets)** : Instrumenter les 7 points de déclenchement dans `server.ts` :
  - `FILE_CREATED`, `QUIZ_CREATED`, `CALENDAR_EVENT_CREATED`, `SHOP_PRODUCT_CREATED`, `CART_ACTION`, `WISHLIST_ACTION`, `ORDER_CONFIRMED`.
- **Frontend** : Mettre à jour `StudentNotificationsDropdown.tsx` pour :
  - Écouter les événements WebSockets.
  - Ajouter les boutons `✓` (read-all) et `🗑️` (clear-all).
  - Ajouter le son de notification.
  - Appliquer le CSS strict (`max-height: 400px`, `overflow-y: auto`).
