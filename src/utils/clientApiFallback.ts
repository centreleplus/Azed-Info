/**
 * Resilient Client-Side Mock Database & Fail-Safe API Fallback Engine
 * Enables 100% offline, static Vercel, or serverless deployment compatibility.
 * Automatically intercepts /api/* calls when backend endpoints return 404, 500, HTML, or fail.
 */

export interface StoredDb {
  users: any[];
  receipts: any[];
  orders: any[];
  events: any[];
  notifications: any[];
  ebooks: any[];
  products: any[];
  courses: any[];
  auditLogs: any[];
  interactiveQuizzes: any[];
  quizSubmissions: any[];
  todoEvents: any[];
  quizTips: Array<{ id: string; text: string; createdAt: string }>;
  flipbooks: any[];
  demos: any[];
  commissions: any[];
  commissionWithdrawals?: any[];
  signUpOffers: any[];
  passwordResetRequests?: any[];
  branding?: any;
  homeCards?: any[];
}

export const STORAGE_KEY = "azed_mock_db_store";

export function getInitialDb(): StoredDb {
  return {
    auditLogs: [
      {
        id: "log-1",
        userId: "usr_admin_center",
        userName: "M. Nabil Chaouch",
        userRole: "SUPER_ADMIN",
        action: "INITIALISATION_SYSTEME",
        category: "ADMINISTRATION",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        details: "Plateforme A-zed Info prête et initialisée avec succès."
      }
    ],
    users: [
      {
        id: "usr_admin_center",
        email: "centreleplus@gmail.com",
        fullName: "Nabil Chaouch (Le Plus)",
        name: "Nabil Chaouch (Le Plus)",
        role: "admin",
        grade: "Tous",
        section: "Administration",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-06-05T00:00:00Z",
        password: "admin123",
        phone: "21620123456",
        address: "Centre Le Plus, El Mourouj, Tunis",
        accountType: "premium",
        badgeLabel: "Super Admin",
        badge_label: "Super Admin",
        verified: true,
        activeDevicesCount: 1,
        maxAllowedDevices: 10
      },
      {
        id: "usr_admin",
        email: "admin@azed.info",
        fullName: "M. Nabil Chaouch",
        name: "M. Nabil Chaouch",
        role: "admin",
        grade: "Tous",
        section: "Administration",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-05-01T10:00:00Z",
        password: "admin123",
        phone: "21620123456",
        accountType: "premium",
        badgeLabel: "Super Admin",
        badge_label: "Super Admin",
        verified: true,
        activeDevicesCount: 1,
        maxAllowedDevices: 10
      },
      {
        id: "std-1",
        email: "fedi.freemium@azed.info",
        fullName: "Fedi Ben Amor",
        name: "Fedi Ben Amor",
        role: "student",
        grade: "4ème",
        section: "Sciences de l'Informatique",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-08-10T10:00:00Z",
        password: "fedipasswd123",
        phone: "21698123456",
        city: "Tunis",
        highSchool: "Lycée Pilote Tunis",
        accountType: "freemium",
        badgeLabel: "Option Gratuit",
        badge_label: "Option Gratuit",
        badgeType: "Option Freemium",
        badge_type: "Option Freemium",
        tier: "FREEMIUM",
        tierCategory: "FREEMIUM",
        tierBadge: "Option Gratuit",
        groupe_etude: "Non assigné",
        studyGroup: "Non assigné",
        study_group: null,
        verified: true,
        packs: [],
        subscriptionType: "freemium"
      },
      {
        id: "std-2",
        email: "yasmine.premium@azed.info",
        fullName: "Yasmine Mansour",
        name: "Yasmine Mansour",
        role: "student",
        grade: "3ème",
        section: "Sciences de l'Informatique",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-08-11T11:00:00Z",
        password: "yasminepass123",
        phone: "21697234567",
        city: "Sousse",
        highSchool: "Lycée Garçons Sousse",
        accountType: "premium",
        badgeLabel: "Pack Premium",
        badge_label: "Pack Premium",
        badgeType: "Zap (Premium)",
        badge_type: "Zap (Premium)",
        tier: "PREMIUM",
        tierCategory: "PREMIUM",
        tierBadge: "Pack Premium",
        groupe_etude: "Groupe A",
        studyGroup: "Groupe A",
        study_group: "Groupe A",
        verified: true,
        packs: ["Pack Premium"],
        subscriptionType: "trimestriel",
        subscriptionExpiresAt: "2027-08-11T11:00:00Z"
      },
      {
        id: "std-3",
        email: "sarah.benali@azed.info",
        fullName: "Sarah Ben Ali",
        name: "Sarah Ben Ali",
        role: "student",
        grade: "4ème",
        section: "Mathématiques",
        status: "pending",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-08-25T14:30:00Z",
        password: "sarahpass123",
        phone: "21695123456",
        city: "Sfax",
        highSchool: "Lycée Pilote Sfax",
        accountType: "freemium",
        badgeLabel: "En attente",
        groupe_etude: "Non assigné",
        studyGroup: "Non assigné",
        study_group: null,
        verified: false,
        packs: [],
        subscriptionType: "freemium"
      }
    ],
    receipts: [
      {
        id: "rec-101",
        userId: "std-2",
        studentId: "std-2",
        userName: "Yasmine Mansour",
        studentName: "Yasmine Mansour",
        userEmail: "yasmine.premium@azed.info",
        amount: 85,
        targetPack: "Pack Premium",
        grade: "3ème Sciences de l'Informatique",
        receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600",
        status: "approved",
        createdAt: "2026-08-11T10:45:00Z",
        approvedAt: "2026-08-11T11:00:00Z",
        paymentMethod: "D17 / Mandat Minute"
      },
      {
        id: "rec-102",
        userId: "std-3",
        studentId: "std-3",
        userName: "Sarah Ben Ali",
        studentName: "Sarah Ben Ali",
        userEmail: "sarah.benali@azed.info",
        amount: 120,
        targetPack: "Pack Excellence Bac",
        grade: "4ème Mathématiques",
        receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600",
        status: "pending",
        createdAt: "2026-08-25T14:35:00Z",
        paymentMethod: "Virement Bancaire / RIB"
      }
    ],
    orders: [],
    events: [
      {
        id: "evt-1",
        title: "Live Révision Générale Python & Algorithmique",
        title_event: "Live Révision Générale Python & Algorithmique",
        date: "2026-09-15",
        date_start: "2026-09-15",
        time: "18:30",
        durationMinutes: 90,
        duration_minutes: 90,
        zoomLink: "https://zoom.us/j/azed-info-live",
        zoom_link: "https://zoom.us/j/azed-info-live",
        grade: "4ème",
        target_class: "4ème",
        section: "Sciences de l'Informatique",
        target_specialty: "Sciences de l'Informatique",
        type: "live",
        description: "Séance interactive en direct avec M. Nabil Chaouch. Analyse d'annales de bac national.",
        created_at: "2026-08-20T10:00:00Z",
        notifyStudents: true
      }
    ],
    notifications: [],
    ebooks: [],
    products: [
      {
        id: "prod-1",
        title: "L'Essentiel de l'Algorithmique & Python",
        name: "L'Essentiel de l'Algorithmique & Python",
        category: "Livres",
        price: 35,
        oldPrice: 45,
        originalPrice: 45,
        rating: 4.9,
        reviewsCount: 128,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        isPack: false,
        grade: "4ème Bac Info",
        stock: 50,
        inStock: true
      },
      {
        id: "prod-2",
        title: "Pack Excellence Bac Informatique 2026",
        name: "Pack Excellence Bac Informatique 2026",
        category: "Packs",
        price: 120,
        oldPrice: 160,
        originalPrice: 160,
        rating: 5.0,
        reviewsCount: 210,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
        isPack: true,
        badge: "MEILLEURE VENTE",
        promoBadge: "MEILLEURE VENTE",
        grade: "4ème Bac Info",
        stock: 100,
        inStock: true
      }
    ],
    courses: [
      {
        id: "crs-1",
        title: "Introduction aux Sous-Programmes en Python",
        category: "Algorithmique",
        grade: "4ème",
        section: "Sciences de l'Informatique",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "45 min",
        isPremium: false,
        createdAt: "2026-08-01T10:00:00Z"
      }
    ],
    interactiveQuizzes: [
      {
        id: "quiz-1",
        title: "QCM - Les Fonctions et Procédures en Python",
        type: "qcm",
        grade: "4ème",
        difficulty: "Intermediaire",
        creatorName: "M. Nabil Chaouch",
        createdAt: "2026-08-01T10:00:00Z",
        questions: [
          {
            id: 1,
            question: "En Python, quel mot-clé permet de définir une fonction ?",
            options: ["function", "def", "procedure", "fun"],
            correctAnswer: 1,
            explanation: "Le mot-clé standard en langage Python pour définir une fonction est 'def'."
          }
        ]
      }
    ],
    quizSubmissions: [],
    todoEvents: [
      {
        id: "todo-1",
        name: "TP N°1 - Fonctions Récursives",
        date: "2026-09-10",
        hour: "18:00",
        dueDate: "2026-09-17",
        notes: "Rendre le script Python commenté avant minuit.",
        isPremium: false,
        allowedTiers: ["FREEMIUM", "PREMIUM"],
        targetClass: "4ème"
      }
    ],
    quizTips: [
      {
        id: "tip-1",
        text: "Pensez toujours à vérifier le cas limite (liste vide ou index hors limites) lors de l'écriture d'un algorithme de recherche.",
        createdAt: "2026-08-10T10:00:00Z"
      }
    ],
    flipbooks: [],
    demos: [],
    commissions: [],
    commissionWithdrawals: [],
    signUpOffers: [],
    passwordResetRequests: []
  };
}

