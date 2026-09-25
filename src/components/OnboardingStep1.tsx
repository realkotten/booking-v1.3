import React from 'react';
import { ATELIER_IMAGES } from '../data/mockData';
import { AtelierShell } from './AtelierShell';
import { ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';

interface OnboardingStep1Props {
  onNext: () => void;
  onSkip: () => void;
  onSignIn?: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  onNext,
  onSkip,
}) => {
  return (
    <AtelierShell id="onboarding-step1-container" bottomPadding="pb-8">
      {/* Top Header */}
      <header
        id="onboarding1-header"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-900">
            آرایشگاه رویال
          </span>
        </div>

        <button
          id="onboarding1-skip-btn"
          type="button"
          onClick={onSkip}
          className="text-xs text-stone-700 hover:text-stone-950 font-medium py-1 px-3 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 transition-all"
        >
          رد کردن
        </button>
      </header>

      {/* Main Floating Glass Container */}
      <section
        id="onboarding1-glass-card"
        className="relative z-20 mx-auto w-[346px] bg-white/40 backdrop-blur-2xl rounded-[38px] shadow-2xl border border-white/60 p-3.5 pt-3 pb-3.5 flex flex-col justify-between mt-1 max-h-[660px] overflow-hidden"
        dir="rtl"
      >
        {/* Upper Image Card */}
        <div className="relative w-full h-[220px] rounded-[28px] overflow-hidden shadow-inner shrink-0">
          <img
            src={ATELIER_IMAGES.barberSuite}
            alt="رزرو آسان آرایشگاه رویال"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

          {/* Upper Badges */}
          <div className="absolute top-3.5 right-4 left-4 flex justify-between items-center">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold shadow-sm">
              گام ۱ از ۳
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 text-[10px] font-medium backdrop-blur-md border border-white/20">
              رزرو سریع
            </span>
          </div>

          {/* Lower Title Overlay */}
          <div className="absolute bottom-3 right-4 left-4 text-white">
            <h2 className="text-xl font-bold tracking-tight leading-snug">
              رزرو بدون معطلی
            </h2>
            <p className="text-[11px] text-stone-200 font-light mt-1 leading-relaxed">
              به‌جای تماس تلفنی، نوبت خودتون رو همینجا با چند لمس ثبت کنید — هر ساعتی از شبانه‌روز.
            </p>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="py-3 px-1 space-y-2">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              مشاهده ساعت‌های خالی همه آرایشگرها به‌صورت لحظه‌ای
            </p>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              تایید فوری نوبت بدون نیاز به تماس با آرایشگاه
            </p>
          </div>
        </div>

        {/* Lower Step Controller */}
        <div className="w-full bg-stone-900/95 backdrop-blur-md rounded-[24px] p-3.5 text-white border border-stone-800 shadow-xl shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <span className="w-6 h-1.5 rounded-full bg-amber-400" />
              <span className="w-2 h-1.5 rounded-full bg-stone-700" />
              <span className="w-2 h-1.5 rounded-full bg-stone-700" />
            </div>
            <span className="text-[10px] text-stone-400">گام بعد: خدمات و آرایشگر</span>
          </div>

          <button
            id="onboarding1-next-btn"
            type="button"
            onClick={onNext}
            className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all text-stone-950 rounded-xl text-xs font-bold tracking-normal flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>گام بعدی: خدمات و آرایشگر</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Bottom Info Strip */}
      <section className="relative z-20 px-6 mt-2 shrink-0" dir="rtl">
        <div className="p-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xs flex items-center justify-center text-[11px] text-stone-700 font-medium">
          <span>آرایشگاه رویال · کیفیت کار و وقت‌شناسی</span>
        </div>
      </section>
    </AtelierShell>
  );
};
