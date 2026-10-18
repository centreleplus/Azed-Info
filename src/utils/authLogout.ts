export const performGlobalLogout = (navigate?: (path: string) => void) => {
  try {
    // 1. Clear all possible storage keys and tokens
    localStorage.clear();
    sessionStorage.clear();

    // 2. Clear cookies if applicable
    if (typeof document !== "undefined" && document.cookie) {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    // 3. Force clean state reset before altering location hash
    if (typeof window !== "undefined") {
      window.location.hash = '#/login';
      window.location.reload();
    }
  } catch (err) {
    console.error("Logout execution error:", err);
    if (typeof window !== "undefined") {
      window.location.href = '/#/login';
    }
  }
};
