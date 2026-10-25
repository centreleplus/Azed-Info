# Normalisation Universelle du Filtrage des Fichiers & Débogage Visuel Étudiant

Ce plan détaille la centralisation de la logique de normalisation et de filtrage des documents pédagogiques pour l'ensemble des vues de l'espace étudiant, ainsi que l'intégration d'un journal de diagnostic détaillé dans la console du navigateur (`F12`).

## User Review & Critical Decisions

> [!IMPORTANT]
> Les choix d'architecture suivants ont été validés lors de la phase de clarification :

- **Décision confirmée 1 — Architecture centralisée** : Création d'un moteur unique de normalisation et de filtrage partagé par le tableau de bord étudiant et toutes les sections pédagogiques (`Fiches & cours`, `Devoirs & Exercices`, `Zone Correction`, `Révision`).
- **Décision confirmée 2 — Journalisation complète en console** : Émission systématique d'un log de diagnostic (`[DOC-FILTER]` / `[DOC-FILTER-DEBUG]`) pour chaque document évalué, indiquant l'état exact de chaque critère (`Level`, `Filiere`, `Badge`, `Category`, `Submenu`).
- **Décision confirmée 3 — Souplesse sur le trimestre / sous-menu** : Tout document dont le sous-menu ou trimestre est vide, global ou marqué « Tous » est automatiquement autorisé quel que soit le trimestre actif sélectionné par l'élève.

---

## 1. Overview & Core Concept

- **What It Does** : Harmonise toutes les métadonnées des documents (`category`, `submenu`/`trimester`, `levels`/`grade`, `filiere`/`section`, `badges`) et du profil élève via une normalisation sans accents, insensible à la casse, aux espaces et aux séparateurs, afin qu'aucun document éligible ne soit masqué par une variante d'écriture.
- **Target Audience / Persona** :
  - **Élèves connectés** : Accèdent immédiatement à l'intégralité des documents correspondant à leur niveau, leur filière et leur rang d'abonnement dans chaque section.
  - **Administrateurs** : Disposent d'une trace claire dans la console du navigateur (`F12 -> Console`) expliquant pourquoi chaque fichier est accepté ou refusé.
- **Key Value** : Élimine les faux négatifs liés aux formats de chaînes hétérogènes (ex. `"4ème"` vs `"4eme Année"`, `"Sciences de l'Informatique"` vs `"Informatique"`, `"Fiches & cours"` vs `"course"`) et unifie la récupération des documents sur toutes les vues étudiantes.

---

## 2. User Experience & Visual Design

- **Key User Flows** :
  1. **Ouverture du Dashboard ou d'une Section Pédagogique** : Les documents issus du stockage permanent et du serveur sont fusionnés et passés au filtre universel.
  2. **Changement de Trimestre ou de Section** : Le filtre réévalue instantanément les documents selon la section courante (`Fiches & cours`, `Devoirs & Exercices`, `Zone Correction`, `Révision`) et le sous-menu actif (`1er Trimestre`, `2ème Trimestre`, `3ème Trimestre`, `Live Enregistré`).
  3. **Inspection Console (`F12`)** : Chaque évaluation affiche une ligne formatée :
     `[DOC-FILTER] File: "<titre>" | Matched: <true/false> | Reason: Level(<bool>), Filiere(<bool>), Badge(<bool>), Category(<bool>), Submenu(<bool>)`
- **Visual Identity & Theme** :
  - *Aesthetic Direction* : Conservation stricte du design existant de l'espace étudiant (cartes épurées, badges d'accès colorés, typographie lisible).
  - *Interactive Feedback* : Mise à jour réactive sans rechargement de page dès qu'un document est publié, modifié ou supprimé en administration.

---

## 3. Key Product Decisions & Trade-Offs

- **Décision 1 : Normalisation canonique et matching multi-valeurs souple**
  - *Approche choisie* : Nettoyage systématique (`toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")`) combiné à la détection des mots-clés racines pour les niveaux (`1`, `2`, `3`, `4`/`bac`), les filières (`info`/`sti`, `math`, `exp`/`svt`, `tech`, `eco`/`gest`, `lettr`, `sport`, `tronc commun`) et les catégories.
  - *Pourquoi* : Permet de faire correspondre un document ciblant plusieurs niveaux ou filières (sous forme de tableau ou de chaîne séparée par des virgules) avec le profil de l'élève sans perte.
