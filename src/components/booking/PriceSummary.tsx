import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Accoutrement, Service } from '../../types';
import { calculateBookingTotals } from '../../utils/bookingUtils';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';
import { hapticLight, hapticStepAdvance } from '../../utils/hapticUtils';

interface PriceSummaryProps {
  service: Service | null;
  accoutrements: Accoutrement[];
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  disabledHint?: string;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  service, accoutrements, ctaLabel, onCta, ctaDisabled = false, disabledHint,
}) => {
  const [expanded, setExpanded] = useState(false);
  const totals = useMemo(() => calculateBookingTotals(service, accoutrements), [service, accoutrements]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-2xl backdrop-blur-xl">
        {/* Breakdown toggle */}
        <button
          type="button"
          onClick={() => {
            hapticLight();
            setExpanded((e) => !e);
          }}
          className="flex w-full items-center justify-between px-4 py-2 text-[11px] font-bold text-stone-500"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#7e5352]" />
            مدت کل: {toPersianDigits(totals.totalDuration)} دقیقه
          </span>
          <span className="flex items-center gap-1">
            {expanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-stone-900/5"
            >
              <div className="space-y-1.5 px-4 py-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">{service?.name ?? 'خدمتی انتخاب نشده'}</span>
                  <span className="font-bold text-stone-800">{formatPrice(totals.servicePrice)}</span>
                </div>
                {totals.selectedExtras.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-stone-500">
                    <span>+ {a.name}</span>
                    <span>{formatPrice(a.price)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total + CTA */}
        <div className="flex items-center gap-3 border-t border-stone-900/10 px-4 py-3">
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-stone-500">مبلغ قابل پرداخت</p>
            <p className="text-sm font-black text-[#7e5352]">{formatPrice(totals.total)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticStepAdvance();
              onCta();
            }}
            disabled={ctaDisabled}
            title={ctaDisabled ? disabledHint : undefined}
            className="flex-1 rounded-xl bg-[#7e5352] py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-[#6c4342] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
