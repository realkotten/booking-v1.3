import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Scissors, Edit3 } from 'lucide-react';
import { Service, ServiceCategory, ServiceInput } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import { toPersianDigits } from '../../utils/dateUtils';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180, 240];

interface ServiceFormModalProps {
  isOpen: boolean;
  editing: Service | null;
  presetCategoryId?: string;
  categories: ServiceCategory[];
  onClose: () => void;
  onSubmit: (input: ServiceInput) => { success: boolean; message?: string };
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  editing,
  presetCategoryId,
  categories,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ServiceInput>({
    categoryId: '',
    name: '',
    price: 0,
    durationMinutes: 30,
    description: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      editing
        ? {
            categoryId: editing.categoryId || presetCategoryId || categories[0]?.id || '',
            name: editing.name,
            price: editing.price,
            durationMinutes: editing.durationMinutes,
            description: editing.description ?? '',
            isActive: editing.isActive,
          }
        : {
            categoryId: presetCategoryId ?? categories[0]?.id ?? '',
            name: '',
            price: 250000,
            durationMinutes: 45,
            description: '',
            isActive: true,
          }
    );
  }, [isOpen, editing, presetCategoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit({
      ...form,
      name: form.name.trim(),
      price: Math.round(form.price),
      durationMinutes: Math.round(form.durationMinutes),
      description: form.description?.trim(),
    });
    if (!result.success) {
      setError(result.message ?? 'خطای نامشخص در ثبت اطلاعات');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors focus:border-[#7e5352] focus:ring-2 focus:ring-[#7e5352]/20';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl border border-stone-100"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#7e5352]/10 p-2 text-[#7e5352]">
                  {editing ? <Edit3 className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                </div>
                <h3 className="text-base font-black text-stone-900">
                  {editing ? 'ویرایش آیین خدمت' : 'افزودن خدمت جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">نام خدمت *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثلاً: اصلاح موی کلاسیک، فید ژورنالی"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">دسته‌بندی *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">— انتخاب دسته‌بندی —</option>
                  {categories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">قیمت (تومان) *</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10000}
                    value={form.price || ''}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="0"
                    dir="ltr"
                    className={`${inputClass} pl-16 text-left font-bold font-mono`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-stone-400 font-sans">
                    تومان
                  </span>
                </div>
                {form.price > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-[#7e5352]">
                    معادل: {formatPrice(form.price)}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">
                  مدت زمان (دقیقه) * — فعلی: {toPersianDigits(form.durationMinutes)} دقیقه
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  step={5}
                  value={form.durationMinutes || ''}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  dir="ltr"
                  className={`${inputClass} text-left font-mono`}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, durationMinutes: d }))}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        form.durationMinutes === d
                          ? 'border-[#7e5352] bg-[#7e5352] text-white shadow-xs'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {toPersianDigits(d)} دقیقه
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-stone-600">توضیحات و جزئیات (اختیاری)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="مثلاً: شامل شستشو با شامپوی مخصوص و ماساژ سر با حوله گرم"
                />
              </div>

              {/* Active toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 transition-colors hover:bg-stone-50">
                <span className="text-xs font-bold text-stone-700">نمایش در کاتالوگ رزرو آنلاین مراجعین</span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-[#7e5352] rounded"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#7e5352] py-2.5 text-xs font-black text-white transition-colors hover:bg-[#6c4342] shadow-sm"
                >
                  {editing ? 'ذخیره تغییرات' : 'افزودن خدمت'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
