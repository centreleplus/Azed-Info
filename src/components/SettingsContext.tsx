import React, { createContext, useContext, useState, useEffect } from "react";
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from "../utils/safeStorage";

export interface SiteSettings {
  contact: {
    phone1: string;
    phone2: string;
    email: string;
    messenger: string;
    institution: string;
    author: string;
  };
  payments: {
    d17: {
      phone: string;
      notes: string;
    };
    rib: {
      intitule?: string;
      bankName: string;
      numeroRib?: string;
      ribNumber: string;
      aLOrdreDe?: string;
      accountOrder: string;
    };
    cash_mornag: {
      intitule?: string;
      location: string;
      numeroRib?: string;
      ribNumber?: string;
      aLOrdreDe?: string;
      accountOrder?: string;
      address?: string;
      phone?: string;
      mapUrl?: string;
      hours?: string;
    };
    cash_mourouj: {
      location?: string;
      adresse1?: string;
      address: string;
      adresse2?: string;
      numTel1?: string;
      phone: string;
      numTel2?: string;
      mapUrl?: string;
      mapUrl2?: string;
      hours?: string;
    };
    wafacash?: {
      recipient: string;
      instructions: string;
    };
    cash?: {
      location: string;
      hours: string;
    };
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contact: {
    phone1: "20 729 823",
    phone2: "98 538 539",
    email: "centreleplus@gmail.com",
    messenger: "Le Plus",
    institution: "Le Plus - Centre de langues et assistance scolaire",
    author: "Professeur Nabil Chaouch"
  },
  payments: {
    d17: {
      phone: "20 729 823",
      notes: "Application D17 (La Poste Tunisienne)"
    },
    rib: {
      intitule: "Banque BIAT",
      bankName: "Banque BIAT",
      numeroRib: "08 043 0001928372615 42",
      ribNumber: "08 043 0001928372615 42",
      aLOrdreDe: "A-Zed Info Academy",
      accountOrder: "A-Zed Info Academy"
    },
    cash_mornag: {
      intitule: "La Poste Tunisienne",
      location: "La Poste Tunisienne",
      numeroRib: "17 000 0000000000000 00",
      ribNumber: "17 000 0000000000000 00",
      aLOrdreDe: "A-Zed Info Academy",
      accountOrder: "A-Zed Info Academy"
    },
    cash_mourouj: {
      location: "Paiement direct Mourouj - Morneg",
      adresse1: "2 rue de Tunis, El Mourouj",
      address: "2 rue de Tunis, El Mourouj",
      adresse2: "Morneg Centre",
      numTel1: "20 881 122",
      phone: "20 881 122",
      numTel2: "98 538 398",
      mapUrl: "https://maps.google.com/?q=2+rue+de+Tunis,+El+Mourouj",
      mapUrl2: "https://maps.google.com/?q=Morneg+Centre",
      hours: "Lun - Sam (08h00 - 19h00)"
    },
    wafacash: {
      recipient: "La Poste Tunisienne",
      instructions: "Versement / Virement Postale | La Poste Tunisienne"
    },
    cash: {
      location: "2 rue de Tunis, El Mourouj (Tél: 20 881 122) / Morneg Centre (Tél: 98 538 398)",
      hours: "Lun - Sam (08h00 - 19h00)"
    }
  }
};

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  updateSettings: async () => {},
  loading: false,
  refreshSettings: async () => {}
});

