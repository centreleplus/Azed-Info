import React, { useState, useMemo } from 'react';
import { 
  BadgeCheck, Wallet, Receipt, Users, ShieldUser,
  FilePlus, BookOpen, Video, GraduationCap, Calendar, 
  Clock, CheckSquare, Store, Package, Sparkles, SlidersHorizontal, RefreshCw, Search, Image, Key
} from 'lucide-react';

export interface MenuItem {
  id: string;
  aliasId?: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface MenuCategory {
  categoryName: string;
  items: MenuItem[];
}

export const updatedMenuCategories: MenuCategory[] = [
  {
    categoryName: "1. Finances & Valideur",
    items: [
      { id: 'receipts', aliasId: 'frais_inscription', label: "Frais d'Inscription", icon: <Wallet className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'reporting', aliasId: 'etats_rapports', label: "États & Rapports (Excel)", icon: <Receipt className="w-4 h-4 stroke-[1.75] text-emerald-600" />, badge: "Excel" },
      { id: 'acceptances', aliasId: 'validation_comptes', label: "Validation de Comptes", icon: <BadgeCheck className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'audits', aliasId: 'audit', label: "Journal d'Audit", icon: <Receipt className="w-4 h-4 stroke-[1.75]" /> },
    ]
  },
  {
    categoryName: "2. Gestion Utilisateurs",
    items: [
      { id: 'users', aliasId: 'lyceens', label: "Lycéens & Comptes", icon: <Users className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'agents', aliasId: 'agents', label: "Gestion des Agents", icon: <ShieldUser className="w-4 h-4 stroke-[1.75]" /> },
    ]
  },
  /* --- SECTION RESTAURÉE : CRÉATION & GESTION DE DOCUMENTS --- */
  {
    categoryName: "3. Documents & Contenus",
    items: [
      { id: 'courses-upload', aliasId: 'nouveau_doc', label: "Nouveau Document", icon: <FilePlus className="w-4 h-4 stroke-[1.75] text-emerald-600" />, badge: "Créer" },
      { id: 'courses-history', aliasId: 'gestion_docs', label: "Gestion Documents", icon: <BookOpen className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'demos', aliasId: 'videos_demo', label: "Vidéos Démo & Extraits", icon: <Video className="w-4 h-4 stroke-[1.75]" /> },
    ]
  },
  {
    categoryName: "4. Pédagogie & Planning",
    items: [
      { id: 'quizzes-upload', aliasId: 'quiz', label: "Quiz & Évaluations", icon: <GraduationCap className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'todo-events', aliasId: 'todo', label: "Devoirs & Exercices", icon: <CheckSquare className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'events', aliasId: 'planning', label: "Planning & Emplois", icon: <Calendar className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'calendar', aliasId: 'calendrier', label: "Calendrier Scolaire", icon: <Clock className="w-4 h-4 stroke-[1.75]" /> },
    ]
  },
  {
    categoryName: "5. Boutique & Offres",
    items: [
      { id: 'shop', aliasId: 'boutique', label: "Catalogue Boutique", icon: <Store className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'packs', aliasId: 'offres_packs', label: "Offres & Formules", icon: <Package className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'signup-offers', aliasId: 'offres_signup', label: "Campagnes Sign-Up", icon: <Sparkles className="w-4 h-4 stroke-[1.75]" /> },
    ]
  },
  {
    categoryName: "6. Système & Configuration",
    items: [
      { id: 'profile', aliasId: 'profil', label: "Profil & Sécurité Admin", icon: <Key className="w-4 h-4 stroke-[1.75] text-amber-600" />, badge: "Sécurité" },
      { id: 'branding', aliasId: 'design-branding', label: "Design & Branding", icon: <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'media-icons', aliasId: 'media-icons', label: "Gestion des GIF & Icônes", icon: <Image className="w-4 h-4 stroke-[1.75]" /> },
      { id: 'updates', aliasId: 'updates', label: "Maintenance & Version", icon: <RefreshCw className="w-4 h-4 stroke-[1.75]" /> },
    ]
  }
];

export interface AdminSidebarProps {
  activeTab?: string;
  setActiveTab?: (id: string) => void;
  currentTab?: string;
  adminSubTab?: string;
  onSelectSubTab?: (subTab: string) => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentTab,
  adminSubTab,
  onSelectSubTab,
  className = ""
}) => {
  const [search, setSearch] = useState('');

  const currentActiveId = useMemo(() => {
    return activeTab || adminSubTab || 'receipts';
  }, [activeTab, adminSubTab]);

  const handleSelect = (id: string, aliasId?: string) => {
    const targetId = id || aliasId || '';
    if (setActiveTab) {
      setActiveTab(targetId);
    }
    if (onSelectSubTab) {
      onSelectSubTab(targetId);
    }
  };

  const isItemActive = (item: MenuItem) => {
    return (
      currentActiveId === item.id || 
      currentActiveId === item.aliasId ||
      (currentTab === 'admin' && (adminSubTab === item.id || adminSubTab === item.aliasId))
    );
  };

  return (
    <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col h-full p-4 space-y-4 select-none ${className}`}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
            Panneau Direction
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
            6 Niveaux
          </span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
        {updatedMenuCategories.map((cat, idx) => {
          const filteredItems = cat.items.filter(item =>
            item.label.toLowerCase().includes(search.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1.5">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {cat.categoryName}
              </span>

              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const isActive = isItemActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id, item.aliasId)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-bold shadow-emerald-600/20 ring-1 ring-emerald-700/20'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
