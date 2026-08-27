import React, { useState } from 'react';
import { User, Zap, Star, Crown, Check, X, ArrowLeft, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { OfferPack } from '../types/offers';
import { calculateDiscountedAmount, isEligibleFor20Discount } from '../utils/pricingDiscount';

interface SignUpStepOffersProps {
  offers: OfferPack[];
  onSelectPack: (pack: OfferPack) => void;
  onBack: () => void;
  studentName?: string;
  grade?: string;
  section?: string;
}

export const SignUpStepOffers: React.FC<SignUpStepOffersProps> = ({
  offers,
  onSelectPack,
  onBack,
  studentName = '',
  grade = '4ème Année',
  section = ''
}) => {
  // Mode: 'choose_category' (Freemium vs Premium) | 'premium_tiers' (selection among Premium, Premium+, Premium++)
  const [subView, setSubView] = useState<'choose_category' | 'premium_tiers'>('choose_category');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-5 h-5 max-w-full max-h-full object-contain mx-auto my-auto" />;
      case 'Zap': return <Zap className="w-5 h-5 max-w-full max-h-full object-contain mx-auto my-auto" />;
      case 'Star': return <Star className="w-5 h-5 max-w-full max-h-full object-contain mx-auto my-auto" />;
      case 'Crown': return <Crown className="w-5 h-5 max-w-full max-h-full object-contain mx-auto my-auto" />;
      default: return <Zap className="w-5 h-5 max-w-full max-h-full object-contain mx-auto my-auto" />;
    }
  };

  const activeOffers = offers && offers.length > 0 ? offers.filter(o => o.isActive !== false) : [];
  
  // Find Freemium pack
  const freemiumPack = activeOffers.find(o => o.category === 'FREEMIUM' || o.price === 0) || activeOffers[0];
  
  // Find Premium tier packs
  const premiumPacks = activeOffers.filter(o => o.category !== 'FREEMIUM' && o.price > 0);

  const [selectedPackId, setSelectedPackId] = useState<string>(premiumPacks[0]?.id || 'pack-premium');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {subView === 'choose_category' ? (
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1A2B6D] font-extrabold text-[11px] rounded-full uppercase tracking-wider">
              <Sparkles size={13} /> Étape 2 sur 3 : Choix de la Formule
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              Choisissez votre formule d'accès {studentName ? `pour ${studentName}` : ''}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Profitez de nos ressources fondamentales gratuitement ou accédez à l'expérience intégrale Premium avec les séries complètes et le Sandbox BAC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* OPTION 1: FREEMIUM GRATUIT */}
            <div
              onClick={() => {
                if (freemiumPack) onSelectPack(freemiumPack);
              }}
              className="p-6 md:p-8 rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-lg group relative"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <User className="max-w-full max-h-full object-contain mx-auto my-auto" />
                    </div>
                    <span>{freemiumPack?.badgeLabel || 'Freemium'} 🌱</span>
                  </span>
                  <span className="font-extrabold text-sm text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    0 DT / Gratuit
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-xl">
                  {freemiumPack?.title || 'Accès Libre Découverte'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                  {freemiumPack?.description || 'Accédez aux résumés de cours fondamentaux et testez le compilateur Python pour débuter sans engagement.'}
                </p>

                <div className="h-px bg-slate-100 my-4" />

                <ul className="space-y-3 mb-6 text-xs text-slate-700">
                  {freemiumPack?.features && freemiumPack.features.length > 0 ? (
                    freemiumPack.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feat.included ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={feat.included ? 'text-slate-800 font-semibold' : 'text-slate-400 line-through'}>
                          {feat.text}
                        </span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-2 font-semibold">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Accès aux chapitres d'initiation</span>
                      </li>
                      <li className="flex items-center gap-2 font-semibold">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <span>Sandbox Python BAC (accès standard)</span>
                      </li>
                      <li className="text-slate-400 line-through flex items-center gap-2 font-medium">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Séries d'exercices corrigés BAC</span>
                      </li>
                      <li className="text-slate-400 line-through flex items-center gap-2 font-medium">
                        <X size={16} className="text-slate-300 shrink-0" />
                        <span>Examens blancs & supports PDF complets</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (freemiumPack) onSelectPack(freemiumPack);
                }}
                className="w-full text-center py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <span>Activer le Freemium Gratuit</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* OPTION 2: FORMULES PREMIUM */}
            <div
              onClick={() => setSubView('premium_tiers')}
              className="p-6 md:p-8 rounded-3xl border-2 border-indigo-500/40 hover:border-[#1A2B6D] bg-white hover:bg-indigo-50/20 transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-lg group relative"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 overflow-hidden text-amber-600">
                      <Crown className="max-w-full max-h-full object-contain mx-auto my-auto" />
                    </div>
                    <span>Formules Complètes ⭐</span>
                  </span>
                  <span className="font-extrabold text-sm text-[#1A2B6D] font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Dès {calculateDiscountedAmount(premiumPacks[0]?.price || 120, grade, section)} DT
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-xl">
                  Abonnements Premium & BAC Intégral
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                  Accès illimité à l'intégralité des sujets de baccalauréat, fiches de révision, vidéos explicatives et soutien pédagogique.
                </p>

                <div className="h-px bg-slate-100 my-4" />

                <ul className="space-y-3 mb-6 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-semibold">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-slate-900">100% des E-Books, Fiches & Exercices BAC</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-slate-900">Sandbox Python Illimité & Sauvegarde Cloud</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-slate-900">Sessions de révision interactives & Examens Blancs</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-slate-900">Badge Élève Vérifié (Premium / Premium+ / Premium++)</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSubView('premium_tiers');
                }}
                className="w-full text-center py-3.5 bg-gradient-to-r from-[#1A2B6D] to-[#2A439B] hover:from-[#132052] hover:to-[#1A2B6D] text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-blue-900/30 flex items-center justify-center gap-2"
              >
                <span>Découvrir les 3 Formules Premium</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={14} /> Retour aux Informations du Profil
            </button>
          </div>
        </div>
      ) : (
        /* PREMIUM TIERS SUB-VIEW: Premium, Premium+, Premium++ */
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-amber-200">
              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 overflow-hidden text-amber-600">
                <Crown className="max-w-full max-h-full object-contain mx-auto my-auto" />
              </div>
              <span>Choisissez votre forfait Premium</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800">
              Formules d'accès complètes ({grade})
            </h2>
            <p className="text-xs text-slate-500">
              Sélectionnez la durée ou le niveau d'accompagnement adapté à vos objectifs d'excellence.
            </p>
          </div>

          <div className={`grid grid-cols-1 ${premiumPacks.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
            {premiumPacks.map((pack: OfferPack) => {
              const isSelected = selectedPackId === pack.id;
              const rawPrice = pack.price || pack.finalPrice || 120;
              const isEligible = isEligibleFor20Discount(grade, section);
              const netPackPrice = calculateDiscountedAmount(rawPrice, grade, section);
              const originalPrice = pack.originalPrice && pack.originalPrice > rawPrice
                ? pack.originalPrice
                : rawPrice;
              const hasDiscount = (isEligible && rawPrice > netPackPrice) || (originalPrice > netPackPrice);
              const displayOriginalPrice = isEligible && originalPrice === rawPrice ? rawPrice : originalPrice;
              const discountPercent = hasDiscount && displayOriginalPrice > 0
                ? Math.round(((displayOriginalPrice - netPackPrice) / displayOriginalPrice) * 100)
                : 0;

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative bg-white ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md'
                  }`}
                >
                  {pack.isPopular && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                      Recommandé
                    </span>
                  )}

                  <div>
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${pack.badgeBg} ${pack.badgeText} border ${pack.badgeBorder}`}>
                      <div className="w-5 h-5 flex items-center justify-center shrink-0 overflow-hidden">
                        {getIcon(pack.iconName)}
                      </div>
                      <span>{pack.badgeLabel}</span>
                    </div>

                    <h3 className="mt-3 font-black text-lg text-slate-800">{pack.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px] leading-snug">{pack.description}</p>

                    {/* Pricing with Strikethrough and -20% badge */}
                    <div className="mt-4 mb-4 pb-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{netPackPrice} DT</span>
                        {hasDiscount && displayOriginalPrice > netPackPrice && (
                          <span className="text-xs font-bold text-slate-400 line-through">
                            {displayOriginalPrice} DT
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400">/ {pack.period}</span>
                      </div>

                      {hasDiscount && displayOriginalPrice > netPackPrice && (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-600 text-white rounded-lg shadow-xs">
                          <span className="font-black text-[11px] uppercase tracking-wider">-{discountPercent}%</span>
                          <span className="text-[10px] font-bold border-l border-red-400 pl-2">
                            Économisez {displayOriginalPrice - netPackPrice} DT
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2.5 text-xs">
                      {pack.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {feat.included ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"/>
                          ) : (
                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5"/>
                          )}
                          <span className={feat.included ? 'text-slate-800 font-semibold' : 'text-slate-300 line-through'}>
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPack({
                        ...pack,
                        price: netPackPrice,
                        finalPrice: netPackPrice,
                        originalPrice: displayOriginalPrice,
                        discountPercentage: discountPercent
                      });
                    }}
                    className={`w-full mt-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Choisir {pack.badgeLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubView('choose_category')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={14} /> Revenir au choix Freemium / Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpStepOffers;
