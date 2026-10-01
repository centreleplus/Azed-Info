import React, { useState, useEffect } from 'react';
import { AccessTierSelector } from '../../components/AccessTierSelector';
import { StudentTier } from '../../types/access';
import { ListTodo, Check, Calendar, Plus, Trash2 } from 'lucide-react';

export interface AdminTodoProps {
  onSuccess?: (todo: any) => void;
}

export const AdminTodo: React.FC<AdminTodoProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [grade, setGrade] = useState('4ème');
  const [section, setSection] = useState('Tous');
  const [notes, setNotes] = useState('');
  // FREEMIUM coché par défaut
  const [allowedTiers, setAllowedTiers] = useState<StudentTier[]>(['FREEMIUM']);
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todo-events');
      if (res.ok) {
        const data = await res.json();
        setTodos(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) {
      setMessage("Veuillez remplir le titre et la date d'échéance.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        name: name.trim(),
        dueDate,
        grade,
        section,
        notes,
        allowedTiers,
        targetTiers: allowedTiers,
        isPremium: !allowedTiers.includes('Freemium')
      };

      const res = await fetch('/api/todo-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setMessage("Devoir / Tâche créé avec succès ! 📝");
        setName('');
        setDueDate('');
        setNotes('');
        setAllowedTiers(['Freemium', 'Essentiel']);
        fetchTodos();
        if (onSuccess) onSuccess(created);
      } else {
        setMessage("Erreur lors de la création du devoir.");
      }
    } catch (e: any) {
      setMessage(e.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-left">
      <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs">
        <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-2">
          <ListTodo className="text-pink-600" size={18} />
          <span>Planificateur de Devoirs & Tâches (To-Do)</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Assignez les devoirs aux catégories autorisées (Freemium, Essentiel, Live +, Révision +, Intégrale).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-slate-100 rounded-2xl p-6 bg-white space-y-5 shadow-xs">
        {message && (
          <div className="p-3 bg-pink-50 border border-pink-200 text-pink-800 rounded-xl text-xs font-bold">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titre du Devoir *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Série d'exercices Chapitre 2"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date d'échéance *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          {/* Access Tiers : Freemium, Essentiel, Live +, Révision +, Intégrale */}
          <AccessTierSelector
            selectedTiers={allowedTiers}
            onChange={(tiers) => setAllowedTiers(tiers)}
            label="Catégories autorisées pour ce devoir (Freemium et Essentiel cochés par défaut)"
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Consignes / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Consignes facultatives..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>{loading ? "Planification en cours..." : "Planifier le Devoir"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminTodo;
