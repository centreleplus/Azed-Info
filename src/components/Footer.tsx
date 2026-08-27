import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  Compass, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ChevronDown, 
  ShieldCheck, 
  ExternalLink,
  User
} from "lucide-react";
import { Language, translations } from "../lib/translations";
import { useSettings } from "./SettingsContext";

interface FooterProps {
  currentLanguage?: Language;
}

export default function Footer({ currentLanguage = "fr" }: FooterProps) {
  const { settings } = useSettings();
  const [isOpenAbout, setIsOpenAbout] = useState(false);
  const [isOpenCentre, setIsOpenCentre] = useState(false);
  const [isOpenLocations, setIsOpenLocations] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenIntro = () => {
      setIsOpenCentre(true);
      setTimeout(() => {
        introRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    const handleOpenLocation = () => {
      setIsOpenLocations(true);
      setTimeout(() => {
        const el = locationRef.current || document.getElementById('footer-location');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#00b87c]', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#00b87c]');
          }, 2000);
        }
      }, 100);
    };

    window.addEventListener('open-intro-footer', handleOpenIntro);
    window.addEventListener('open-footer-location', handleOpenLocation);

    return () => {
      window.removeEventListener('open-intro-footer', handleOpenIntro);
      window.removeEventListener('open-footer-location', handleOpenLocation);
    };
  }, []);

  const t = translations[currentLanguage];

  return (
    <footer id="contact-section" className="w-full bg-white border-t border-slate-200 mt-16 py-8 px-4 md:px-8 select-none" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* BLOC 1 : Découvrir / A-Zed Info */}
        <div id="footer-sec-about" className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 group hover:border-emerald-300 transition-all duration-200">
          <button
            id="footer-btn-about"
            onClick={() => setIsOpenAbout(!isOpenAbout)}
            className="w-full flex items-center justify-between py-1 text-[#0F1E36] font-bold text-sm hover:text-emerald-600 transition-all cursor-pointer group text-start focus:outline-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5 stroke-[1.8]"/>
              </div>
              <span className="font-bold text-slate-800 text-sm">A-Zed Info</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider hidden sm:inline-block">
                {isOpenAbout ? t.close : t.discover}
              </span>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpenAbout ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </motion.div>
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {isOpenAbout && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-3 border-t border-slate-200/60 mt-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.footer_tagline}
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium">
                    © {new Date().getFullYear()} A-Zed Info. {t.footer_rights}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BLOC 2 : Contact (REMPLACE INTRO) */}
        <div 
          ref={introRef}
          id="footer-sec-centre" 
          className={`space-y-3 bg-slate-50 border rounded-2xl p-3.5 transition-all duration-300 ${
            isOpenCentre ? 'border-indigo-400 bg-indigo-50/20 shadow-md' : 'border-slate-200/80 hover:border-indigo-300'
          }`}
        >
          <button
            id="footer-btn-centre"
            onClick={() => setIsOpenCentre(!isOpenCentre)}
            className="w-full flex items-center justify-between py-1 text-[#0F1E36] font-bold text-sm hover:text-indigo-600 transition-all cursor-pointer group text-start focus:outline-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100/70 text-indigo-600 rounded-xl border border-indigo-200/50 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Phone className="w-5 h-5 stroke-[1.8]"/>
              </div>
              <span className="font-bold text-slate-800 text-sm">Contact</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider hidden sm:inline-block">
                {isOpenCentre ? 'FERMER' : 'AFFICHER'}
              </span>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpenCentre ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {isOpenCentre && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2 text-xs text-slate-600 border-t border-slate-200/60 mt-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">{settings.contact.phone1 || "+216 20 000 000"} {settings.contact.phone2 ? `/ ${settings.contact.phone2}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{settings.contact.email || "contact@azedinfo.tn"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Lun - Sam : 08:30 - 19:00</span>
                  </div>
                  {settings.contact.author && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Professeur référent : <strong className="text-slate-800">{settings.contact.author}</strong></span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BLOC 3 : Localisation & Cartes */}
        <div 
          ref={locationRef}
          id="footer-location"
          className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 group hover:border-teal-300 transition-all duration-300"
        >
          <button
            id="footer-btn-locations"
            onClick={() => setIsOpenLocations(!isOpenLocations)}
            className="w-full flex items-center justify-between py-1 text-[#0F1E36] font-bold text-sm hover:text-teal-600 transition-all cursor-pointer group text-start focus:outline-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5 stroke-[1.8]"/>
              </div>
              <span className="font-bold text-slate-800 text-sm">{currentLanguage === "ar" ? "الموقع" : currentLanguage === "en" ? "Location" : "Localisation (Centre Le Plus)"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider hidden sm:inline-block">
                {isOpenLocations ? t.close : t.view_maps}
              </span>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isOpenLocations ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {isOpenLocations && (
              <motion.div
                id="footer-location-accordion"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2 grid grid-cols-1 gap-3 border-t border-slate-200/60 mt-2">
                  
                  {/* Location 1: Centre Le Plus / El Mourouj */}
                  <div className="p-3 border border-slate-200 rounded-xl bg-white shadow-2xs hover:border-teal-300 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-xs">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 stroke-[1.8]" />
                      <h4 className="font-bold text-slate-900">{t.location_el_mourouj}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      {currentLanguage === "ar" ? "العنوان: 2 شارع تونس | الهاتف: 122 881 20" : currentLanguage === "en" ? "Address: 2 rue de Tunis | Tel: 20 881 122" : "Adresse : 2 rue de Tunis, El Mourouj | Tél : 20 881 122"}
                    </p>
                    <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
                      Horaires : Lun - Sam (08h00 - 19h00)
                    </div>
                    <a
                      href="https://maps.app.goo.gl/HDzt85ZEMJTUVEGH6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-teal-600 hover:underline font-bold"
                    >
                      <span>{currentLanguage === "ar" ? "فتح الاتجاهات على الخريطة" : currentLanguage === "en" ? "Open map directions" : "Ouvrir itinéraire maps"}</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.8]" />
                    </a>
                  </div>

                  {/* Location 2: Morneg */}
                  <div className="p-3 border border-slate-200 rounded-xl bg-white shadow-2xs hover:border-teal-300 transition-all">
                    <div className="flex items-center gap-1.5 mb-1 text-xs">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 stroke-[1.8]" />
                      <h4 className="font-bold text-slate-900">{t.location_morneg}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      {currentLanguage === "ar" ? "مرناق المركز | الهاتف: 398 538 98" : currentLanguage === "en" ? "Morneg Center | Tel: 98 538 398" : "Morneg Centre | Tél : 98 538 398"}
                    </p>
                    <div className="text-[10px] text-slate-500 mb-1.5 font-medium">
                      Horaires : Lun - Sam (08h00 - 19h00)
                    </div>
                    <a
                      href="https://maps.app.goo.gl/Vb2WP2MxjkCWg3qL6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-teal-600 hover:underline font-bold"
                    >
                      <span>{currentLanguage === "ar" ? "فتح الاتجاهات على الخريطة" : currentLanguage === "en" ? "Open map directions" : "Ouvrir itinéraire maps"}</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.8]" />
                    </a>
                  </div>

                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-medium border border-emerald-100">
                    💡 <strong>Paiement Direct :</strong> Présentez votre numéro d'inscription au guichet pour validation immédiate de votre accès.
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Mention Légale & Sécurité */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© {new Date().getFullYear()} A-Zed Info — {t.footer_rights}</p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[1.8]"/> Plateforme Sécurisée
          </span>
        </div>
      </div>
    </footer>
  );
}

