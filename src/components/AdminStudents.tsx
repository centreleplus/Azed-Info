import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';
import { User } from '../types';
import { AdminStudentTable } from './AdminStudentTable';

export interface AdminStudentsProps {
  students?: User[];
  onToggleBlock?: (student: User) => void;
  onEditStudent?: (student: User) => void;
  onRequestDelete?: (student: User) => void;
  onGroupChange?: (studentId: string, group: string) => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({
  students = [],
  onToggleBlock = () => {},
  onEditStudent = () => {},
  onRequestDelete = () => {},
  onGroupChange = () => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Tous');
  const [selectedGrade, setSelectedGrade] = useState('Tous');
  const [selectedAccountType, setSelectedAccountType] = useState('Tous');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.highSchool && s.highSchool.toLowerCase().includes(q));

      const matchBranch = selectedBranch === 'Tous' || s.section === selectedBranch;
      const matchGrade = selectedGrade === 'Tous' || s.grade === selectedGrade;
      const matchType = selectedAccountType === 'Tous' || s.accountType === selectedAccountType;

      return matchSearch && matchBranch && matchGrade && matchType;
    });
  }, [students, searchQuery, selectedBranch, selectedGrade, selectedAccountType]);

  const handleExportExcel = () => {
    try {
      const rows = filteredStudents.map((s) => ({
        'Identifiant': s.id,
        'Nom & Prénom': s.fullName,
        'Email': s.email,
        'Téléphone': s.phone || 'N/A',
        'Ville': s.city || 'N/A',
        'Lycée / Établissement': s.highSchool || 'N/A',
        'Niveau Académique': s.grade || '4éme',
        'Filière / Branche': s.section || 'Non spécifiée',
        'Groupe d\'Étude': s.studyGroup || (s as any).groupe_etude || 'Sans groupe',
        'Type de Compte': s.accountType === 'premium' ? '⭐ Premium' : 'Gratuit',
        'Statut': s.status === 'disabled' ? 'Bloqué' : 'Actif',
        'Date d\'Inscription': s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-FR') : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Répertoire Élèves');
      XLSX.writeFile(wb, `Eleves_${selectedBranch !== 'Tous' ? selectedBranch : 'Toutes_Filieres'}_2026.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'export Excel.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            Répertoire & Gestion des Élèves
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Visualisez et gérez l'ensemble des apprenants inscrits par filière académique (Sciences de l'Informatique, Mathématiques, Sciences Expérimentales, Sciences Techniques, Économie & Gestion, Lettres, Sport).
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download size={16} />
          Exporter sur Excel ({filteredStudents.length})
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, lycée, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous les niveaux</option>
              <option value="1ère">1ère Année</option>
              <option value="2ème">2ème Année</option>
              <option value="3ème">3ème Année</option>
              <option value="4éme">4ème Année (Bac)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Toutes les filières</option>
              {ALL_SECTIONS_OPTIONS.filter(s => s !== 'Tous').map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous les forfaits</option>
              <option value="freemium">Gratuit / Freemium</option>
              <option value="premium">⭐ Premium / Forfaits Payants</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Branch Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filière :
          </span>
          {ALL_SECTIONS_OPTIONS.map((sec) => {
            const isSelected = selectedBranch === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedBranch(sec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-2xs font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Table */}
      <AdminStudentTable
        students={filteredStudents}
        onToggleBlock={onToggleBlock}
        onEditStudent={onEditStudent}
        onRequestDelete={onRequestDelete}
        onGroupChange={onGroupChange}
      />
    </div>
  );
};

export default AdminStudents;
