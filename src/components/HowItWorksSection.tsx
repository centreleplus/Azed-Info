import React, { useState, useEffect } from 'react';
import { UserPlus, BookOpen, CreditCard, Award, Play } from 'lucide-react';

export interface Step {
  id: number;
  badgeNumber: string;
  title: string;
  description: string;
  icon: React.ElementType;
  colorBg: string;
  colorText: string;
  videoUrl: string;
}

const ICONS_BY_ID: Record<number, React.ElementType> = {
  1: UserPlus,
  2: BookOpen,
  3: CreditCard,
  4: Award
};

const COLORS_BY_ID: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  2: { bg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400' },
  3: { bg: 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400', text: 'text-pink-600 dark:text-pink-400' },
  4: { bg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400' }
};

const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2] && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : trimmed;
};

const DEFAULT_STEPS: Step[] = [
  {
    id: 1,
    badgeNumber: '1',
    title: 'Crée ton compte',
    description: 'Inscription gratuite et rapide en 30 secondes chrono pour accéder à l\'espace élève.',
    icon: UserPlus,
    colorBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    colorText: 'text-emerald-600 dark:text-emerald-400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    badgeNumber: '2',
    title: 'Choisis ta formule',
    description: 'Sélectionne le pack idéal selon tes besoins, tes objectifs et ton niveau.',
    icon: BookOpen,
    colorBg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    colorText: 'text-blue-600 dark:text-blue-400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    badgeNumber: '3',
    title: 'Recharge ton solde',
    description: 'Active tes cours, fiches pratiques et outils premium en un clic sécurisé.',
    icon: CreditCard,
    colorBg: 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400',
    colorText: 'text-pink-600 dark:text-pink-400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 4,
    badgeNumber: '4',
    title: 'Révise & Brille !',
    description: 'Pratique le Python, suis les cours en direct et assure ta mention au bac.',
    icon: Award,
    colorBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    colorText: 'text-amber-600 dark:text-amber-400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

interface HowItWorksSectionProps {
  onRegisterClick?: () => void;
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  steps?: Step[];
  isRtl?: boolean;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onRegisterClick,
  badge = "DEMO INTERACTIVE",
  title = "Comment ça marche ?",
  subtitle = "Une méthode d'apprentissage interactive et structurée pour vous guider pas à pas vers la réussite à l'examen national.",
  ctaText = "Commencer gratuitement",
  steps: initialSteps,
  isRtl = false
}) => {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [currentSteps, setCurrentSteps] = useState<Step[]>(initialSteps || DEFAULT_STEPS);

  useEffect(() => {
    // Si des steps ont été passés explicitement par props, les utiliser
    if (initialSteps && initialSteps.length > 0) {
      setCurrentSteps(initialSteps);
      return;
    }

    // Charger les étapes dynamiques depuis le serveur ou le cache local
    const loadDynamicSteps = async () => {
      try {
        const res = await fetch('/api/config/how-it-works');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.steps) && data.steps.length > 0) {
            const mapped: Step[] = data.steps.map((s: any) => ({
              id: s.id,
              badgeNumber: s.badgeNumber || String(s.id),
              title: s.title || '',
              description: s.description || '',
              icon: ICONS_BY_ID[s.id] || UserPlus,
              colorBg: COLORS_BY_ID[s.id]?.bg || 'bg-emerald-100 text-emerald-600',
              colorText: COLORS_BY_ID[s.id]?.text || 'text-emerald-600',
              videoUrl: getEmbedUrl(s.youtubeUrl || s.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ')
            }));
            setCurrentSteps(mapped);
            return;
          }
        }
      } catch (e) {
        // Fallback localStorage
      }

      try {
        const cached = localStorage.getItem('how_it_works_steps');
        if (cached) {
          const data = JSON.parse(cached);
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Step[] = data.map((s: any) => ({
              id: s.id,
              badgeNumber: s.badgeNumber || String(s.id),
              title: s.title || '',
              description: s.description || '',
              icon: ICONS_BY_ID[s.id] || UserPlus,
              colorBg: COLORS_BY_ID[s.id]?.bg || 'bg-emerald-100 text-emerald-600',
              colorText: COLORS_BY_ID[s.id]?.text || 'text-emerald-600',
              videoUrl: getEmbedUrl(s.youtubeUrl || s.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ')
            }));
            setCurrentSteps(mapped);
          }
        }
      } catch (err) {}
    };

    loadDynamicSteps();
  }, [initialSteps]);

  const activeStep = currentSteps.find((s) => s.id === activeStepId) || currentSteps[0];

  return (
    <section id="how-section" className="w-full bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* En-tête de section */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-black uppercase tracking-wider rounded-full">
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* 1. BOUTONS SENSITIFS (Les 4 Étapes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStepId;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`relative text-left p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
                  isRtl ? "text-right" : "text-left"
                } ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-emerald-600 shadow-lg shadow-emerald-900/10 ring-2 ring-emerald-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 shadow-sm opacity-85 hover:opacity-100 hover:shadow-md'
                }`}
              >
                {/* Numéro de badge */}
                <div className={`flex items-center justify-between mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                      isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.badgeNumber}
                  </span>
                  
                  {/* Icône de l'étape */}
                  <div className={`p-2 rounded-xl ${step.colorBg}`}>
                    <Icon className="w-5 h-5"/>
                  </div>
                </div>

                {/* Titre et description */}
                <div>
                  <h3 className={`text-sm font-extrabold mb-1 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {/* Indicateur visuel d'état actif */}
                {isActive && (
                  <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Play className="w-3 h-3 fill-current"/>
                    <span>{isRtl ? "جاري تشغيل الفيديو" : "Vidéo en cours"}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. ZONE D'AFFICHAGE VIDÉO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-md max-w-4xl mx-auto">
          
          {/* Titre de la vidéo actuelle */}
          <div className={`flex items-center justify-between mb-4 px-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isRtl ? `المرحلة ${activeStep.badgeNumber} : ` : `Étape ${activeStep.badgeNumber} : `}
                <span className="text-emerald-600 dark:text-emerald-400">{activeStep.title}</span>
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline-block">
              {isRtl ? "اضغط على أي مرحلة لتغيير الفيديو التوضيحي" : "Cliquez sur une étape pour changer de démonstration"}
            </span>
          </div>

          {/* Player Vidéo Responsive */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200 dark:border-slate-800">
            <iframe
              src={activeStep.videoUrl}
              title={activeStep.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Call To Action Bas de Section */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onRegisterClick}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {ctaText}
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
