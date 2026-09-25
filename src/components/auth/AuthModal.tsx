import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CalendarCheck, 
  Award, 
  Cloud, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  syncUserProfile 
} from '../../firebase';
import { useAtelier } from '../../store/AtelierContext';
import { hapticSuccess, hapticError, hapticLight } from '../../utils/hapticUtils';
import firebaseConfig from '../../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'phone';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentCustomer, setCurrentCustomer } = useAtelier();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const handleCopyHost = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopied(true);
      hapticSuccess();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);
    hapticLight();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Sync user profile with current local customer information if any
      await syncUserProfile(user, {
        displayName: user.displayName || currentCustomer?.name || undefined,
        phoneNumber: user.phoneNumber || (currentCustomer?.phone && currentCustomer.phone !== '۰۹۱۲۳۴۵۶۷۸۹' ? currentCustomer.phone : undefined),
        formulaNotes: currentCustomer?.formulaNotes || undefined,
      });

      // Update current customer state in context
      if (currentCustomer) {
        setCurrentCustomer({
          ...currentCustomer,
          id: user.uid,
          name: user.displayName || currentCustomer.name,
          email: user.email || currentCustomer.email,
          avatarUrl: user.photoURL || currentCustomer.avatarUrl,
          memberTier: 'عضو طلایی رویال',
          roleOrTitle: 'عضو تأییدشده آتلیه',
        });
      }

      hapticSuccess();
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-in status:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('پنجره ورود توسط کاربر بسته شد.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('درخواست ورود لغو شد.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        setErrorMessage(
          `دامنه فعلی برنامه (${currentHost}) در لیست دامنه‌های مجاز فایربیس ثبت نشده است.`
        );
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMessage('خطای اتصال به شبکه اینترنت. لطفاً ارتباط خود را بررسی کنید.');
      } else {
        setErrorMessage(err.message || 'خطا در ورود با حساب گوگل. لطفاً مجدداً تلاش فرمایید.');
      }
      hapticError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#1f1d1b] via-[#171615] to-[#121110] border border-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden z-10"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-64 h-64 bg-[#7e5352]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => {
              hapticLight();
              onClose();
            }}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-[#7e5352] to-amber-700 p-0.5 shadow-lg shadow-amber-950/40 flex items-center justify-center">
              <div className="w-full h-full bg-[#1c1a19] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">ورود به حساب کاربری رویال</h2>
            <p className="text-xs text-stone-400 mt-1">
              همگام‌سازی ابری و دسترسی یکپارچه به نوبت‌ها و سوابق
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs text-right leading-relaxed space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>

              {isUnauthorizedDomain && (
                <div className="pt-2 border-t border-rose-500/20 space-y-2">
                  <div className="text-[11px] text-stone-300">
                    برای رفع این مورد، دامنه زیر را در بخش <b>Authorized Domains</b> کنسول فایربیس ثبت نمایید:
                  </div>

                  <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1.5 pl-2">
                    <span className="flex-1 font-mono text-[10px] text-amber-200 select-all truncate text-left dir-ltr">
                      {currentHost}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>کپی دامنه</span>
                        </>
                      )}
                    </button>
                  </div>

                  <a
                    href={firebaseAuthSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold pt-0.5"
                  >
                    <span>باز کردن تنظیمات دامنه‌های فایربیس (Firebase Console)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {/* Value Propositions */}
          <div className="space-y-2.5 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5">
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>ذخیره و پیگیری خودکار تمامی نوبت‌های رزرو شده</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span>محاسبه و دریافت امتیازات VIP باشگاه مشتریان</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <span>همگام‌سازی ابری سوابق و فرمول‌های استایل در تمام دستگاه‌ها</span>
            </div>
          </div>

          {/* Single Primary Google Sign-in Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-stone-700" />
                  <span>در حال اتصال به Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>ادامه و ورود با حساب گوگل (Google)</span>
                </>
              )}
            </button>

            {/* Privacy and Trust Assurance */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>احراز هویت امن و رمزنگاری‌شده با پروتکل رسمی Google</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
