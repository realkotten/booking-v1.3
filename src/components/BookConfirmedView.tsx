import React, { useState } from 'react';
import { Reservation } from '../types';
import { AtelierShell } from './AtelierShell';
import { ArrowRight, User, Scissors, Check, Calendar, MapPin, CheckCircle, MessageSquare, ShieldCheck, QrCode, Receipt } from 'lucide-react';
import { hapticLight, hapticStepAdvance } from '../utils/hapticUtils';
import { formatPrice } from '../utils/formatUtils';
import { toPersianDigits, formatAppointmentDate } from '../utils/dateUtils';

interface BookConfirmedViewProps {
  reservation: Reservation | null;
  onReturnHome: () => void;
  onOpenConcierge?: () => void;
  onOpenProfile: () => void;
}

export const BookConfirmedView: React.FC<BookConfirmedViewProps> = ({
  reservation,
  onReturnHome,
  onOpenConcierge,
  onOpenProfile,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    hapticLight();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleConcierge = () => {
    if (onOpenConcierge) {
      onOpenConcierge();
    } else {
      triggerToast('کانسیرج آتلیه آماده راهنمایی شماست');
    }
  };

  if (!reservation) {
    return (
      <AtelierShell id="book-confirmed-empty-container">
        <header className="relative z-30 px-6 pt-1 flex items-center justify-between shrink-0" dir="rtl">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/50 text-stone-800 text-xs font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>خانه</span>
          </button>
        </header>
        <section className="relative z-20 mx-auto w-[346px] bg-white/30 backdrop-blur-2xl rounded-[38px] p-6 text-center mt-8">
          <p className="text-sm font-serif font-bold text-stone-900">نوبتی یافت نشد</p>
          <button
            type="button"
            onClick={onReturnHome}
            className="mt-4 px-4 py-2 bg-[#151517] text-white rounded-xl text-xs font-medium"
          >
            بازگشت به خانه آتلیه
          </button>
        </section>
      </AtelierShell>
    );
  }

  return (
    <AtelierShell id="book-confirmed-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#151517] text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-white/20 animate-fade-in" dir="rtl">
          <CheckCircle className="w-3.5 h-3.5 text-[#fbdcd9]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header
        id="confirmed-header"
        className="relative z-30 px-6 pt-1 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onReturnHome();
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 text-stone-800 text-xs font-medium transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>خانه</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm font-serif font-semibold text-stone-900">
            کارت دیجیتال ورود
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticLight();
            onOpenProfile();
          }}
          className="w-8 h-8 rounded-full bg-[#151517] text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow-sm"
          title="پروفایل مراجع"
        >
          <User className="w-3.5 h-3.5 text-[#fbdcd9]" />
        </button>
      </header>

      {/* Main Floating Monolithic Glass Container */}
      <section
        id="confirmed-glass-card"
        className="relative z-20 mx-auto w-[346px] bg-white/30 backdrop-blur-2xl rounded-[38px] shadow-2xl border border-white/60 p-3 pt-3 pb-3 flex flex-col justify-between mt-1 max-h-[660px] overflow-hidden"
        dir="rtl"
      >
        {/* Upper Window: Luminous Status Pill */}
        <div className="bg-white/40 backdrop-blur-md rounded-[26px] p-3 border border-white/70 shadow-sm shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink flex items-center justify-center border border-white/60">
              <Check className="w-5 h-5 text-stone-900 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9px] font-semibold text-[#7e5352] block">
                نوبت تایید شد · سوئیت ۰۱
              </span>
              <h2 className="text-sm font-serif font-bold text-stone-900" dir="ltr">
                #{reservation.reservationNumber}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerToast('کارت به کیف پول اپل افزوده شد')}
            className="px-2.5 py-1 rounded-full bg-[#151517] text-white text-[10px] font-medium flex items-center gap-1 shadow-sm hover:bg-black transition-all"
          >
            <span>کیف پول اپل</span>
          </button>
        </div>

        {/* Middle Section (Scrollable): Digital Boarding Pass Ticket */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5 my-1 max-h-[290px]">
          {/* Obsidian Boarding Pass */}
          <div className="bg-[#151517]/95 text-white rounded-[26px] p-4 border border-stone-700/60 shadow-xl space-y-3 relative overflow-hidden text-right">
            {/* Ambient watermarking */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#fbdcd9]/10 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between border-b border-stone-800 pb-2.5">
              <div>
                <p className="text-[9px] text-[#E9B9B5] font-semibold">
                  کارت ورود انحصاری آتلیه ونس
                </p>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">
                  {reservation.service.name}
                </h3>
              </div>
              <Scissors className="w-4 h-4 text-[#E9B9B5]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[9px] text-stone-400">تاریخ و ساعت نوبت</p>
                <p className="text-white font-medium text-[11px] mt-0.5">
                  {formatAppointmentDate(reservation)} · {toPersianDigits(reservation.selectedTime || reservation.startTime)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-stone-400">استاد پیرایشگر</p>
                <p className="text-white font-medium text-[11px] mt-0.5">
                  {reservation.artisan}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-stone-400">سوئیت خصوصی</p>
                <p className="text-white font-medium text-[11px] mt-0.5">
                  سوئیت ۰۱ · خیابان مرسر ۴۲
                </p>
              </div>
              <div>
                <p className="text-[9px] text-stone-400">پذیرایی اختصاصی</p>
                <p className="text-[#E9B9B5] font-medium text-[11px] mt-0.5 truncate">
                  {reservation.beverage.name}
                </p>
              </div>
            </div>

            {/* Price Snapshot Itemized Breakdown */}
            <div className="pt-2 border-t border-stone-800 text-[10px]">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-[#E9B9B5]" />
                  <span>رسید تاییدشده نوبت</span>
                </span>
                <span className="font-bold text-white">
                  {reservation.priceSummary 
                    ? formatPrice(reservation.priceSummary.total) 
                    : formatPrice(reservation.totalAmount || reservation.service.price)}
                </span>
              </div>
              {reservation.priceSummary && (
                <div className="space-y-0.5 text-[9px] text-stone-400">
                  {reservation.priceSummary.lines.map((l, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[170px]">{l.label}</span>
                      <span>{l.amount > 0 ? formatPrice(l.amount) : 'رایگان'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiet Session or Customer Notes Badges */}
            {(reservation.isQuietSession || reservation.customerNotes) && (
              <div className="pt-2 border-t border-stone-800 space-y-1">
                {reservation.isQuietSession && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#fbdcd9] bg-white/10 px-2.5 py-1 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fbdcd9]" />
                    <span>آیین سکوت و تمرکز ذهن (Quiet Session)</span>
                  </div>
                )}
                {reservation.customerNotes && (
                  <p className="text-[9px] text-stone-400 italic bg-black/30 px-2 py-1 rounded-lg">
                    یادداشت مراجع: «{reservation.customerNotes}»
                  </p>
                )}
              </div>
            )}

            {/* Simulated Digital Barcode Strip for private suite door NFC */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-7 h-7 text-white/80" />
                <div>
                  <p className="text-[8px] text-stone-400">کلید دیجیتال ورود NFC</p>
                  <p className="text-[10px] font-mono text-[#E9B9B5]">TAP-TO-UNLOCK-SUITE</p>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                فعال
              </span>
            </div>
          </div>

          {/* Valet & Courtyard Card */}
          <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7e5352] shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-900 leading-tight">
                  مجوز پارک و ولت حیاط اختصاصی
                </p>
                <p className="text-[9px] text-stone-600">
                  خیابان مرسر ۴۲ · کد اختصاصی #VALET-42
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConcierge}
              className="text-[10px] font-semibold text-[#7e5352] bg-white/70 px-2.5 py-1 rounded-full border border-[#7e5352]/20 hover:bg-white transition-all flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>کانسیرج</span>
            </button>
          </div>
        </div>

        {/* Card Lower Section: Charcoal Floating Ticket Module */}
        <div className="w-full bg-[#151517]/95 backdrop-blur-md rounded-[24px] p-3.5 text-white border border-stone-700/60 shadow-xl shrink-0 mt-1">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => triggerToast('به تقویم شخصی افزوده شد')}
              className="py-2 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-white/10 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#E9B9B5]" />
              <span>افزودن به تقویم</span>
            </button>
            <button
              type="button"
              onClick={handleConcierge}
              className="py-2 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-white/10 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#E9B9B5]" />
              <span>ارتباط با سوئیت</span>
            </button>
          </div>

          <button
            id="confirmed-home-btn"
            type="button"
            onClick={() => {
              hapticStepAdvance();
              onReturnHome();
            }}
            className="w-full py-2.5 px-3 bg-[#FAF8F5] hover:bg-white active:scale-[0.98] transition-all text-stone-900 rounded-xl text-xs font-semibold tracking-normal flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>بازگشت به خانه آتلیه</span>
          </button>
        </div>
      </section>

      {/* Sanctuary Courtyard & Valet Status Strip */}
      <section className="relative z-20 px-6 mt-2 shrink-0" dir="rtl">
        <div className="p-2.5 rounded-2xl bg-white/35 backdrop-blur-xl border border-white/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-[#7e5352] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-900 leading-tight">
                دسترسی اختصاصی صادر شد
              </p>
              <p className="text-[9px] text-stone-600">
                قفل درب به محض رسیدن به محوطه باز خواهد شد
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-stone-800 bg-white/60 px-2.5 py-1 rounded-full border border-white/60">
            آماده ورود
          </span>
        </div>
      </section>
    </AtelierShell>
  );
};