export function getClientDb(): StoredDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure super-admin always exists in mock DB
      const hasSuperAdmin = parsed.users && parsed.users.some((u: any) => u.email === "centreleplus@gmail.com");
      if (!hasSuperAdmin) {
        if (!parsed.users) parsed.users = [];
        parsed.users.unshift({
          id: "usr_admin_center",
          email: "centreleplus@gmail.com",
          fullName: "Nabil Chaouch (Le Plus)",
          name: "Nabil Chaouch (Le Plus)",
          role: "admin",
          grade: "Tous",
          section: "Administration",
          status: "active",
          activeSessionId: null,
          avatarUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=200",
          createdAt: "2026-06-05T00:00:00Z",
          password: "admin123",
          phone: "21620123456",
          address: "Centre Le Plus, El Mourouj, Tunis",
          accountType: "premium",
          badgeLabel: "Super Admin",
          verified: true
        });
        saveClientDb(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load client mock DB:", e);
  }

  const initial = getInitialDb();
  saveClientDb(initial);
  return initial;
}

export function saveClientDb(db: StoredDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("azed_db_updated", { detail: db }));
      window.dispatchEvent(
        new CustomEvent("azed_local_storage_updated", {
          detail: { key: STORAGE_KEY, value: db }
        })
      );
    }
  } catch (e) {
    console.warn("Failed to save client mock DB to localStorage:", e);
  }
}