- **Décision 2 : Unification des sources dans toutes les vues étudiantes**
  - *Approche choisie* : Garantir que la vue `Devoirs & Exercices`, la vue `Fiches & cours`, la `Zone Correction` et la bibliothèque du Dashboard lisent toutes la source unifiée (serveur + stockage local permanent) et appliquent le même helper central.
  - *Pourquoi* : Évite qu'un document créé en administration apparaisse sur le résumé du dashboard mais manque dans l'onglet dédié `Devoirs & Exercices` ou `Zone Correction`.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Stockage Unifié (Serveur + LocalStorage + IDB)              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Moteur Central de Normalisation & Filtrage               │
│  • normalizeString(str) : sans accents, minuscule, trim                 │
│  • Algorithme 5 critères : Category, Submenu, Level, Filiere, Badge     │
│  • Journal Console : [DOC-FILTER] / [DOC-FILTER-DEBUG]                  │
└───────┬───────────────────┬───────────────────────┬─────────────────────┘
        │                   │                       │
        ▼                   ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌─────────────────────────────┐
│ Dashboard     │   │ Fiches & Cours /  │   │ Zone Correction             │
│ Bibliothèque  │   │ Devoirs & Exos    │   │ (Corrections & Live Replay) │
└───────────────┘   └───────────────────┘   └─────────────────────────────┘
```

### Data Model & Matching Rules

1. **Fonction `normalizeString(str)`** :
   - Transforme toute valeur en chaîne minuscule sans diacritiques ni espaces superflus.
2. **Critère 1 — Catégorie (`categoryMatch`)** :
   - Compare la catégorie normalisée et le `contentType` du document avec la section active (`Fiches & cours`, `Devoirs & Exercices`, `Zone Correction`, `Révision`, `Quiz`), ou valide si la catégorie du document contient la section courante (ou est hybride).
3. **Critère 2 — Sous-menu / Trimestre (`submenuMatch`)** :
   - Si aucun sous-menu n'est filtré ou si le sous-menu du document est vide / `"tous"` / `"all"`, `submenuMatch = true`.
   - Sinon, compare les identifiants canoniques de trimestre (`1er trimestre`, `2eme trimestre`, `3eme trimestre`, `revision`).
4. **Critère 3 — Niveau Scolaire (`levelMatch`)** :
   - Si `doc.levels` / `doc.grade` est vide ou contient `"tous"`, `levelMatch = true`.
   - Sinon, vérifie la correspondance souple entre la liste des niveaux du document et le niveau de l'élève (`"1ere"`, `"2eme"`, `"3eme"`, `"4eme"`/`"bac"`).
5. **Critère 4 — Filière / Section (`filiereMatch`)** :
   - Si `doc.filiere` / `doc.section` / `doc.target.streams` est vide ou contient `"toutes"` / `"tous"`, `filiereMatch = true`.
   - Sinon, vérifie si l'une des filières normalisées du document correspond à celle de l'élève (ou Tronc Commun / 1ère année).
6. **Critère 5 — Badge & Hiérarchie (`badgeMatch`)** :
   - Compare le rang hiérarchique du badge de l'élève (`FREEMIUM: 0`, `ESSENTIEL: 1`, `LIVE+: 2`, `REVISION+: 3`, `INTEGRAL: 4`) au rang minimum requis par le document (`userRank >= requiredRank`), ou vérifie l'inclusion directe dans la liste des badges autorisés.
7. **Journalisation Console (`[DOC-FILTER]`)** :
   - Affiche systématiquement pour chaque document évalué :
     `console.log(\`[DOC-FILTER] File: "${doc.title}" | Matched: ${isMatch} | Reason: Level(${levelMatch}), Filiere(${filiereMatch}), Badge(${badgeMatch}), Category(${categoryMatch}), Submenu(${submenuMatch})\`)`
