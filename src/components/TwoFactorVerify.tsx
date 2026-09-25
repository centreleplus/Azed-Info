import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Mail, 
  Smartphone
} from "lucide-react";
import { AppLogo } from "./Logo";

interface TwoFactorVerifyProps {
  tempToken: string;
  userId?: string;
  emailMasked: string;
  method?: "email" | "totp";
  onSuccess: (data: { user: any; token: string }) => void;
  onCancel: () => void;
  logoText?: string;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  tempToken,
  userId,
  emailMasked,
  method = "email",
  onSuccess,
  onCancel,
  logoText = "A-Zed Info"
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 5-minute main OTP countdown timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    // Auto-focus first digit input
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Main 5-minute expiration countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend 60-second rate-limit cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (cleanDigits.length > 0) {
        const newDigits = [...digits];
        cleanDigits.forEach((digit, i) => {
          if (index + i < 6) {
            newDigits[index + i] = digit;
          }
        });
        setDigits(newDigits);
        const nextIdx = Math.min(index + cleanDigits.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const singleVal = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = singleVal;
    setDigits(newDigits);

    // Auto-advance to next input box
    if (singleVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = digits.join("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fullCode.length < 6) {
      setErrorMessage("Veuillez saisir les 6 chiffres du code de vérification.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, userId, otpCode: fullCode, code: fullCode })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.msg || "Code de vérification incorrect ou expiré.");
      }

      setSuccessMessage("Code 2FA validé avec succès ! Connexion à l'espace Administrateur...");
      setTimeout(() => {
        onSuccess(data);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Échec de la vérification du code 2FA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/send-2fa-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, userId })
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || data.msg || "Impossible d'envoyer un nouveau code. Veuillez réessayer.");
      }

      // Reset OTP 5-min expiration timer & start 60s resend cooldown
      setTimeLeft(300);
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      setSuccessMessage(`Un nouveau code 2FA a été envoyé à l'adresse e-mail ${data.maskedEmail || emailMasked}.`);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors du renvoi du code de sécurité.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center space-y-6 relative isolate bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl">
      {/* Decorative Red Geometric Shapes */}
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-red-600 opacity-20 pointer-events-none -z-10" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-xl bg-red-600 opacity-20 rotate-12 pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-8 w-28 h-36 rounded-xl bg-red-500 opacity-20 rotate-45 pointer-events-none -z-10" />

      {/* Top Bar with Badge and Cancel Action */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-700 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Double Vérification (2FA) Admin
        </span>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-extrabold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Annuler</span>
        </button>
      </div>

      {/* Brand Icon & Heading */}
      <div className="space-y-2">
        <div className="flex justify-center mb-1">
          <div className="p-3.5 bg-gradient-to-tr from-[#133F85] to-blue-900 text-white rounded-2xl shadow-lg border border-blue-400/30">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight">
          Vérification de Sécurité
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Accès sécurisé pour l'Espace Administrateur <span className="font-bold text-slate-800">A-Zed Info</span>. Veuillez saisir le code secret à 6 chiffres envoyé à votre adresse e-mail.
        </p>
      </div>

      {/* Masked Recipient Email & Timer Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            {method === "totp" ? <Smartphone size={16} /> : <Mail size={16} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {method === "totp" ? "App Authentificateur" : "E-mail de destination"}
            </p>
            <p className="text-xs font-mono font-bold text-slate-800 truncate">
              {emailMasked}
            </p>
          </div>
        </div>

        {/* Dynamic Countdown Timer */}
        <div className="text-right shrink-0">
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            <Clock size={10} className="text-amber-600" /> Expiration
          </p>
          <p className={`text-xs font-mono font-black ${timeLeft < 60 ? "text-rose-600 animate-pulse" : "text-amber-700"}`}>
            {formatTimer(timeLeft)}
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold text-left flex items-start gap-2.5 shadow-xs animate-fade-in">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-left flex items-start gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 6-Digit OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
            Code de vérification OTP (6 chiffres)
          </label>
          <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isLoading}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl font-black rounded-xl border transition-all outline-none shadow-xs ${
                  digit 
                    ? "border-amber-500 bg-amber-50/50 text-slate-900 ring-2 ring-amber-500/20" 
                    : "border-slate-200 bg-slate-50 text-slate-800 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading || fullCode.length < 6 || timeLeft <= 0}
          className="w-full py-4 bg-[#133F85] hover:bg-[#10326d] active:scale-[0.99] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Vérification en cours...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>VALIDER LA DOUBLE VÉRIFICATION →</span>
            </>
          )}
        </button>
      </form>

      {/* Resend Code Section with Cooldown */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">Vous n'avez pas reçu le code ?</span>
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending || resendCooldown > 0}
          className="font-extrabold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          {isResending ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : resendCooldown > 0 ? (
            <span>Patienter ({resendCooldown}s)</span>
          ) : (
            <span>Renvoyer le code</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
