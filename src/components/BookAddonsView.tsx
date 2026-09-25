import React from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import { formatDuration, formatPrice } from '../utils/formatUtils';
import { toPersianDigits } from '../utils/dateUtils';
import { hapticLight, hapticSelection } from '../utils/hapticUtils';
import { ArrowRight, Check, Clock, Sparkles, User, Plus, ShieldCheck } from 'lucide-react';

interface BookAddonsViewProps {
  selectedService: Service | null;
  accoutrements: Accoutrement[];
  onToggleAccoutrement: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onOpenProfile?: () => void;
}

export const BookAddonsView: React.FC<BookAddonsViewProps> = ({
  selectedService,
  accoutrements,
  onToggleAccoutrement,
  onBack,
  onContinue,
  onOpenProfile,
}) => {
  const { activeChair, activeBarber, settings } = useAtelier();
  const barberName = settings?.profile?.masterName?.trim() || activeBarber?.name || 'استاد پیرایش';
  const selectedCount = accoutrements.filter((a) => a.selected).length;

  if (!selectedService) return null;

  return (
    <AtelierShell id="book-addons-container">
      {/* Top Header */}
      <header
        id="addons-header"
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
          title="بازگشت به انتخاب سرویس اصلی"
        >
          <ArrowRight className="h-4 w-4 text-stone-700" />
        </button>

        <div className="text-center">
          <span className="block text-[9px] font-semibold text-[#7e5352]">مرحله دوم</span>
          <h1 className="font-serif text-sm font-semibold text-stone-900">
            خدمات تکمیلی و اختصاصی
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
        {/* Selected Main Service Recap */}
        <div className="mb-4 rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#7e5352]">خدمت اصلی انتخاب شده</span>
              <h2 className="text-sm font-black text-stone-900">{selectedService.name}</h2>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-stone-600">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5 text-stone-400" />
                  {formatDuration(selectedService.durationMinutes)}
                </span>
                <span className="font-bold text-[#7e5352]">
                  {formatPrice(selectedService.price)}
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/90 px-3 py-1.5 text-center border border-amber-200/70 shadow-xs">
              <span className="text-[9px] font-medium text-stone-500 block">مجری اختصاصی</span>
              <span className="text-xs font-black text-stone-900">{barberName}</span>
            </div>
          </div>
        </div>

        {/* Section Title & Description */}
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-stone-900 tracking-tight">
              <Sparkles className="h-4 w-4 text-[#7e5352]" />
              افزودن خدمات مکمل و مراقبتی (اختیاری)
            </h3>
            {selectedCount > 0 && (
              <span className="rounded-full bg-[#7e5352]/10 px-2 py-0.5 text-[10px] font-bold text-[#7e5352]">
                {toPersianDigits(selectedCount)} مورد افزوده شد
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-stone-600">
            برای تجربه کامل‌تر و رسیدگی ویژه به مو و پوست، می‌توانید آیتم‌های زیر را به نوبت خود
            اضافه کنید.
          </p>
        </div>

        {/* Accoutrements List */}
        <div className="space-y-2.5">
          {accoutrements.map((acc) => {
            const isSelected = Boolean(acc.selected);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  hapticSelection();
                  onToggleAccoutrement(acc.id);
                }}
                className={`w-full rounded-[22px] border p-4 text-right transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-[#7e5352] bg-white shadow-md ring-2 ring-[#7e5352]/20'
                    : 'border-white/70 bg-white/60 hover:bg-white/80 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{acc.name}</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-600">
                        +{toPersianDigits(acc.durationMinutes)} دقیقه
                      </span>
                    </div>

                    {acc.description && (
                      <p className="mt-1 text-xs leading-5 text-stone-500">{acc.description}</p>
                    )}

                    <div className="mt-2 text-xs font-black text-[#7e5352]">
                      {formatPrice(acc.price)}
                    </div>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? 'border-[#7e5352] bg-[#7e5352] text-white'
                        : 'border-stone-300 bg-white/80 text-stone-400'
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 p-2.5 text-[10px] text-stone-600 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7e5352]" />
            <span>مدت زمان نوبت بر اساس خدمات انتخابی به صورت هوشمند محاسبه می‌شود</span>
          </div>
        </div>
      </main>

      {/* Floating Live Price Summary */}
      <PriceSummary
        service={selectedService}
        accoutrements={accoutrements}
        ctaLabel={selectedCount > 0 ? 'تأیید و انتخاب زمان نوبت' : 'ادامه به انتخاب زمان نوبت'}
        onCta={onContinue}
      />
    </AtelierShell>
  );
};
