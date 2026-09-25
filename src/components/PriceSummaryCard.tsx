import React from 'react';
import { Plus, Receipt } from 'lucide-react';
import { PriceSummary } from '../utils/pricingUtils';
import { formatPrice } from '../utils/formatUtils';

interface Props {
  summary: PriceSummary;
  variant?: 'compact' | 'full';
  className?: string;
}

export const PriceSummaryCard: React.FC<Props> = ({ summary, variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    // Sticky bar / inline total (BookDateTimeView)
    return (
      <div
        dir="rtl"
        className={`flex items-center justify-between rounded-2xl border border-white/70 bg-white/60 px-4 py-2.5 backdrop-blur-xl ${className}`}
      >
        <span className="text-xs font-bold text-stone-600">مبلغ قابل پرداخت</span>
        <span className="text-sm font-black tabular-nums text-[#7e5352]">
          {summary.total > 0 ? formatPrice(summary.total) : '—'}
        </span>
      </div>
    );
  }

  // Itemized receipt (BookCheckoutView)
  return (
    <div
      dir="rtl"
      className={`rounded-[24px] border border-white/70 bg-white/55 p-4 backdrop-blur-xl ${className}`}
    >
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black text-stone-700">
        <Receipt className="h-4 w-4 text-[#7e5352]" />
        ریز صورتحساب
      </h3>
      {summary.lines.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400">هنوز سرویسی انتخاب نشده است</p>
      ) : (
        <ul className="space-y-2">
          {summary.lines.map((line) => (
            <li key={line.id} className="flex items-baseline justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-stone-700">
                {line.kind === 'addon' && <Plus className="h-3 w-3 shrink-0 text-stone-400" />}
                {line.label}
              </span>
              <span className="flex-1 border-b border-dotted border-stone-300/80" aria-hidden="true" />
              <span className="shrink-0 font-bold tabular-nums text-stone-800">
                {formatPrice(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-stone-900/10 pt-3">
        <span className="text-xs font-black text-stone-900">مبلغ نهایی</span>
        <span className="text-base font-black tabular-nums text-[#7e5352]">
          {formatPrice(summary.total)}
        </span>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-stone-400">
        بر اساس تعرفه لحظه‌ای سالن؛ مبلغ پس از تأیید نوبت قطعی می‌شود.
      </p>
    </div>
  );
};
