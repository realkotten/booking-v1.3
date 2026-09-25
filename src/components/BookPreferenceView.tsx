import React, { useMemo, useState } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import {
  generateUpcomingDays,
  recordTimeDemand,
  recordCustomerAvailabilityConstraint,
  calculateBookingTotals,
  isSlotExpired,
  areAllSlotsExpiredForDay,
} from '../utils/bookingUtils';
import { toPersianDigits, timeToMinutes, minutesToTime, matchDayConfig, normalizeWeekday } from '../utils/dateUtils';
import { hapticLight, hapticSelection, hapticStepAdvance } from '../utils/hapticUtils';
import {
  ArrowRight,
  Calendar,
  Clock,
  HeartHandshake,
  Info,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react';

interface BookPreferenceViewProps {
  service: Service | null;
  accoutrements: Accoutrement[];
  preferredDay: number;
  preferredTime: string;
  onSetPreferredDay: (day: number) => void;
  onSetPreferredTime: (time: string) => void;
  onBack: () => void;
  onContinue: (day?: number, time?: string) => void;
  onOpenProfile?: () => void;
}

const COMMON_HOURS = [
  '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30',
];

const WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

const WORK_PATTERNS = [
  { id: 'fixed_office', label: 'ساعات اداری ثابت (۸ تا ۱۷)', icon: Briefcase },
  { id: 'shift_rotational', label: 'شیفت‌های چرخشی و متغیر', icon: Clock },
  { id: 'university', label: 'کلاس‌های دانشگاه / مدرسه', icon: GraduationCap },
  { id: 'weekend_only', label: 'فقط عصرها و آخر هفته آزادم', icon: Sparkles },
] as const;

export const BookPreferenceView: React.FC<BookPreferenceViewProps> = ({
  service,
  accoutrements,
  preferredDay,
  preferredTime,
  onSetPreferredDay,
  onSetPreferredTime,
  onBack,
  onContinue,
  onOpenProfile,
}) => {
  const { activeChair, activeBarber, settings, currentCustomer, appointments, logHourDemand, logCustomerConstraint } = useAtelier();
  const days = useMemo(() => generateUpcomingDays(14), []);
  const totals = useMemo(() => calculateBookingTotals(service, accoutrements), [service, accoutrements]);

  const [customHourInput, setCustomHourInput] = useState<string>(preferredTime || '18:00');
  const [preferenceError, setPreferenceError] = useState<string | null>(null);

  // Check whether the customHourInput is expired for preferredDay
  const isSelectedTimeExpired = useMemo(
    () => isSlotExpired(preferredDay, customHourInput),
    [preferredDay, customHourInput]
  );
  
  // Customer constraint state
  const [selectedUnavailableDays, setSelectedUnavailableDays] = useState<string[]>([]);
  const [selectedWorkPattern, setSelectedWorkPattern] = useState<
    'fixed_office' | 'shift_rotational' | 'university' | 'night_shift' | 'weekend_only' | 'custom' | null
  >(null);
  const [shiftNote, setShiftNote] = useState<string>('');
  const [showConstraintBox, setShowConstraintBox] = useState<boolean>(false);
  const [activeShiftFilter, setActiveShiftFilter] = useState<'all' | 'shift1' | 'shift2'>('all');

  const activeDay = days.find((d) => d.dayNumber === preferredDay) ?? days[0];
  const isDayAllExpired = useMemo(() => areAllSlotsExpiredForDay(preferredDay), [preferredDay]);

  // Active operating hours from barber profile or studio settings
  const activeWorkingHours = useMemo(() => {
    if (activeBarber?.workingHours && activeBarber.workingHours.length > 0) {
      return activeBarber.workingHours;
    }
    return settings?.operatingHours || [];
  }, [activeBarber, settings]);

  const activeWorkingDays = useMemo(() => {
    if (activeBarber?.workingDays && activeBarber.workingDays.length > 0) {
      return activeBarber.workingDays;
    }
    return activeWorkingHours.filter((h) => !h.isClosed).map((h) => h.dayOfWeek);
  }, [activeBarber, activeWorkingHours]);

  const currentDayConfig = useMemo(() => {
    return matchDayConfig(activeWorkingHours, activeDay.weekday);
  }, [activeWorkingHours, activeDay.weekday]);

  const isDayOff = useMemo(() => {
    if (!currentDayConfig) return false;
    if (currentDayConfig.isClosed) return true;
    if (activeWorkingDays.length > 0) {
      const normDay = normalizeWeekday(activeDay.weekday);
      const isDayActive = activeWorkingDays.some((d) => normalizeWeekday(d) === normDay);
      if (!isDayActive) return true;
    }
    return false;
  }, [currentDayConfig, activeWorkingDays, activeDay.weekday]);

  // Generate 15-minute chunks for the barber's active working hours
  const { shift1Slots, shift2Slots, allSlots, hasBreak } = useMemo(() => {
    if (isDayOff) {
      return {
        shift1Slots: [],
        shift2Slots: [],
        allSlots: [],
        hasBreak: false,
      };
    }

    const openTime = currentDayConfig?.openTime || '10:00';
    const closeTime = currentDayConfig?.closeTime || '20:30';
    const breakStart = currentDayConfig?.breakStart;
    const breakEnd = currentDayConfig?.breakEnd;

    const openM = timeToMinutes(openTime);
    const closeM = timeToMinutes(closeTime);
    const bStartM = breakStart ? timeToMinutes(breakStart) : null;
    const bEndM = breakEnd ? timeToMinutes(breakEnd) : null;

    const validBreak =
      bStartM !== null &&
      bEndM !== null &&
      bStartM < bEndM &&
      bStartM > openM &&
      bEndM < closeM;

    const s1: string[] = [];
    const s2: string[] = [];
    const all: string[] = [];

    if (validBreak && bStartM !== null && bEndM !== null) {
      // Shift 1: openTime to breakStart in 15-minute chunks
      for (let m = openM; m <= bStartM; m += 15) {
        const t = minutesToTime(m);
        s1.push(t);
        all.push(t);
      }
      // Shift 2: breakEnd to closeTime in 15-minute chunks
      for (let m = bEndM; m <= closeM; m += 15) {
        const t = minutesToTime(m);
        s2.push(t);
        all.push(t);
      }
      return {
        shift1Slots: s1,
        shift2Slots: s2,
        allSlots: all,
        hasBreak: true,
      };
    } else {
      // Continuous shift in 15-minute chunks
      for (let m = openM; m <= closeM; m += 15) {
        const t = minutesToTime(m);
        if (m < 780) {
          s1.push(t);
        } else {
          s2.push(t);
        }
        all.push(t);
      }
      return {
        shift1Slots: s1,
        shift2Slots: s2,
        allSlots: all,
        hasBreak: false,
      };
    }
  }, [currentDayConfig, isDayOff]);

  const visibleShift1Slots = useMemo(
    () => shift1Slots.filter((t) => !isSlotExpired(preferredDay, t)),
    [shift1Slots, preferredDay]
  );
  const visibleShift2Slots = useMemo(
    () => shift2Slots.filter((t) => !isSlotExpired(preferredDay, t)),
    [shift2Slots, preferredDay]
  );
  const visibleAllSlots = useMemo(
    () => allSlots.filter((t) => !isSlotExpired(preferredDay, t)),
    [allSlots, preferredDay]
  );

  const displayedSlots = useMemo(() => {
    if (activeShiftFilter === 'shift1') return visibleShift1Slots;
    if (activeShiftFilter === 'shift2') return visibleShift2Slots;
    return visibleAllSlots;
  }, [activeShiftFilter, visibleShift1Slots, visibleShift2Slots, visibleAllSlots]);

  if (!service) return null;

  const handleSelectTime = (t: string) => {
    if (isSlotExpired(preferredDay, t)) {
      hapticLight();
      setPreferenceError(`ساعت ${toPersianDigits(t)} سپری شده است و امکان رزرو ندارد.`);
      return;
    }
    setPreferenceError(null);
    hapticSelection();
    setCustomHourInput(t);
    onSetPreferredTime(t);
  };

  const toggleUnavailableDay = (dayName: string) => {
    hapticSelection();
    setSelectedUnavailableDays((prev) =>
      prev.includes(dayName) ? prev.filter((d) => d !== dayName) : [...prev, dayName]
    );
  };

  const handleProceed = () => {
    const finalTime = customHourInput.trim() || '18:00';
    if (isSlotExpired(preferredDay, finalTime)) {
      hapticLight();
      setPreferenceError('امکان رزرو برای تاریخ یا ساعت سپری‌شده وجود ندارد. لطفاً ساعت آینده را انتخاب نمایید.');
      return;
    }
    setPreferenceError(null);
    hapticStepAdvance();
    onSetPreferredTime(finalTime);

    const clientName = currentCustomer?.name || 'مشتری محترم';
    const clientPhone = currentCustomer?.phone || '';

    // 1. Record customer preference & demand in app state
    logHourDemand({
      dayNumber: preferredDay,
      requestedTime: finalTime,
      serviceId: service.id,
      serviceName: service.name,
      weekday: activeDay.weekday,
      dateLabel: activeDay.label,
      customerName: clientName,
      customerPhone: clientPhone,
      wasReserved: false,
    });

    // 2. If user provided job/school availability constraints, save them in app state
    if (selectedUnavailableDays.length > 0 || selectedWorkPattern || shiftNote.trim()) {
      logCustomerConstraint({
        customerName: clientName,
        customerPhone: clientPhone,
        unavailableDays: selectedUnavailableDays,
        unavailableTimeWindow:
          selectedWorkPattern === 'fixed_office'
            ? 'ساعات اداری ۸:۰۰ تا ۱۷:۰۰'
            : selectedWorkPattern === 'university'
            ? 'شیفت صبح دانشگاه'
            : selectedWorkPattern === 'weekend_only'
            ? 'شنبه تا چهارشنبه'
            : 'متغیر',
        workPatternType: selectedWorkPattern || 'custom',
        patternNote: shiftNote.trim() || (selectedWorkPattern ? 'ثبت‌شده توسط مشتری' : ''),
      });
    }

    onContinue(preferredDay, finalTime);
  };

  return (
    <AtelierShell id="book-preference-container">
      {/* Top Header */}
      <header
        id="preference-header"
        className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => {
            hapticLight();
            onBack();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white/70 shadow-sm transition-transform active:scale-95"
          title="بازگشت به انتخاب خدمات"
        >
          <ArrowRight className="h-4 w-4 text-stone-700" />
        </button>

        <div className="text-center">
          <span className="block text-[9px] font-semibold text-[#7e5352]">مرحله دوم · ۱ از ۲ زمان‌بندی</span>
          <h1 className="font-serif text-sm font-semibold text-stone-900">
            انتخاب ساعت و روز ایده‌آل شما
          </h1>
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
        {/* Customer Preference Explanation Box */}
        <div className="mb-4 rounded-[24px] border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-amber-100/50 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#7e5352]/10 p-2 text-[#7e5352]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-black text-stone-900">
                ۱. ساعت و روز ایده‌آل خود را مشخص کنید
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-stone-700">
                در صورتی که این زمان در تقویم سالن خالی باشد، نوبت شما مستقیماً ثبت خواهد شد؛ در غیر این‌صورت، در مرحله بعد ساعت‌های آزاد موجود تقویم به شما نمایش داده می‌شود.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Pick Desired Date */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
              <Calendar className="h-4 w-4 text-[#7e5352]" />
              ۱. تاریخ دلخواه برای مراجعه
            </h3>
            <span className="text-[11px] font-bold text-stone-500">
              {activeDay.weekday}، {activeDay.label}
            </span>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => {
              const isSelected = d.dayNumber === preferredDay;
              return (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    onSetPreferredDay(d.dayNumber);
                  }}
                  className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-2xl border p-2.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'border-[#7e5352] bg-[#7e5352] text-white shadow-md'
                      : 'border-white/70 bg-white/70 text-stone-700 hover:bg-white shadow-sm'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-amber-200' : 'text-stone-400'
                    }`}
                  >
                    {d.badge || d.weekday}
                  </span>
                  <span className="mt-0.5 text-base font-black">
                    {toPersianDigits(d.dayNumber)}
                  </span>
                  <span
                    className={`text-[9px] ${
                      isSelected ? 'text-white/80' : 'text-stone-500'
                    }`}
                  >
                    {d.label.split(' ')[1] || ''}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Pick Desired Time */}
        <section className="mt-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-800">
              <Clock className="h-4 w-4 text-[#7e5352]" />
              ۲. ساعت ایده‌آل و مورد نظر شما
            </h3>
            <span className="text-[11px] font-bold text-[#7e5352]">
              ساعت {toPersianDigits(customHourInput)}
            </span>
          </div>

          {/* 15-Minute Slot Chunks for Barber's Working Hours */}
          <div className="space-y-3">
            {/* Shift Info Banner */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-stone-200/80 bg-stone-100/70 px-3 py-2 text-[11px] text-stone-700">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Clock className="h-3.5 w-3.5 text-[#7e5352]" />
                <span>
                  ساعات کاری {settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر'} در {activeDay.weekday}:
                </span>
              </div>
              <div className="font-semibold text-stone-600">
                {isDayOff ? (
                  <span className="text-rose-600 font-bold">تعطیل</span>
                ) : hasBreak ? (
                  <span>
                    {toPersianDigits(currentDayConfig?.openTime || '10:00')} تا{' '}
                    {toPersianDigits(currentDayConfig?.breakStart || '13:00')} و{' '}
                    {toPersianDigits(currentDayConfig?.breakEnd || '16:30')} تا{' '}
                    {toPersianDigits(currentDayConfig?.closeTime || '20:30')}
                  </span>
                ) : (
                  <span>
                    {toPersianDigits(currentDayConfig?.openTime || '10:00')} تا{' '}
                    {toPersianDigits(currentDayConfig?.closeTime || '20:30')}
                  </span>
                )}
              </div>
            </div>

            {/* Shift Filter Pills (All / Shift 1 / Shift 2) */}
            {!isDayOff && hasBreak && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setActiveShiftFilter('all');
                  }}
                  className={`flex-1 rounded-xl py-1.5 text-center text-[11px] font-bold transition-all cursor-pointer ${
                    activeShiftFilter === 'all'
                      ? 'border border-[#7e5352] bg-[#7e5352] text-white shadow-xs'
                      : 'border border-stone-200 bg-white/80 text-stone-700 hover:bg-white'
                  }`}
                >
                  همه ساعات ({toPersianDigits(visibleAllSlots.length)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setActiveShiftFilter('shift1');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    activeShiftFilter === 'shift1'
                      ? 'border border-[#7e5352] bg-[#7e5352] text-white shadow-xs'
                      : 'border border-stone-200 bg-white/80 text-stone-700 hover:bg-white'
                  }`}
                >
                  <Sun className="h-3 w-3" />
                  <span>شیفت صبح ({toPersianDigits(visibleShift1Slots.length)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    setActiveShiftFilter('shift2');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    activeShiftFilter === 'shift2'
                      ? 'border border-[#7e5352] bg-[#7e5352] text-white shadow-xs'
                      : 'border border-stone-200 bg-white/80 text-stone-700 hover:bg-white'
                  }`}
                >
                  <Moon className="h-3 w-3" />
                  <span>شیفت عصر ({toPersianDigits(visibleShift2Slots.length)})</span>
                </button>
              </div>
            )}

            {/* 15-Minute Chunks Grid */}
            {isDayOff ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-rose-500 mb-1" />
                <h4 className="text-xs font-bold text-rose-900">
                  استاد پیرایش در روز {activeDay.weekday} تعطیل است
                </h4>
                <p className="mt-1 text-[11px] text-rose-700">
                  لطفاً روز کاری دیگری را از بخش بالا انتخاب نمایید یا ساعت دلخواه خود را در کادر زیر وارد کنید.
                </p>
              </div>
            ) : displayedSlots.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/80 bg-white/70 p-4 text-center">
                <Clock className="mx-auto h-6 w-6 text-stone-400 mb-1" />
                <h4 className="text-xs font-bold text-stone-800">
                  کلیه ساعات کاری این روز سپری شده‌اند
                </h4>
                <p className="mt-1 text-[11px] text-stone-500">
                  لطفاً تاریخ‌های آینده را از تقویم بالا انتخاب فرمایید یا ساعت دلخواه وارد کنید.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-0.5 no-scrollbar p-0.5">
                {displayedSlots.map((t) => {
                  const isSelected = customHourInput === t;

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleSelectTime(t)}
                      className={`relative flex flex-col items-center justify-center rounded-xl border py-2.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7e5352] bg-[#7e5352] text-white shadow-md ring-2 ring-[#7e5352]/20 font-black'
                          : 'border-white/90 bg-white/80 text-stone-800 shadow-xs hover:bg-white hover:border-[#7e5352]/30'
                      }`}
                    >
                      <span>
                        {toPersianDigits(t)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Time Input */}
          <div className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-stone-700">ساعت دلخواه دیگر:</span>
              <input
                type="time"
                value={customHourInput}
                onChange={(e) => {
                  setPreferenceError(null);
                  setCustomHourInput(e.target.value);
                  onSetPreferredTime(e.target.value);
                }}
                className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-stone-900 shadow-sm outline-none focus:border-[#7e5352] focus:ring-2 focus:ring-[#7e5352]/20"
              />
            </div>
            {isSelectedTimeExpired && (
              <div className="mt-2 rounded-xl bg-amber-50 p-2 text-[11px] font-bold text-amber-800 flex items-center gap-1.5 border border-amber-200">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>این ساعت سپری شده است؛ لطفاً ساعت آینده را مشخص فرمایید.</span>
              </div>
            )}
          </div>
        </section>

        {/* 3. Customer Availability & Job/Shift Constraints Question Box */}
        <section className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => setShowConstraintBox(!showConstraintBox)}
            className="flex w-full items-center justify-between rounded-2xl border border-stone-200/90 bg-white/80 p-3 text-right shadow-sm backdrop-blur-md transition-all hover:bg-white active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#7e5352]" />
              <div>
                <span className="block text-xs font-black text-stone-900">
                  محدودیت‌های شغلی، تحصیلی یا شیفت کاری (اختیاری)
                </span>
                <span className="text-[10px] text-stone-500">
                  برای هماهنگی هرچه بهتر با برنامه کاری شما
                </span>
              </div>
            </div>
            <span className="rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-bold text-[#7e5352]">
              {showConstraintBox ? 'بستن' : '+ ثبت محدودیت'}
            </span>
          </button>

          {showConstraintBox && (
            <div className="space-y-3 rounded-2xl border border-stone-200/90 bg-white/95 p-3.5 shadow-sm animate-fadeIn">
              <p className="text-[11px] leading-5 text-stone-700">
                در چه روزها یا ساعاتی از هفته به دلیل <strong>شغل، دانشگاه، مدرسه یا شیفت کاری</strong> امکان
                مراجعه ندارید؟
              </p>

              {/* Day selection */}
              <div>
                <span className="mb-1.5 block text-[10px] font-bold text-stone-600">
                  روزهایی که امکان حضور ندارید:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((w) => {
                    const isSelected = selectedUnavailableDays.includes(w);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleUnavailableDay(w)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work pattern selection */}
              <div>
                <span className="mb-1.5 block text-[10px] font-bold text-stone-600">
                  الگوی کاری یا تحصیلی:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {WORK_PATTERNS.map((p) => {
                    const isSelected = selectedWorkPattern === p.id;
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedWorkPattern(isSelected ? null : p.id)}
                        className={`flex items-center gap-1.5 rounded-xl border p-2 text-right text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'border-[#7e5352] bg-[#7e5352]/10 text-[#7e5352]'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Note Text Box for Shifts */}
              <div>
                <span className="mb-1 block text-[10px] font-bold text-stone-600">
                  توضیح کوتاه شیفت یا محدودیت (در یک جمله):
                </span>
                <input
                  type="text"
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="مثلاً: شیفت چرخشی بیمارستان ۲۴-۴۸ / روزهای زوج دانشگاه"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#7e5352] focus:bg-white focus:ring-2 focus:ring-[#7e5352]/20"
                />
              </div>
            </div>
          )}
        </section>

        {/* Preference Error Banner */}
        {preferenceError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{preferenceError}</span>
          </div>
        )}

        {/* Informative Note */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/50 p-3 text-[11px] text-stone-600">
          <Info className="h-4 w-4 shrink-0 text-[#7e5352]" />
          <span>
            {isSelectedTimeExpired
              ? `ساعت ${toPersianDigits(customHourInput)} سپری شده است و امکان رزرو ندارد.`
              : `زمان ایده‌آل خود را مشخص فرمایید؛ در صورت آزاد بودن ساعت در تقویم، نوبت بلافاصله تأیید خواهد شد.`}
          </span>
        </div>
      </main>

      {/* Floating Live Price Summary */}
      <PriceSummary
        service={service}
        accoutrements={accoutrements}
        ctaLabel={
          isSelectedTimeExpired
            ? 'ساعت انتخابی گذشته است'
            : 'تأیید زمان ایده‌آل و ادامه'
        }
        onCta={handleProceed}
        ctaDisabled={!customHourInput || isSelectedTimeExpired}
        disabledHint={
          isSelectedTimeExpired
            ? 'ساعت انتخابی سپری شده است؛ لطفاً ساعت آینده را انتخاب نمایید'
            : undefined
        }
      />
    </AtelierShell>
  );
};
