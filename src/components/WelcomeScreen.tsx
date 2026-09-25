import React from 'react';
import { ATELIER_IMAGES } from '../data/mockData';
import { AtelierShell } from './AtelierShell';
import { Scissors, Clock, MessageSquare, HeartHandshake, ArrowLeft, ChevronLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
  onStartOnboarding: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnter,
  onStartOnboarding,
}) => {
  return (
    <AtelierShell id="welcome-screen-container" bottomPadding="pb-8">
      {/* Top Header */}
      <header
        id="welcome-brand-header"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-900">
            آرایشگاه رویال · تهران
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shadow-sm">
          <Scissors className="w-4 h-4" />
        </div>
      </header>

      {/* Main Floating Glass Container */}
      <section
        id="welcome-glass-card"
        className="relative z-20 mx-auto w-[346px] bg-white/40 backdrop-blur-2xl rounded-[38px] shadow-2xl border border-white/60 p-3.5 pt-3 pb-3.5 flex flex-col justify-between mt-1 max-h-[660px] overflow-hidden"
        dir="rtl"
      >
        {/* Upper Centerpiece Image Banner */}
        <div
          className="relative w-full h-[220px] rounded-[28px] overflow-hidden shadow-inner shrink-0 cursor-pointer group"
          onClick={onEnter}
        >
          <img
            src={ATELIER_IMAGES.yourNextCut}
            alt="آرایشگاه رویال تهران"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

          {/* Top Floating Badge */}
          <div className="absolute top-3.5 right-4 left-4 flex justify-between items-center">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-amber-300 border border-white/20">
              سیستم هوشمند رزرو نوبت
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-semibold">
              پذیرش آنلاین
            </span>
          </div>

          {/* Bottom Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl font-bold tracking-tight leading-snug">
              رزرو نوبت آرایشگاه، بدون تماس تلفنی
            </h2>
            <p className="text-[11px] text-stone-200 font-light mt-1 leading-relaxed">
              نوبتتون رو در چند ثانیه رزرو کنید، آرایشگر و ساعت دلخواهتون رو انتخاب کنید و یادآوری خودکار دریافت کنید.
            </p>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="py-2.5 px-1 space-y-1.5">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-stone-900">
              رزرو آنلاین ۲۴ ساعته
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-stone-900">
              یادآوری خودکار پیامکی
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-stone-900">
              سابقه و سلیقه شما نزد آرایشگر ثبت می‌شود
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full bg-stone-900/95 backdrop-blur-md rounded-[24px] p-3 text-white border border-stone-800 shadow-xl shrink-0 space-y-2">
          <button
            id="welcome-start-booking-btn"
            type="button"
            onClick={onStartOnboarding}
            className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] transition-all text-stone-950 rounded-xl text-xs font-bold tracking-normal flex items-center justify-center gap-2 shadow-md"
          >
            <span>شروع و رزرو نوبت</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            id="welcome-direct-services-btn"
            type="button"
            onClick={onEnter}
            className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl text-xs font-medium tracking-normal flex items-center justify-center gap-1.5 border border-white/15 transition-all"
          >
            <span>مشاهده مستقیم خدمات</span>
            <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </section>

      {/* Footer Info Strip */}
      <section className="relative z-20 px-6 mt-2 shrink-0" dir="rtl">
        <div className="p-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xs flex items-center justify-between text-[11px] text-stone-800 font-medium">
          <span>شعبه سعادت‌آباد · پذیرش با رزرو قبلی</span>
          <span className="text-emerald-700 font-bold">آماده خدمات</span>
        </div>
      </section>
    </AtelierShell>
  );
};