function sanitizeSiteSettings(raw: any): SiteSettings {
  const rawRib = raw?.payments?.rib || {};
  const ribIntitule = rawRib.intitule ?? rawRib.bankName ?? DEFAULT_SITE_SETTINGS.payments.rib.intitule;
  const ribNumero = rawRib.numeroRib ?? rawRib.ribNumber ?? DEFAULT_SITE_SETTINGS.payments.rib.numeroRib;
  const ribOrdre = rawRib.aLOrdreDe ?? rawRib.accountOrder ?? DEFAULT_SITE_SETTINGS.payments.rib.aLOrdreDe;

  const rawPostal = raw?.payments?.cash_mornag || {};
  const isLegacyMornagLocation =
    !rawPostal.intitule &&
    (rawPostal.location === "Paiement direct en espèces à Mornag" || !rawPostal.location);
  const postalIntitule = isLegacyMornagLocation
    ? DEFAULT_SITE_SETTINGS.payments.cash_mornag.intitule!
    : (rawPostal.intitule ?? rawPostal.location ?? DEFAULT_SITE_SETTINGS.payments.cash_mornag.intitule!);
  const postalNumeroRib = rawPostal.numeroRib ?? rawPostal.ribNumber ?? DEFAULT_SITE_SETTINGS.payments.cash_mornag.numeroRib!;
  const postalOrdre = rawPostal.aLOrdreDe ?? rawPostal.accountOrder ?? DEFAULT_SITE_SETTINGS.payments.cash_mornag.aLOrdreDe!;

  const rawDirect = raw?.payments?.cash_mourouj || {};
  const directAdresse1 = rawDirect.adresse1 ?? rawDirect.address ?? DEFAULT_SITE_SETTINGS.payments.cash_mourouj.adresse1!;
  const directAdresse2 = rawDirect.adresse2 ?? DEFAULT_SITE_SETTINGS.payments.cash_mourouj.adresse2!;
  const directNumTel1 = rawDirect.numTel1 ?? rawDirect.phone ?? DEFAULT_SITE_SETTINGS.payments.cash_mourouj.numTel1!;
  const directNumTel2 = rawDirect.numTel2 ?? DEFAULT_SITE_SETTINGS.payments.cash_mourouj.numTel2!;

  return {
    contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(raw?.contact || {}) },
    payments: {
      d17: { ...DEFAULT_SITE_SETTINGS.payments.d17, ...(raw?.payments?.d17 || {}) },
      rib: {
        ...DEFAULT_SITE_SETTINGS.payments.rib,
        ...rawRib,
        intitule: ribIntitule,
        bankName: ribIntitule,
        numeroRib: ribNumero,
        ribNumber: ribNumero,
        aLOrdreDe: ribOrdre,
        accountOrder: ribOrdre
      },
      cash_mornag: {
        intitule: postalIntitule,
        location: postalIntitule,
        numeroRib: postalNumeroRib,
        ribNumber: postalNumeroRib,
        aLOrdreDe: postalOrdre,
        accountOrder: postalOrdre
      },
      cash_mourouj: {
        ...DEFAULT_SITE_SETTINGS.payments.cash_mourouj,
        ...rawDirect,
        location: "Paiement direct Mourouj - Morneg",
        adresse1: directAdresse1,
        address: directAdresse1,
        adresse2: directAdresse2,
        numTel1: directNumTel1,
        phone: directNumTel1,
        numTel2: directNumTel2
      },
      wafacash: { ...DEFAULT_SITE_SETTINGS.payments.wafacash, ...(raw?.payments?.wafacash || {}) },
      cash: { ...DEFAULT_SITE_SETTINGS.payments.cash, ...(raw?.payments?.cash || {}) }
    }
  };
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = safeLocalStorageGetItem("site_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeSiteSettings(parsed);
      }
    } catch {
      // fallback
    }
    return DEFAULT_SITE_SETTINGS;
  });

  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/config/settings");
      if (res.ok) {
        const data = await res.json();
        if (data && (data.contact || data.payments)) {
          const merged = sanitizeSiteSettings(data);
          setSettings(merged);
          safeLocalStorageSetItem("site_settings", JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn("Error fetching site settings:", e);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleExternalUpdate = (e: CustomEvent<SiteSettings>) => {
      if (e.detail) {
        setSettings(sanitizeSiteSettings(e.detail));
      }
    };

    window.addEventListener("site_settings_updated" as any, handleExternalUpdate);
    return () => window.removeEventListener("site_settings_updated" as any, handleExternalUpdate);
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    setLoading(true);
    const cleaned = sanitizeSiteSettings(newSettings);
    try {
      setSettings(cleaned);
      safeLocalStorageSetItem("site_settings", JSON.stringify(cleaned));
      window.dispatchEvent(new CustomEvent("site_settings_updated", { detail: cleaned }));

      await fetch("/api/admin/config/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned)
      });
    } catch (e) {
      console.warn("Non-fatal issue updating site settings:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
