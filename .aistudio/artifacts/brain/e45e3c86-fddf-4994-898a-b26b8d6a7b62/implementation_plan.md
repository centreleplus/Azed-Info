# Implementation Plan

## 1. Fix Infinite Loading (`src/components/CorrectionView.tsx`)
*   Wrap the `fetchCorrections` function in a `try-catch-finally` structure.
*   Ensure `loading` is set to `false` in the `finally` block to stop the spinner.
*   Update the JSX to check `exercises.length === 0` and display "Aucun exercice corrigé pour ce trimestre." when no data exists, alongside error handling.

## 2. Hierarchical Badge Access (`server.ts`)
*   Define the badge hierarchy: `['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL']`.
*   Update `GET /api/student/documents` to fetch the student's current badge and the document's required badge.
*   Normalize both using `normalizeBadge()`.
*   Grant access if `studentBadgeIndex >= requiredBadgeIndex`.

## 3. Notification UI Unification (`src/App.tsx`, `NotificationsDropdown.tsx`)
*   Locate the duplicate notification bell in the main layout/header components and remove it.
*   Ensure the remaining green bell component has the requested CSS (`position: absolute`, `max-height: 400px`, `overflow-y: auto`).
*   Update the modal header in `NotificationsDropdown.tsx` to include the `✓` and `🗑️` buttons.
