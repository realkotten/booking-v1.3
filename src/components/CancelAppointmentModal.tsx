import React from 'react';
import { Appointment } from '../types';
import { AlertCircle, Calendar, Clock, Scissors, X } from 'lucide-react';
import { toPersianDigits, formatAppointmentDate } from '../utils/dateUtils';
import { useAtelier } from '../store/AtelierContext';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (aptId: string) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const { activeBarber, settings } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';

  if (!isOpen || !appointment) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-[32px] p-5 text-stone-900 shadow-2xl space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title and message */}
        <div className="space-y-1 text-right">
          <h2 className="text-base font-serif font-bold text-stone-900">
            لغو نوبت آیین پیرایش
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            آیا از لغو این نوبت اطمینان دارید؟ با لغو نوبت، سوئیت اختصاصی و ساعت انتخابی برای سایر مراجعین آزاد می‌گردد.
          </p>
        </div>

        {/* Appointment Card Preview */}
        <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/60 space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900">
              {appointment.service?.name}
            </span>
            <span className="text-[10px] font-mono text-stone-500" dir="ltr">
              #{appointment.appointmentNumber || appointment.id.slice(-6)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#7e5352]" />
              <span>{formatAppointmentDate(appointment)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#7e5352]" />
              <span>ساعت {toPersianDigits(appointment.startTime)}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
            <span>پیرایشگر: {appointment.barberName || defaultBarber}</span>
            <span>{appointment.chairName || 'سوئیت ۰۱'}</span>
          </div>
        </div>

        {/* Cancellation Policy Note */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900 leading-normal">
          <span className="font-bold block mb-0.5">خط‌مشی تشریفات آتلیه:</span>
          لغو نوبت تا ۲۴ ساعت پیش از شروع آیین بدون جریمه انجام می‌شود و وضعیت نوبت به «لغو شده» تغییر می‌یابد.
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirmCancel(appointment.id)}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>تایید و لغو نوبت</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-all"
          >
            انصراف و حفظ نوبت
          </button>
        </div>
      </div>
    </div>
  );
};
