import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface BrandIdentityState {
  logoUrl: string;
  logoText: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  heroImageUrl: string;
  studentImageUrl: string;
  loginImageUrl: string;
  registerImageUrl: string;
  platformIcon: string;
  teacherAvatar: string;
  landingHeroTitle: string;
  landingHeroHighlight: string;
  landingHeroSubtext: string;
  headingFont: string;
  bodyFont: string;
}

export const DEFAULT_BRAND_IDENTITY: BrandIdentityState = {
  logoUrl: "",
  logoText: "A-Zed Info",
  brandName: "A-Zed Info",
  primaryColor: "#0F1E36",
  secondaryColor: "#10B981",
  heroImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
  studentImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
  loginImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
  registerImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
  platformIcon: "",
  teacherAvatar: "",
  landingHeroTitle: "",
  landingHeroHighlight: "",
  landingHeroSubtext: "",
  headingFont: "Inter",
  bodyFont: "Inter"
};

interface BrandIdentityContextType {
  identity: BrandIdentityState;
  loading: boolean;
  refreshBrandIdentity: () => Promise<void>;
  updateBrandIdentity: (newConfig: Partial<BrandIdentityState>) => Promise<boolean>;
}

const BrandIdentityContext = createContext<BrandIdentityContextType>({
  identity: DEFAULT_BRAND_IDENTITY,
  loading: false,
  refreshBrandIdentity: async () => {},
  updateBrandIdentity: async () => false
});

export const BrandIdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<BrandIdentityState>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("brand_identity_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          let effectiveName = parsed.brandName || parsed.logoText || DEFAULT_BRAND_IDENTITY.brandName;
          if (effectiveName === "A-Zedinfo" || effectiveName === "A-zedinfo" || effectiveName === "A-zed info") effectiveName = "A-Zed Info";
          return {
            ...DEFAULT_BRAND_IDENTITY,
            ...parsed,
            brandName: effectiveName,
            logoText: effectiveName
          };
        }
      }
    } catch {}
    return DEFAULT_BRAND_IDENTITY;
  });

  const [loading, setLoading] = useState<boolean>(true);

  const refreshBrandIdentity = useCallback(async () => {
    try {
      const res = await fetch("/api/config/logo");
      if (!res.ok) throw new Error("Failed to load branding identity");
      const data = await res.json();
      let resolvedName = data.brandName || data.logoText || "A-Zed Info";
      if (resolvedName === "A-Zedinfo" || resolvedName === "A-zedinfo" || resolvedName === "A-zed info") resolvedName = "A-Zed Info";
      const nextIdentity: BrandIdentityState = {
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : "",
        logoText: resolvedName,
        brandName: resolvedName,
        primaryColor: data.primaryColor || "#0F1E36",
        secondaryColor: data.secondaryColor || "#10B981",
        heroImageUrl: data.heroImageUrl || DEFAULT_BRAND_IDENTITY.heroImageUrl,
        studentImageUrl: data.studentImageUrl || DEFAULT_BRAND_IDENTITY.studentImageUrl,
        loginImageUrl: data.loginImageUrl || DEFAULT_BRAND_IDENTITY.loginImageUrl,
        registerImageUrl: data.registerImageUrl || DEFAULT_BRAND_IDENTITY.registerImageUrl,
        platformIcon: data.platformIcon || "",
        teacherAvatar: data.teacherAvatar || "",
        landingHeroTitle: data.landingHeroTitle || "",
        landingHeroHighlight: data.landingHeroHighlight || "",
        landingHeroSubtext: data.landingHeroSubtext || "",
        headingFont: data.headingFont || "Inter",
        bodyFont: data.bodyFont || "Inter"
      };

      setIdentity(nextIdentity);
      try {
        localStorage.setItem("brand_identity_cache", JSON.stringify(nextIdentity));
      } catch {}
    } catch (err) {
      console.warn("Using current identity fallback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrandIdentity = useCallback(async (newConfig: Partial<BrandIdentityState>): Promise<boolean> => {
    try {
      const resolvedName = newConfig.brandName || newConfig.logoText || identity.brandName;
      const payload = {
        ...newConfig,
        logoText: resolvedName,
        brandName: resolvedName
      };

      const res = await fetch("/api/admin/config/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const nextIdentity: BrandIdentityState = {
          ...identity,
          ...newConfig,
          brandName: resolvedName,
          logoText: resolvedName
        };
        setIdentity(nextIdentity);
        try {
          localStorage.setItem("brand_identity_cache", JSON.stringify(nextIdentity));
        } catch {}

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("brand-identity-updated", {
              detail: nextIdentity
            })
          );
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update brand identity:", err);
      return false;
    }
  }, [identity]);

  useEffect(() => {
    refreshBrandIdentity();

    const handleUpdatedEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        let resolvedName = detail.brandName || detail.logoText || "A-Zed Info";
        if (resolvedName === "A-Zedinfo" || resolvedName === "A-zedinfo" || resolvedName === "A-zed info") resolvedName = "A-Zed Info";
        setIdentity((prev) => {
          const next = {
            ...prev,
            ...detail,
            brandName: resolvedName,
            logoText: resolvedName
          };
          try {
            localStorage.setItem("brand_identity_cache", JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    };

    window.addEventListener("brand-identity-updated", handleUpdatedEvent);
    return () => {
      window.removeEventListener("brand-identity-updated", handleUpdatedEvent);
    };
  }, [refreshBrandIdentity]);

  return (
    <BrandIdentityContext.Provider
      value={{
        identity,
        loading,
        refreshBrandIdentity,
        updateBrandIdentity
      }}
    >
      {children}
    </BrandIdentityContext.Provider>
  );
};

export const useBrandIdentity = () => useContext(BrandIdentityContext);
export const useBrand = useBrandIdentity;
export default BrandIdentityContext;
