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
      bankName: string;
      ribNumber: string;
      accountOrder: string;
    };
    wafacash: {
      recipient: string;
      instructions: string;
    };
    cash: {
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
    author: "M. Nabil Chaouch"
  },
  payments: {
    d17: {
      phone: "20 729 823",
      notes: "Application D17 (La Poste Tunisienne)"
    },
    rib: {
      bankName: "Banque BIAT",
      ribNumber: "08 043 0001928372615 42",
      accountOrder: "A-Zed Info Academy"
    },
    wafacash: {
      recipient: "Nabil Chaouch",
      instructions: "Conservez votre reçu de transfert Wafacash / Mandat Express et téléversez-le pour validation."
    },
    cash: {
      location: "Centre Le Plus / Al Idhafa",
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
  return {
    contact: { ...DEFAULT_SITE_SETTINGS.contact, ...(raw?.contact || {}) },
    payments: {
      d17: { ...DEFAULT_SITE_SETTINGS.payments.d17, ...(raw?.payments?.d17 || {}) },
      rib: { ...DEFAULT_SITE_SETTINGS.payments.rib, ...(raw?.payments?.rib || {}) },
      wafacash: { ...DEFAULT_SITE_SETTINGS.payments.wafacash, ...(raw?.payments?.wafacash || {}) },
      cash: { ...DEFAULT_SITE_SETTINGS.payments.cash, ...(raw?.payments?.cash || {}) },
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
