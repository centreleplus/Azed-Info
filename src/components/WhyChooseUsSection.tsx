import React from 'react';
import { BookOpen, Zap, CheckCircle, Clock } from 'lucide-react';

interface ReasonItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface WhyChooseUsSectionProps {
  title?: string;
  badge?: string;
  reasons?: ReasonItem[];
  isRtl?: boolean;
}

const DEFAULT_REASONS: ReasonItem[] = [
  { icon: BookOpen, title: "Bibliothèque énorme", desc: "Des milliers d'exercices corrigés et d'annales de bac." },
  { icon: Zap, title: "Solutions optimales", desc: "Méthodes simplifiées et algorithmes expliqués pas à pas." },
  { icon: CheckCircle, title: "Programme officiel", desc: "Contenu 100% conforme au programme ministériel." },
  { icon: Clock, title: "Vidéos & Fiches", desc: "Des capsules courtes et fiches synthétiques de révision." },
];

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({
  title = "Pourquoi nous choisir ?",
  badge = "POURQUOI RÉVISER AVEC NOUS ?",
  reasons = DEFAULT_REASONS,
  isRtl = false
}) => {
  return (
    <section id="why-section" className="w-full bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* En-tête centré */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Grille de cartes blanches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-emerald-100/80 dark:border-slate-800 shadow-sm shadow-emerald-900/5 hover:shadow-md hover:border-emerald-200 transition-all text-center space-y-3 flex flex-col items-center justify-between"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#00b87c] dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <Icon className="w-6 h-6"/>
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUsSection;
