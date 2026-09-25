import React, { useState, useMemo } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, BeverageOption, Reservation, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import { addMinutes, calculateBookingTotals, generateUpcomingDays, isSlotExpired } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatUtils';
import { toPersianDigits, getPersianDateForDay } from '../utils/dateUtils';
import { hapticLight, hapticSelection, hapticSuccess, hapticWarning, triggerHaptic } from '../utils/hapticUtils';
import { ArrowRight, Check, Coffee, Phone, ShieldCheck, User, VolumeX, Sparkles, CreditCard, Store, Lock, LogOut } from 'lucide-react';

interface BookCheckoutViewProps {
  service: Service | null;
  selectedDay: number;
  selectedTime: string;
  accoutrements: Accoutrement[];
  onBack: () => void;
  onConfirmBooking: (confirmedRes: Reservation) => void;
  onOpenProfile?: () => void;
}

export const BookCheckoutView: React.FC<BookCheckoutViewProps> = ({
  service,
  selectedDay,
  selectedTime,
  accoutrements,
  onBack,
  onConfirmBooking,
  onOpenProfile,
}) => {
  const { 
    currentCustomer, 
    beverageOptions, 
    activeBarber, 
    activeChair, 
    createOnlineBooking, 
    settings,
    authUser,
    isUserAuthenticated,
    openClientAuthModal,
    signOutUser
  } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedBeverageId, setSelectedBeverageId] = useState<string>('tea');
  const [isQuietSession, setIsQuietSession] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onsite'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync inputs if customer profile or auth updates
  React.useEffect(() => {
    if (currentCustomer?.name && customerName === '') {
      setCustomerName(currentCustomer.name);
    }
    if (currentCustomer?.phone && customerPhone === '') {
      setCustomerPhone(currentCustomer.phone);
    }
  }, [currentCustomer]);

  const days = useMemo(() => generateUpcomingDays(14), []);
  const activeDay = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
  const totals = useMemo(() => calculateBookingTotals(service, accoutrements), [service, accoutrements]);

  const endTime = useMemo(() => {
    if (!selectedTime) return '';
    return addMinutes(selectedTime, totals.totalDuration);
  }, [selectedTime, totals.totalDuration]);

  if (!service) return null;

  const isSelectedSlotExpired = useMemo(
    () => isSlotExpired(selectedDay, selectedTime),
    [selectedDay, selectedTime]
  );

  const handleSubmit = () => {
    if (isSelectedSlotExpired) {
      hapticWarning();
      setErrorMessage('تاریخ یا ساعت انتخابی شما سپری شده است و امکان رزرو ندارد. لطفاً بازگردید و ساعت آینده را انتخاب فرمایید.');
      return;
    }
    if (!customerName.trim()) {
      hapticWarning();
      setErrorMessage('لطفاً نام و نام‌خانوادگی خود را وارد کنید');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      hapticWarning();
      setErrorMessage('لطفاً شماره تماس معتبر (حداقل ۱۰ رقم) وارد کنید');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const selectedBeverage = beverageOptions.find((b) => b.id === selectedBeverageId);
      const selectedDayOption = days.find((d) => d.dayNumber === selectedDay) ?? days[0];
      const targetDateStr = selectedDayOption
        ? `${selectedDayOption.weekday}، ${toPersianDigits(selectedDayOption.dayNumber)} ${selectedDayOption.label.split(' ')[1] || ''}`
        : getPersianDateForDay(selectedDay);

      const res = createOnlineBooking({
        serviceId: service.id,
        dayNumber: selectedDay,
        dateString: targetDateStr,
        startTime: selectedTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        beverageId: selectedBeverageId,
        isQuietSession,
        customerNotes,
        accoutrements: totals.selectedExtras,
      });

      if (!res.success) {
        hapticWarning();
        setErrorMessage(res.error || 'خطا در ثبت نوبت. امکان رزرو این ساعت وجود ندارد.');
        return;
      }

      hapticSuccess();

      if (res.reservation) {
        onConfirmBooking(res.reservation);
      }
    } catch (e: any) {
      hapticWarning();
      setErrorMessage(e?.message || 'خطا در ثبت نوبت. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AtelierShell id="book-checkout-container">
      {/* Top Header */}
      <header id="checkout-header" className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1" dir="rtl">
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onBack();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white/70 shadow-sm transition-transform active:scale-95"
          title="بازگشت به انتخاب زمان"
        >
          <ArrowRight className="h-4 w-4 text-stone-700" />
        </button>

        <div className="text-center">
          <span className="block text-[9px] font-semibold text-[#7e5352]">مرحله نهایی</span>
          <h1 className="font-serif text-sm font-semibold text-stone-900">تأیید و صدور کارت ورود</h1>
        </div>

        {onOpenProfile ? (
          <button
            type="button"
            onClick={() => {
              hapticLight();
              onOpenProfile();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white/70 shadow-sm transition-transform active:scale-95"
            title="پروفایل کاربری"
          >
            <User className="h-4 w-4 text-stone-700" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-36 pt-3" dir="rtl">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-bold text-rose-700 shadow-sm backdrop-blur-md">
            {errorMessage}
          </div>
        )}

        {/* Appointment Recap Card */}
        <section className="mb-3 overflow-hidden rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-stone-900/5 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#7e5352]">خدمت اصلی</span>
              <h2 className="text-sm font-black text-stone-900">{service.name}</h2>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-stone-400 block">{activeBarber?.name}</span>
              <span className="text-xs font-bold text-stone-800">{activeChair?.name}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-stone-100/60 p-2.5">
              <span className="block text-[10px] text-stone-500">تاریخ حضور</span>
              <span className="font-bold text-stone-800">{activeDay.weekday}، {activeDay.label}</span>
            </div>
            <div className="rounded-xl bg-stone-100/60 p-2.5">
              <span className="block text-[10px] text-stone-500">ساعت و مدت زمان</span>
              <span className="font-bold text-stone-800">
                {toPersianDigits(selectedTime)} ({toPersianDigits(totals.totalDuration)} دقیقه)
              </span>
            </div>
          </div>

          {totals.selectedExtras.length > 0 && (
            <div className="mt-3 border-t border-stone-900/5 pt-2.5">
              <span className="text-[10px] font-bold text-stone-500 block mb-1">خدمات تکمیلی:</span>
              <div className="flex flex-wrap gap-1.5">
                {totals.selectedExtras.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-700"
                  >
                    <Check className="h-3 w-3 text-[#7e5352]" />
                    {a.name} ({formatPrice(a.price)})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Customer Information Inputs */}
        <section className="mb-3 space-y-2.5 rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
              <User className="h-4 w-4 text-[#7e5352]" />
              مشخصات مراجع
            </h3>
            {isUserAuthenticated && authUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-800 font-bold max-w-[120px] truncate">
                  {authUser.displayName || 'متصل به گوگل'}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    hapticLight();
                    await signOutUser();
                  }}
                  title="خروج از حساب گوگل"
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-200/60"
                >
                  <LogOut className="w-2.5 h-2.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openClientAuthModal('login')}
                className="text-[10px] text-[#7e5352] font-bold hover:underline flex items-center gap-1"
              >
                <span>ورود با حساب گوگل</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-stone-600">نام و نام‌خانوادگی</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="مثال: آرش کیانی"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs text-stone-900 shadow-sm outline-none focus:border-[#7e5352] focus:ring-2 focus:ring-[#7e5352]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-stone-600">شماره موبایل (جهت ارسال پیامک نوبت)</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-xs font-mono text-stone-900 shadow-sm outline-none focus:border-[#7e5352] focus:ring-2 focus:ring-[#7e5352]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-stone-600">یادداشت یا درخواست ویژه (اختیاری)</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={2}
                placeholder="توضیحات مدل مو، حساسیت یا زمان‌بندی..."
                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 shadow-sm outline-none focus:border-[#7e5352] focus:ring-2 focus:ring-[#7e5352]/20"
              />
            </div>
          </div>
        </section>

        {/* Hospitality & Quiet Session Preferences */}
        <section className="mb-3 space-y-2.5 rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
            <Coffee className="h-4 w-4 text-[#7e5352]" />
            سفارشی‌سازی میزبانی و پذیرایی
          </h3>

          <div className="space-y-2">
            <div>
              <span className="mb-1.5 block text-[10px] font-bold text-stone-600">پذیرایی بدو ورود (رایگان)</span>
              <div className="grid grid-cols-2 gap-2">
                {beverageOptions.slice(0, 4).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      hapticSelection();
                      setSelectedBeverageId(b.id);
                    }}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-right transition-all ${
                      selectedBeverageId === b.id
                        ? 'border-[#7e5352] bg-white font-bold text-stone-900 shadow-sm ring-1 ring-[#7e5352]'
                        : 'border-white/80 bg-white/60 text-stone-600'
                    }`}
                  >
                    <Coffee className="h-3.5 w-3.5 text-[#7e5352]" />
                    <span className="text-[11px]">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('toggle');
                setIsQuietSession((q) => !q);
              }}
              className={`flex w-full items-center justify-between rounded-xl border p-2.5 transition-all ${
                isQuietSession
                  ? 'border-[#7e5352] bg-amber-50/50 text-stone-900'
                  : 'border-white/80 bg-white/60 text-stone-600'
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <VolumeX className="h-4 w-4 text-[#7e5352]" />
                سشن سکوت (عدم مکالمه غیرضروری برای تمرکز و آرامش)
              </span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  isQuietSession ? 'border-[#7e5352] bg-[#7e5352] text-white' : 'border-stone-300 bg-white'
                }`}
              >
                {isQuietSession && <Check className="h-3 w-3" />}
              </div>
            </button>
          </div>
        </section>

        {/* Security and Guarantee */}
        <div className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 p-2.5 text-[10px] text-stone-600 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7e5352]" />
            <span>تضمین رضایت و حریم خصوصی مراجعین رویال</span>
          </div>
          <span className="font-bold text-[#7e5352]">تأیید آنی</span>
        </div>
      </main>

      {/* Floating Price Summary & Confirm Button */}
      <PriceSummary
        service={service}
        accoutrements={accoutrements}
        ctaLabel={
          isSelectedSlotExpired
            ? 'ساعت انتخابی گذشته است'
            : isSubmitting
            ? 'در حال صدور کارت ورود...'
            : 'تأیید نهایی و صدور نوبت'
        }
        onCta={handleSubmit}
        ctaDisabled={isSubmitting || isSelectedSlotExpired}
        disabledHint={
          isSelectedSlotExpired
            ? 'ساعت انتخابی سپری شده است؛ لطفاً بازگردید و ساعت آینده را انتخاب کنید'
            : undefined
        }
      />
    </AtelierShell>
  );
};