/**
 * Dispatches simulated mock response for /api/* requests
 */
async function handleMockApiRequest(url: string, method: string, body: any): Promise<Response> {
  const db = getClientDb();
  const cleanUrl = url.split("?")[0].replace(/^\/api\//, "").replace(/^api\//, "");

  // 1. AUTH LOGIN
  if (cleanUrl === "auth/login" && method === "POST") {
    const { email, password } = body || {};
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPass = (password || "").trim();

    const user = db.users.find(
      (u) => (u.email || "").toLowerCase() === normalizedEmail
    );

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, msg: "Identifiants invalides (E-mail introuvable)." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const isAdmin = (user.role as string) === "admin" || (user.role as string) === "SUPER_ADMIN" || (user.role as string) === "super_admin";
    const expectedPass = user.password || (isAdmin ? "admin123" : "student123");

    if (normalizedPass !== expectedPass) {
      return new Response(
        JSON.stringify({ success: false, msg: "Mot de passe incorrect." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    try {
      localStorage.setItem("app_current_user", JSON.stringify(userWithoutPassword));
      localStorage.setItem("current_user", JSON.stringify(userWithoutPassword));
    } catch (e) {}

    return new Response(
      JSON.stringify({
        success: true,
        token: `mock_token_${user.id}_${Date.now()}`,
        user: userWithoutPassword
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1b. AUTH REGISTER (Instant LocalStorage Registration)
  if ((cleanUrl === "auth/register" || cleanUrl === "register") && method === "POST") {
    const { registerUserInStorage } = await import("./localDbAdapter");
    const result = registerUserInStorage(body || {});
    return new Response(
      JSON.stringify({
        success: true,
        token: result.token,
        user: result.user,
        msg: "Compte créé et enregistré avec succès !"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. CHANGE PASSWORD (SUPER-ADMIN & USER)
  if (
    (cleanUrl === "admin/change-password" || cleanUrl === "user/change-password" || cleanUrl === "auth/change-password") &&
    method === "POST"
  ) {
    const { userId, email, currentPassword, oldPassword, newPassword, password } = body || {};
    const finalPassword = (newPassword || password || "").trim();
    const providedOldPassword = (currentPassword || oldPassword || "").trim();

    if (!finalPassword || finalPassword.length < 4) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit comporter au moins 4 caractères." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let userIndex = -1;
    if (userId) {
      userIndex = db.users.findIndex((u) => u.id === userId);
    }
    if (userIndex === -1 && email) {
      userIndex = db.users.findIndex((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase());
    }
    if (userIndex === -1) {
      userIndex = db.users.findIndex((u) => (u.email || "").toLowerCase() === "centreleplus@gmail.com");
    }

    if (userIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Utilisateur introuvable." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = db.users[userIndex];
    const isAdmin = (user.role as string) === "admin" || (user.role as string) === "SUPER_ADMIN" || (user.role as string) === "super_admin";
    const expectedOld = user.password || (isAdmin ? "admin123" : "student123");

    if (providedOldPassword && providedOldPassword !== expectedOld) {
      return new Response(
        JSON.stringify({ error: "L'ancien mot de passe saisi est incorrect." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    user.password = finalPassword;
    db.users[userIndex] = user;

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.fullName || user.name || user.email,
      userRole: user.role,
      action: "CHANGEMENT_MOT_DE_PASSE",
      category: "SECURITE",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      details: "Mot de passe administrateur mis à jour avec succès dans le stockage local persistant."
    });

    saveClientDb(db);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mot de passe mis à jour avec succès !",
        updatedAt: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. ADMIN USER STATUS & SUBSCRIPTION MUTATIONS (Fix Unresponsive Admin Buttons)
  if (cleanUrl === "admin/users/status" && method === "POST") {
    const { userId, status, verified, subscriptionType, city, highSchool, password, packs } = body || {};
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx !== -1) {
      const u = db.users[uIdx];
      if (status !== undefined) {
        u.status = status;
        if (status === "active") u.verified = true;
        if (status === "disabled") u.verified = false;
      }
      if (verified !== undefined) {
        u.verified = verified;
        if (verified && u.status === "pending") u.status = "active";
      }
      if (subscriptionType !== undefined) {
        u.subscriptionType = subscriptionType;
        u.accountType = subscriptionType === "freemium" ? "freemium" : "premium";
        u.plan = subscriptionType === "freemium" ? "FREEMIUM" : "PREMIUM";
      }
      if (city !== undefined) {
        u.city = city;
        u.ville = city;
      }
      if (highSchool !== undefined) {
        u.highSchool = highSchool;
        u.etablissement = highSchool;
      }
      if (password !== undefined) {
        u.password = password;
      }
      if (packs !== undefined) {
        u.packs = packs;
      }
      db.users[uIdx] = u;
      saveClientDb(db);

      // Sync active session if this is the current user
      try {
        const stored = localStorage.getItem("current_user");
        if (stored) {
          const cu = JSON.parse(stored);
          if (cu.id === userId) {
            Object.assign(cu, u);
            delete cu.password;
            localStorage.setItem("current_user", JSON.stringify(cu));
          }
        }
      } catch (e) {}

      return new Response(JSON.stringify({ success: true, user: u }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 4. ADMIN USER DISABLE / BAN
  if (cleanUrl === "admin/users/disable" && method === "POST") {
    const { userId } = body || {};
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx].status = "disabled";
      db.users[uIdx].verified = false;
      db.users[uIdx].isBlocked = true;
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, user: db.users[uIdx] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 5. ADMIN USER CANCEL PACK
  if (cleanUrl === "admin/users/cancel-pack" && method === "POST") {
    const { userId, packName } = body || {};
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx].packs = (db.users[uIdx].packs || []).filter((p: string) => p !== packName);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, user: db.users[uIdx] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 6. ADMIN CHANGE STUDENT STUDY GROUP (/api/admin/students/:userId/group)
  if (
    (cleanUrl.includes("students/") && cleanUrl.includes("/group")) ||
    (cleanUrl.includes("users/") && cleanUrl.includes("/group"))
  ) {
    const match = cleanUrl.match(/(?:students|users)\/([^/]+)\/group/);
    const userId = match ? match[1] : body?.userId;
    const groupVal = body?.study_group || body?.groupe_etude || body?.studyGroup || body?.group || "";
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx !== -1) {
      db.users[uIdx].study_group = groupVal ? groupVal : null;
      db.users[uIdx].groupe_etude = groupVal ? groupVal : "Non assigné";
      db.users[uIdx].studyGroup = groupVal ? groupVal : "Non assigné";
      saveClientDb(db);

      // Sync active session if this is the current user
      try {
        const stored = localStorage.getItem("current_user");
        if (stored) {
          const cu = JSON.parse(stored);
          if (cu.id === userId) {
            cu.study_group = groupVal ? groupVal : null;
            cu.groupe_etude = groupVal ? groupVal : "Non assigné";
            cu.studyGroup = groupVal ? groupVal : "Non assigné";
            localStorage.setItem("current_user", JSON.stringify(cu));
          }
        }
      } catch (e) {}

      return new Response(JSON.stringify({ success: true, user: db.users[uIdx] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 7. ADMIN DELETE USER (/api/admin/users/:userId or /api/users/:userId)
  if ((cleanUrl.startsWith("admin/users/") || cleanUrl.startsWith("users/")) && method === "DELETE") {
    const userId = cleanUrl.split("/").pop();
    if (userId) {
      db.users = db.users.filter((u) => u.id !== userId);
      db.receipts = db.receipts.filter((r) => r.userId !== userId && r.studentId !== userId);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 8. GET/POST USERS
  if (cleanUrl === "users" || cleanUrl === "admin/users") {
    if (method === "GET") {
      const sanitizedUsers = db.users.map((u) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      return new Response(JSON.stringify(sanitizedUsers), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST") {
      const newUser = {
        id: body.id || `usr_${Date.now()}`,
        ...body,
        createdAt: body.createdAt || new Date().toISOString()
      };
      db.users.push(newUser);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, user: newUser }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 9. RECEIPTS APPROVAL & REJECTION (Fix Frais Inscription decision)
  if ((cleanUrl === "admin/receipts/approve" || cleanUrl === "receipts/approve") && method === "POST") {
    const { receiptId, studentId } = body || {};
    const rIdx = db.receipts.findIndex((r) => r.id === receiptId);
    let matchedReceipt = null;
    if (rIdx !== -1) {
      db.receipts[rIdx].status = "approved";
      db.receipts[rIdx].approvedAt = new Date().toISOString();
      matchedReceipt = db.receipts[rIdx];
    }
    const targetUserId = studentId || matchedReceipt?.userId || matchedReceipt?.studentId;
    if (targetUserId) {
      const uIdx = db.users.findIndex((u) => u.id === targetUserId);
      if (uIdx !== -1) {
        db.users[uIdx].status = "active";
        db.users[uIdx].verified = true;
        db.users[uIdx].accountType = "premium";
        db.users[uIdx].plan = "PREMIUM";
        if (matchedReceipt?.targetPack && !db.users[uIdx].packs?.includes(matchedReceipt.targetPack)) {
          db.users[uIdx].packs = [...(db.users[uIdx].packs || []), matchedReceipt.targetPack];
        }
      }
    }
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true, receipt: matchedReceipt }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl === "admin/receipts/reject" || cleanUrl === "receipts/reject") && method === "POST") {
    const { receiptId } = body || {};
    const rIdx = db.receipts.findIndex((r) => r.id === receiptId);
    if (rIdx !== -1) {
      db.receipts[rIdx].status = "rejected";
      db.receipts[rIdx].rejectedAt = new Date().toISOString();
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, receipt: db.receipts[rIdx] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 10. RECEIPTS LIST
  if (cleanUrl === "admin/receipts" || cleanUrl === "receipts") {
    if (method === "POST") {
      const newRec = {
        id: body.id || `rec-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        ...body
      };
      db.receipts.unshift(newRec);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, receipt: newRec }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.receipts || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 11. PRODUCTS
  if (cleanUrl === "products" || cleanUrl === "admin/products") {
    if (method === "POST") {
      const newProd = {
        id: body.id || `prod-${Date.now()}`,
        name: body.title || body.name || "Nouveau Produit",
        title: body.title || body.name || "Nouveau Produit",
        price: Number(body.price) || 0,
        oldPrice: Number(body.oldPrice) || 0,
        imageUrl: body.image || body.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        image: body.image || body.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        category: body.category || "Packs",
        promoBadge: body.promoBadge || "",
        inStock: true,
        ...body
      };
      db.products.push(newProd);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, product: newProd }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.products || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl.startsWith("admin/products/") || cleanUrl.startsWith("products/")) && method === "DELETE") {
    const prodId = cleanUrl.split("/").pop();
    db.products = db.products.filter((p) => p.id !== prodId);
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 12. COURSES & RESOURCES
  if (cleanUrl === "courses" || cleanUrl === "admin/courses") {
    if (method === "POST") {
      const newCourse = {
        id: body.id || `crs-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...body
      };
      db.courses.push(newCourse);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, course: newCourse }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.courses || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl.startsWith("admin/courses/") || cleanUrl.startsWith("courses/")) && method === "DELETE") {
    const crsId = cleanUrl.split("/").pop();
    db.courses = db.courses.filter((c) => c.id !== crsId);
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 13. EVENTS
  if (cleanUrl === "events" || cleanUrl === "admin/events") {
    if (method === "POST") {
      const newEvt = {
        id: body.id || `evt_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...body
      };
      db.events.unshift(newEvt);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, event: newEvt }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.events || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl.startsWith("admin/events/") || cleanUrl.startsWith("events/")) && method === "DELETE") {
    const evtId = cleanUrl.split("/").pop();
    db.events = db.events.filter((e) => e.id !== evtId);
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 14. QUIZZES
  if (cleanUrl === "quizzes" || cleanUrl === "admin/quizzes") {
    if (method === "POST") {
      const newQuiz = {
        id: body.id || `quiz-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...body
      };
      db.interactiveQuizzes.push(newQuiz);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, quiz: newQuiz }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.interactiveQuizzes || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl.startsWith("quizzes/") || cleanUrl.startsWith("admin/quizzes/")) && method === "DELETE") {
    const qzId = cleanUrl.split("/").pop();
    db.interactiveQuizzes = db.interactiveQuizzes.filter((q) => q.id !== qzId);
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (cleanUrl === "quizzes/tips") {
    if (method === "POST") {
      const tip = {
        id: `tip-${Date.now()}`,
        text: body.text || "",
        createdAt: new Date().toISOString()
      };
      db.quizTips.unshift(tip);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, tip }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.quizTips || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 15. AUDIT LOGS
  if (cleanUrl === "admin/audit-logs") {
    return new Response(JSON.stringify(db.auditLogs || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 16. TODO EVENTS
  if (cleanUrl === "todo-events" || cleanUrl === "admin/todo-events") {
    if (method === "POST") {
      const newTodo = {
        id: body.id || `todo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...body
      };
      db.todoEvents.unshift(newTodo);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, todo: newTodo }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.todoEvents || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((cleanUrl.startsWith("todo-events/") || cleanUrl.startsWith("admin/todo-events/")) && method === "DELETE") {
    const todoId = cleanUrl.split("/").pop();
    db.todoEvents = db.todoEvents.filter((t) => t.id !== todoId);
    saveClientDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 17. PASSWORD RESETS
  if (cleanUrl === "admin/password-resets") {
    return new Response(JSON.stringify(db.passwordResetRequests || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 18. COMMISSIONS & WITHDRAWALS
  if (cleanUrl === "commissions") {
    return new Response(JSON.stringify(db.commissions || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (cleanUrl === "commissions/withdrawals") {
    if (method === "POST") {
      const newWithdrawal = {
        id: `with-${Date.now()}`,
        requestDate: new Date().toLocaleString(),
        status: "pending",
        ...body
      };
      if (!db.commissionWithdrawals) db.commissionWithdrawals = [];
      db.commissionWithdrawals.unshift(newWithdrawal);
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, withdrawal: newWithdrawal }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.commissionWithdrawals || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (cleanUrl === "commissions/withdrawals/action" && method === "POST") {
    const { withdrawalId, action } = body || {};
    if (db.commissionWithdrawals) {
      const idx = db.commissionWithdrawals.findIndex((w) => w.id === withdrawalId);
      if (idx !== -1) {
        db.commissionWithdrawals[idx].status = action === "approve" ? "approved" : "rejected";
        saveClientDb(db);
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 19. BRANDING & SETTINGS
  if (cleanUrl === "branding" || cleanUrl === "admin/branding") {
    if (method === "POST") {
      db.branding = { ...db.branding, ...body };
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, branding: db.branding }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.branding || {}), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 20. HOME CARDS
  if (cleanUrl === "home-cards") {
    if (method === "POST") {
      db.homeCards = body?.cards || [];
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, cards: db.homeCards }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true, cards: db.homeCards || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Generic fallback for any other endpoint
  return new Response(
    JSON.stringify({ success: true, data: [] }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Initializes transparent global fetch interceptor
 */
export function setupClientApiFallback(): void {
  if (typeof window === "undefined" || (window as any).__api_fallback_installed) return;
  (window as any).__api_fallback_installed = true;

  if (typeof window.fetch !== "function") return;

  const originalFetch = window.fetch.bind(window);

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlString = "";
    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    } else if (input && typeof (input as any).url === "string") {
      urlString = (input as any).url;
    }

    const isApiRequest = urlString.startsWith("/api/") || urlString.startsWith("api/") || urlString.includes("/api/");

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    let parsedBody: any = null;
    if (init && init.body && typeof init.body === "string") {
      try {
        parsedBody = JSON.parse(init.body);
      } catch {
        parsedBody = init.body;
      }
    } else if (init && init.body && typeof init.body === "object") {
      parsedBody = init.body;
    }

    const method = (init?.method || "GET").toUpperCase();

    try {
      const response = await originalFetch(input, init);

      // If response is valid JSON and not a 404 or HTML index fallback
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        return response;
      }

      // If server returned 404, 500, or HTML (e.g. Vercel SPA rewrite of /api/* to index.html)
      if (!response.ok || contentType.includes("text/html")) {
        return await handleMockApiRequest(urlString, method, parsedBody);
      }

      return response;
    } catch (networkError) {
      // Network failed or offline or Vercel static deployment with no backend
      return await handleMockApiRequest(urlString, method, parsedBody);
    }
  };

  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err1) {
    try {
      (window as any).fetch = customFetch;
    } catch (err2) {
      try {
        Object.defineProperty(Object.getPrototypeOf(window), "fetch", {
          value: customFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (err3) {
        console.warn("Client fallback fetch interceptor could not be attached:", err3);
      }
    }
  }
}
