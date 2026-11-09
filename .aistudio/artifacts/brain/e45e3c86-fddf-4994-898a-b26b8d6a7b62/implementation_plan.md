# Unification du Pipeline d'Upload, Persistance Atomique & Synchronisation WebSocket Globale

Ce plan unifie de bout en bout le flux de publication et de mise à jour des ressources pédagogiques sur la plateforme A-Zed Info : transfert binaire via `Multipart FormData` avec contrôle d'intégrité anti-fichier vide, stockage disque permanent via Multer couplé à une écriture atomique en base de données, et diffusion WebSocket instantanée vers l'ensemble des sessions élèves et administrateurs connectées sans rechargement de page.

## Validation Utilisateur & Décisions Clés

> [!IMPORTANT]
> Les choix d'architecture et d'expérience utilisateur suivants ont été confirmés lors de la phase de clarification et gouvernent l'implémentation :

- **Décision Confirmée 1 (Gestion des fichiers lors d'une modification)** : Lorsqu'un administrateur modifie les métadonnées d'un document existant sans joindre de nouveau fichier, le serveur conserve automatiquement le fichier et l'URL permanente existants (`/uploads/...`) sauf suppression explicite.
- **Décision Confirmée 2 (Signalement temps réel côté élève)** : Lorsqu'un document est publié ou mis à jour par l'administrateur, les vues élèves concernées actualisent directement leur liste en temps réel et affichent une notification discrète informant de la disponibilité immédiate de la ressource.
- **Décision Confirmée 3 (Format de transfert & Redirection)** : Envoi principal en `Multipart FormData` (sans écrasement manuel du `Content-Type`) avec repli JSON/Base64 en secours, suivi d'une redirection automatique vers la gestion des documents après validation `200/201 OK` du serveur.

---

## 1. Vue d'Ensemble & Concept Fondamental

- **Fonctionnement Global** : Lorsqu'un administrateur publie ou met à jour un support pédagogique (PDF, script Python, image ou lien vidéo), le fichier binaire et ses métadonnées (titre, chapitre, catégorie, trimestre, niveaux scolaires, filières et forfaits autorisés) sont transmis au serveur central. Le serveur valide que le fichier n'est pas vide (`> 0` octet), l'écrit dans le stockage permanent `/uploads/`, met à jour la base de données de manière atomique, puis diffuse l'événement `SYNC_NEW_DOCUMENT` sur le canal WebSocket global.
- **Public Cible** :
  - *Administrateurs* : disposent d'un retour serveur fiable (zéro faux positif local) et retrouvent immédiatement leurs publications dans la liste de gestion.
  - *Élèves connectés* : voient apparaître instantanément les nouveaux cours, devoirs, corrigés et supports de révision correspondant à leur classe, filière et forfait avec une notification discrète, sans rafraîchir leur navigateur.
- **Valeur Ajoutée** : Élimination définitive des fichiers corrompus (`0 octet`), des URL `blob:` volatiles et des désynchronisations entre l'interface d'administration et l'espace étudiant.

---

## 2. Expérience Utilisateur & Design Visuel

- **Parcours Utilisateur Clés** :
  1. **Sélection & Contrôle d'Intégrité (Admin)** : Dès la sélection d'un fichier depuis un disque local ou externe, l'interface vérifie sa taille. Si `file.size === 0`, une alerte bloque immédiatement la sélection et réinitialise le champ.
  2. **Soumission & Validation Serveur (Admin)** : Au clic sur l'action de publication ou de mise à jour, le bouton affiche un état de chargement actif et bloque les doubles soumissions jusqu'à la réponse `200/201 OK` du serveur, puis redirige vers la vue de gestion des documents.
  3. **Réception Temps Réel & Notification Discrète (Élève)** : À la réception du signal WebSocket `SYNC_NEW_DOCUMENT`, le store global et les listes des quatre sections étudiantes (*Fiches & cours*, *Devoirs & Exercices*, *Zone Correction*, *Révision*) s'actualisent en ordre croissant (FIFO) et affichent un bandeau/toast discret confirmant l'arrivée du document.
- **Identité Visuelle & Thème (SaaS Académique Haute Densité)** :
  - *Direction Esthétique* : Interface académique structurée à profondeur unique (`border border-slate-200`), privilégiant la clarté de lecture et la hiérarchie fonctionnelle.
  - *Palette & Contrastes* : Canevas neutre dominant (`#F8FAFC` / `#FFFFFF` à 60 %), surfaces structurelles (`#F1F5F9` et bordures fines `#E2E8F0` à 30 %), et budget d'accentuation (10 %) réservé aux actions primaires (`#2563EB`) et aux retours sémantiques :
    - Succès / Synchronisation temps réel : Émeraude (`#16A34A` / `#ECFDF5`)
    - Avertissement / Mode Édition : Ambre (`#D97706` / `#FFFBEB`)
    - Erreur / Fichier vide : Carmin (`#DC2626` / `#FEF2F2`)
  - *Typographie & Alignement Tabulaire* : Police d'affichage structurée (`Plus Jakarta Sans` / `Outfit`) associée à une police de corps lisible et à des chiffres tabulaires (`tabular-nums`) pour les tailles de fichiers en Ko, compteurs de documents et horodatages.
- **Feedback Interactif & Mouvement** : Transitions rapides ($\le 200\text{ms}$) basées uniquement sur `opacity` et `transform`, indicateur de chargement explicite pendant l'écriture disque, et toast non intrusif s'estompant automatiquement après quelques secondes côté étudiant.

---

## 3. Décisions Produit & Arbitrages Techniques

- **Décision 1 : Transfert Multipart FormData Natif avec Secours JSON**
  - *Approche retenue* : Construire une instance `FormData` native contenant le binaire `file` et les métadonnées sérialisées sans définir manuellement d'en-tête `Content-Type`, afin que le navigateur injecte automatiquement la directive `multipart/form-data; boundary=...`.
  - *Pourquoi* : Évite la surcharge mémoire du Base64 pour les fichiers PDF/vidéo volumineux tout en garantissant une compatibilité totale avec le middleware Multer côté serveur.
  - *Alternative écartée* : Envoi exclusivement en JSON Base64 ou définition manuelle de `Content-Type: multipart/form-data` sans `boundary` (qui empêche le serveur de décoder les champs).
- **Décision 2 : Zéro Rendu Optimiste & Désactivation du Fallback Local sur les Mutations**
  - *Approche retenue* : Interdire à l'intercepteur client de simuler une réponse `201 Created` locale lors des requêtes `POST`, `PUT` et `DELETE` sur les routes de documents. L'état local n'est mis à jour qu'après réception du document validé et horodaté par le serveur.
  - *Pourquoi* : Garantit qu'aucun document n'apparaît dans l'historique de l'administrateur s'il n'a pas été réellement écrit sur le disque et en base de données centrale.
- **Décision 3 : Persistance Atomique Avant Diffusion WebSocket**
  - *Approche retenue* : Écrire d'abord le fichier physique dans `/uploads/`, vérifier que sa taille sur disque est strictement supérieure à `0 octet`, sauvegarder de manière synchrone la base de données centrale, puis émettre les événements WebSocket `SYNC_NEW_DOCUMENT`, `NEW_DOCUMENT_PUBLISHED` et `COURSES_UPDATED`.
  - *Pourquoi* : Assure que lorsque les clients élèves reçoivent la notification temps réel et cliquent sur « Consulter », le fichier est déjà disponible sur `/uploads/...` sans erreur `404` ni `ERR_FILE_NOT_FOUND`.

---

## 4. Architecture Technique & Stratégie de Données

### Schéma d'Architecture & Flux de Synchronisation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        INTERFACE ADMINISTRATEUR                              │
│  ┌────────────────────────────────────┐   ┌───────────────────────────────┐  │
│  │ Formulaire Création / Édition      │   │ Gestion des Documents         │  │
│  │ • Validation client (size > 0)     │──▶│ • Liste paginée & filtrée     │  │
│  │ • Construction FormData natif      │   │ • Redirection auto post-201   │  │
│  └─────────────────┬──────────────────┘   └───────────────▲───────────────┘  │
└────────────────────┼──────────────────────────────────────┼──────────────────┘
                     │ POST / PUT (Multipart FormData)      │
                     ▼                                      │
┌───────────────────────────────────────────────────────────┼──────────────────┐
│                        SERVEUR CENTRAL (EXPRESS + WS)     │                  │
│  ┌────────────────────────────────────────────────────────┴───────────────┐  │
│  │ Middleware Multer & Contrôleur Atomique                                │  │
│  │ 1. Décodage multipart (fichier binaire + métadonnées JSON)             │  │
│  │ 2. Contrôle d'intégrité (buffer > 0 octet) ou conservation en édition  │  │
│  │ 3. Écriture physique dans /uploads/ et génération d'URL permanente     │  │
│  │ 4. Sauvegarde atomique dans la Base de Données centrale                │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
│                                       │                                      │
│  ┌────────────────────────────────────▼───────────────────────────────────┐  │
│  │ Diffuseur WebSocket Temps Réel (/ws)                                   │  │
│  │ • Émission globale : SYNC_NEW_DOCUMENT / NEW_DOCUMENT_PUBLISHED        │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │ Diffusion instantanée (WebSocket)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     CLIENT SYNC & ESPACES ÉTUDIANTS                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Gestionnaire Temps Réel Global (WebSocket + BroadcastChannel)          │  │
│  │ • Normalisation idempotente du document reçu & mise à jour du store    │  │
│  │ • Invalidation du cache de session & déclenchement d'une notif discrète│  │
│  └─────────┬──────────────────┬───────────────────┬───────────────────┬───┘  │
│            ▼                  ▼                   ▼                   ▼      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐ ┌──────────┐  │
│  │ Fiches & Cours   │ │ Devoirs & Exos   │ │ Zone Correction │ │ Révision │  │
│  │ (Tri FIFO 1 ➔ N) │ │ (Tri FIFO 1 ➔ N) │ │ (Tri FIFO 1 ➔ N)│ │ (FIFO)   │  │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘ └──────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Modèle de Données & États
- **Entité Document Normalisée** :
  - `id` : Identifiant unique persistant généré ou conservé lors d'une mise à jour.
  - `title`, `chapterTitle`, `category`, `trimester` : Métadonnées de classement pédagogique et d'affichage séquentiel (FIFO).
  - `fileUrl`, `supportUrl`, `videoUrl` : URL serveur permanente (`/uploads/doc_<timestamp>_<nom_nettoye>.<ext>`) ou lien externe validé, excluant strictement tout schéma `blob:`.
  - `target` (`gradeLevels`, `streams`, `userCategories`) & `allowedBadges` : Règles de ciblage multi-niveaux, multi-filières et hiérarchie de forfaits (`FREEMIUM` à `INTÉGRALE`).

### Correspondance Composants & Gestionnaires d'Événements
- **Sélecteur de Fichier & Soumission Admin** :
  - `onChange` (Input File) : Vérifie `file.size === 0` ; en cas d'erreur, affiche un message explicite, vide l'input et empêche l'état invalide.
  - `onSubmit` (Formulaire) : Assemble le `FormData`, envoie la requête vers le serveur sans en-tête `Content-Type` forcé, attend la confirmation `res.ok`, met à jour le store local avec la réponse serveur, puis redirige vers la liste de gestion des documents.
  - En mode édition (`PUT`), si aucun nouveau fichier n'est sélectionné et que le fichier actuel n'a pas été supprimé, transmet `keepExistingFile: "true"` et l'URL permanente actuelle afin que le serveur préserve le support existant.
- **Récepteur WebSocket & Notification Discrète Côté Élève** :
  - `ws.onmessage` : À la réception de `SYNC_NEW_DOCUMENT` ou `NEW_DOCUMENT_PUBLISHED`, normalise le document de façon idempotente (mise à jour sur place si l'`id` existe déjà, insertion sinon), purge le cache de session étudiant, rafraîchit instantanément la liste active et affiche un toast discret indiquant le titre du document synchronisé.
