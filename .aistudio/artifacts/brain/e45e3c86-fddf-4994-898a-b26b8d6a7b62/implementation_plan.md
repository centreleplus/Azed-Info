# Remplacement des Boutons Administratifs par des Icônes (`#/admin/users`)

Remplacer les boutons textuels (« BLOQUER / DÉBLOQUER », « MODIFIER », « SUPPRIMER ») dans la colonne **« 8. Mesures Administratives »** du tableau de gestion des lycéens (`#/admin/users`) par des boutons d'icônes compacts et accessibles au survol (`title`).

---

## 🔒 Périmètre Strict (Strict Boundary Lock)
- **Fichier unique modifié** : `src/components/admin/AdminUsers.tsx` (exclusivement la cellule de la colonne 8 « Mesures Administratives »).
- **Aucune modification** sur les autres colonnes, la modale d'édition, les filtres, le backend ou les autres vues de l'application.

---

## 🛠️ Modifications Prévues (`src/components/admin/AdminUsers.tsx`)

### 1. Colonne 8 : Boutons d'Icônes Compacts (`flex items-center justify-end gap-2`)
Remplacement des trois boutons avec libellés textuels par trois boutons carrés compacts (`p-2 rounded-lg border transition-all cursor-pointer`) :
1. **Bloquer / Débloquer (`Lock` / `Unlock`)** :
   - **Compte actif** : Icône cadenas verrouillé (`<Lock size={15} />`) en jaune/ambre (`bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100`) avec `title="Bloquer l'accès"`.
   - **Compte bloqué** : Icône cadenas déverrouillé (`<Unlock size={15} />`) en vert émeraude (`bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100`) avec `title="Débloquer l'accès"`.
2. **Modifier (`Edit` / Crayon)** :
   - Icône crayon (`<Edit size={15} />`) en bleu (`bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100`) avec `title="Modifier le compte"`.
3. **Supprimer (`Trash2` / Corbeille)** :
   - Icône corbeille (`<Trash2 size={15} />`) en rouge/rose (`bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100`) avec `title="Supprimer définitivement ce compte"`.
