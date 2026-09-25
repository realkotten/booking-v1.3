import React, { useMemo, useState } from 'react';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import { Accoutrement, Service } from '../types';
import { PriceSummary } from './booking/PriceSummary';
import { formatDuration, formatPrice } from '../utils/formatUtils';
import { toPersianDigits } from '../utils/dateUtils';
import { hapticLight, hapticSelection } from '../utils/hapticUtils';
import { Check, Clock, Gift, Plus, Sparkles, User, ShieldCheck } from 'lucide-react';

interface BookServicesViewProps {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  accoutrements: Accoutrement[];
  onToggleAccoutrement: (id: string) => void;
  onContinue: () => void;
  onOpenProfile?: () => void;
}

export const BookServicesView: React.FC<BookServicesViewProps> = ({
  selectedService,
  onSelectService,
  accoutrements,
  onToggleAccoutrement,
  onContinue,
  onOpenProfile,
}) => {
  const { servicesByCategory, categories, activeServices, activeChair, activeBarber, settings } = useAtelier();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const barberName = settings?.profile?.masterName?.trim() || activeBarber?.name || 'استاد پیرایش';

  // Filter categories that have active services
  const populatedCategories = useMemo(() => {
    return categories
      .filter((c) => c.isActive)
      .filter((c) => activeServices.some((s) => s.categoryId === c.id));
  }, [categories, activeServices]);

  const displayedGroups = useMemo(() => {
    if (selectedCatId === 'all') {
      return servicesByCategory
        .map((group) => ({
          ...group,
          items: group.items.filter((s) => s.isActive),
        }))
        .filter((group) => group.items.length > 0);
    }
    return servicesByCategory
      .filter((g) => g.category.id === selectedCatId)
      .map((group) => ({
        ...group,
        items: group.items.filter((s) => s.isActive),
      }))
      .filter((group) => group.items.length > 0);
  }, [servicesByCategory, selectedCatId]);

  // Active accoutrements available for customer booking
  const activeAccoutrements = useMemo(() => {
    return accoutrements.filter((a) => a.isActive !== false);
  }, [accoutrements]);

  const selectedAccoutrementsCount = useMemo(() => {
    return accoutrements.filter((a) => a.selected).length;
  }, [accoutrements]);

  return (
    <AtelierShell id="book-services-container">
      {/* Top Header */}
      <header
        id="services-header"
        className="relative z-30 flex shrink-0 items-center justify-between px-6 pt-1"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#7e5352]/90" />
          <span className="text-[10px] font-medium text-stone-800/80">
            {activeChair?.name || 'سوئیت اختصاصی رویال'}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] font-semibold text-[#7e5352]">مرحله اول</span>
          <h1 className="font-serif text-sm font-semibold text-stone-900">
            انتخاب خدمات و مراقبت‌ها
          </h1>
        </div>

        {onOpenProfile ? (
          <button
            type="button"
            onClick={onOpenProfile}
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
        {/* Section 1: Main Services Header & Category Pills */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-black text-stone-900">۱. انتخاب خدمت اصلی</span>
          <span className="text-[10px] text-stone-500">
            {selectedService ? `انتخاب شده: ${selectedService.name}` : 'یک خدمت را انتخاب فرمایید'}
          </span>
        </div>

        {/* Category Pills Filter */}
        <div className="no-scrollbar mb-3.5 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setSelectedCatId('all');
            }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCatId === 'all'
                ? 'bg-[#7e5352] text-white shadow-sm'
                : 'border border-stone-200 bg-white/80 text-stone-600 hover:bg-white'
            }`}
          >
            همه خدمات ({toPersianDigits(activeServices.length)})
          </button>
          {populatedCategories.map((c) => {
            const count = activeServices.filter((s) => s.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  hapticLight();
                  setSelectedCatId(c.id);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCatId === c.id
                    ? 'bg-[#7e5352] text-white shadow-sm'
                    : 'border border-stone-200 bg-white/80 text-stone-600 hover:bg-white'
                }`}
              >
                {c.name} ({toPersianDigits(count)})
              </button>
            );
          })}
        </div>

        {/* Services Grouped by Category */}
        <div className="space-y-4">
          {displayedGroups.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white/60 p-6 text-center backdrop-blur-sm">
              <p className="text-xs text-stone-500">خدمت فعالی در این دسته‌بندی وجود ندارد</p>
            </div>
          ) : (
            displayedGroups.map(({ category, items }) => (
              <section key={category.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold text-stone-700">{category.name}</h2>
                  <span className="text-[10px] text-stone-400">
                    {toPersianDigits(items.length)} گزینه
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((s) => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          hapticSelection();
                          onSelectService(s);
                        }}
                        className={`w-full rounded-[22px] border p-3.5 text-right transition-all active:scale-[0.99] cursor-pointer ${
                          isSelected
                            ? 'border-[#7e5352] bg-white shadow-md ring-2 ring-[#7e5352]/20'
                            : 'border-white/70 bg-white/60 hover:bg-white/80 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-stone-900">{s.name}</span>
                              {s.tag && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200/60">
                                  {s.tag}
                                </span>
                              )}
                            </div>
                            {s.description && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                                {s.description}
                              </p>
                            )}
                            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-stone-600">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="h-3.5 w-3.5 text-stone-400" />
                                {formatDuration(s.durationMinutes)}
                              </span>
                              <span className="font-bold text-[#7e5352]">
                                {formatPrice(s.price)}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? 'border-[#7e5352] bg-[#7e5352] text-white'
                                : 'border-stone-300 bg-white/80'
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Section 2: Integrated Additional Services (Accoutrements) */}
        {activeAccoutrements.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="flex items-center gap-1.5 text-xs font-black text-stone-900">
                  <Sparkles className="h-4 w-4 text-[#7e5352]" />
                  <span>۲. افزودن خدمات تکمیلی و مراقبتی (اختیاری)</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  می‌توانید هر تعداد خدمت مکمل و اسپا را همزمان به نوبت خود بیفزایید.
                </p>
              </div>
              {selectedAccoutrementsCount > 0 && (
                <span className="shrink-0 rounded-full bg-[#7e5352]/10 px-2.5 py-0.5 text-[10px] font-black text-[#7e5352]">
                  {toPersianDigits(selectedAccoutrementsCount)} مورد انتخاب شد
                </span>
              )}
            </div>

            <div className="space-y-2">
              {activeAccoutrements.map((acc) => {
                const isSelected = Boolean(acc.selected);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      hapticSelection();
                      onToggleAccoutrement(acc.id);
                    }}
                    className={`w-full rounded-[20px] border p-3 text-right transition-all active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? 'border-[#7e5352] bg-white shadow-md ring-2 ring-[#7e5352]/20'
                        : 'border-white/70 bg-white/60 hover:bg-white/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">{acc.name}</span>
                          {acc.tag && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200/60">
                              {acc.tag}
                            </span>
                          )}
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-600">
                            +{toPersianDigits(acc.durationMinutes)} دقیقه
                          </span>
                        </div>

                        {acc.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                            {acc.description}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center gap-2">
                          {acc.isComplimentary ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                              <Gift className="h-3 w-3" />
                              رایگان (هدیه سالن)
                            </span>
                          ) : (
                            <span className="text-xs font-black text-[#7e5352]">
                              {formatPrice(acc.price)}
                            </span>
                          )}
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
          </div>
        )}

        {/* Assurance Banner */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/60 bg-white/40 p-2.5 text-[10px] text-stone-600 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#7e5352]" />
            <span>مدت زمان نوبت بر اساس کلیه خدمات انتخابی به طور هوشمند محاسبه می‌شود</span>
          </div>
        </div>
      </main>

      {/* Floating Live Price Summary */}
      <PriceSummary
        service={selectedService}
        accoutrements={accoutrements}
        ctaLabel={
          selectedService
            ? selectedAccoutrementsCount > 0
              ? 'تأیید و انتخاب زمان نوبت'
              : 'ادامه به انتخاب زمان نوبت'
            : 'انتخاب خدمت اصلی'
        }
        onCta={onContinue}
        ctaDisabled={!selectedService}
        disabledHint="لطفاً ابتدا یک خدمت اصلی را انتخاب کنید"
      />
    </AtelierShell>
  );
};

