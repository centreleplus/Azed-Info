# Refactoring Plan: Canonical Data Harmonization, Strict Multi-Criteria Filtering & Re-Render Stabilization

Harmonize data keys across backend, client mock fallback, and frontend components, enforce strict 5-condition `AND` filtering (`minBadge`, `grade`, `stream`, `trimester`, `category`), and lock React hook dependencies to primitive values so switching tabs or filtering never triggers infinite re-renders or unauthorized content leaks.

---

## 1. Canonical Data Model & Normalization (`src/types.ts`, `src/utils/documentAccess.ts`, `server.ts`)

Establish canonical field normalizers and enrichers so every document and user profile exposes identical, standardized properties across admin, backend, mock store, and student views:

- **`grade` (Niveau Scolaire)**: Normalized to `"1ère"`, `"2ème"`, `"3ème"`, `"4ème"`, or `"ALL"` (mapping `"Tous"`, `"Tous les niveaux"`, `"4ème Bac"`, etc. to their canonical values).
- **`stream` (Filière)**: Normalized to `"Sciences de l'Informatique"`, `"Mathématiques"`, `"Sciences Expérimentales"`, `"Sciences Techniques"`, `"Économie & Gestion"`, `"Lettres"`, `"Sport"`, or `"ALL"` (mapping `section`, `target.streams`, `"Toutes les filières"`, `"Tous"`, etc.).
- **`minBadge` (Badge Requis)**: Normalized to `"FREEMIUM" | "ESSENTIEL" | "LIVE+" | "REVISION+" | "INTEGRAL"` with numeric rank mapping `USER_RANK = { "FREEMIUM": 0, "ESSENTIEL": 1, "LIVE+": 2, "REVISION+": 3, "INTEGRAL": 4 }`.
- **`trimester` (Période Académique)**: Normalized to `"1er Trimestre"`, `"2ème Trimestre"`, `"3ème Trimestre"`, or `"Live Enregistré"` (mapping `trimestre`, `academicPeriod`, `"1ere trimestre"`, `"revision"`, etc.).
- **`category` (Catégorie)**: Normalized to `"Fiches & cours"`, `"Devoirs & Exercices"`, `"Zone Correction"`, `"Révision"`, or `"Quiz Interactifs"`.

---

## 2. Strict 5-Condition `AND` Filtering (`server.ts`, `src/utils/documentAccess.ts`, `src/utils/clientApiFallback.ts`)

Unify `doesDocumentMatchStudentCriteria` on both backend (`server.ts`), client mock fallback (`src/utils/clientApiFallback.ts`), and frontend (`src/utils/documentAccess.ts`) so that a document is only visible to a student if **ALL 5 conditions** evaluate to `true`:

1. **Badge Rank**: `USER_RANK[user.badge] >= USER_RANK[doc.minBadge]`
2. **Grade Level**: `doc.grade === user.grade || doc.grade === "ALL"`
3. **Stream / Filière**: `doc.stream === user.stream || doc.stream === "ALL"`
4. **Trimester**: `doc.trimester === selectedTrimester` (when a trimester filter is active)
5. **Category**: `doc.category === activeCategory` (when a category filter is active)

- **Absolute Rule**: Even if a student holds the `"INTEGRAL"` badge, conditions 2, 3, 4, and 5 remain strictly mandatory—an `"INTEGRAL"` student never sees documents belonging to another grade level or stream.
- **Client Mock Sync (`src/utils/clientApiFallback.ts`)**: Update mock `/api/courses`, `/api/corrections`, `/api/student/documents`, `/api/student/devoirs`, and `/api/quizzes` handlers to normalize seed items with canonical `grade`, `stream`, `minBadge`, `trimester`, and `category` fields and apply the exact same 5-condition filter.

---

## 3. Re-Render Stabilization & Empty-State UX (`CorrectionView.tsx`, `CoursView.tsx`, `DevoirsView.tsx`, `InteractiveQuizModule.tsx`)

Eliminate re-render loops and loading glitches across all student document and quiz views:

- **Primitive Hook Dependencies**: Remove whole `user` / `effectiveUser` / `currentUser` object references from `useEffect`, `useCallback`, and `useMemo` dependency arrays. Depend strictly on primitive strings: `[userBadge, userGrade, userStream, selectedTrimester, refreshTrigger]`.
- **Mounted Guard & AbortController**: Preserve `let isMounted = true`, `useCallback`, and `AbortController` cleanup so tab switches never trigger overlapping or redundant API requests.
- **Explicit Empty State**: When the filtered document list is empty after loading completes, render a clean empty-state panel displaying *"Aucun document disponible pour votre filière et ce trimestre"* without re-triggering `loading`.
