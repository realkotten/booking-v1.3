import React from 'react';
import { Clock, CalendarClock, XCircle, QrCode } from 'lucide-react';
import { Appointment } from '../../types';
import { toPersianDigits, formatAppointmentDate } from '../../utils/dateUtils';
import { useAtelier } from '../../store/AtelierContext';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
  relativeTimingText: string | null;
  onReschedule: (apt: Appointment) => void;
  onCancel: (apt: Appointment) => void;
  onOpenPass: (apt: Appointment) => void;
}

export const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({
  appointment,
  relativeTimingText,
  onReschedule,
  onCancel,
  onOpenPass,
}) => {
  const { activeBarber, settings } = useAtelier();
  const defaultBarber = settings?.profile?.masterName?.trim() || activeBarber?.name || 'آرایشگر اختصاصی';
  return (
    <>
      {/* Status Header Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-900/10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#7e5352]">
            {relativeTimingText}
          </span>
        </div>
        <span
          className="text-[10px] font-bold text-stone-600 bg-white/80 px-2 py-0.5 rounded-full border border-white/90"
          dir="ltr"
        >
          #{appointment.appointmentNumber || appointment.id.slice(-6)}
        </span>
      </div>

      {/* Appointment Main Info */}
      <div className="py-1 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-stone-600 block">
            سرویس رزرو شده شما:
          </span>
          <h2 className="text-base font-bold text-stone-900 leading-snug">
            {appointment.service?.name || 'اصلاح مو و پیرایش'}
          </h2>
          <div className="flex items-center gap-2 text-xs text-stone-700 pt-0.5">
            <span className="font-semibold text-stone-900">
              {appointment.barberName || defaultBarber}
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-600">
              {appointment.chairName || 'صندلی اصلی'}
            </span>
          </div>
        </div>

        {/* Big Date & Time Pill */}
        <div className="bg-white/85 border border-white/90 rounded-2xl p-2.5 text-center shrink-0 min-w-[92px] shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium mb-0.5">
            <Clock className="w-3 h-3 text-[#7e5352]" />
            <span>ساعت</span>
          </div>
          <span
            className="text-sm font-bold text-stone-900 block"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {toPersianDigits(appointment.startTime)}
          </span>
          <span className="text-[10px] text-[#7e5352] font-semibold block mt-0.5">
            {formatAppointmentDate(appointment)}
          </span>
        </div>
      </div>

      {/* Quick Actions Bar (Reschedule, Cancel, Boarding Pass) */}
      <div className="pt-2 border-t border-stone-900/10 grid grid-cols-3 gap-1.5">
        <button
          id="home-reschedule-btn"
          type="button"
          onClick={() => onReschedule(appointment)}
          className="py-2 px-2 bg-white/80 hover:bg-white text-stone-800 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all border border-white/90 shadow-xs cursor-pointer"
          title="تغییر تاریخ یا ساعت نوبت"
        >
          <CalendarClock className="w-3.5 h-3.5 text-[#7e5352]" />
          <span>تغییر زمان</span>
        </button>

        <button
          id="home-cancel-btn"
          type="button"
          onClick={() => onCancel(appointment)}
          className="py-2 px-2 bg-rose-50/80 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all border border-rose-200/60 shadow-xs cursor-pointer"
          title="لغو این نوبت"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>لغو نوبت</span>
        </button>

        <button
          id="home-pass-btn"
          type="button"
          onClick={() => onOpenPass(appointment)}
          className="py-2 px-2 bg-[#7e5352]/10 hover:bg-[#7e5352]/20 text-[#7e5352] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#7e5352]/25 shadow-xs cursor-pointer"
          title="مشاهده کارت ورود دیجیتال"
        >
          <QrCode className="w-3.5 h-3.5 text-[#7e5352]" />
          <span>کارت نوبت</span>
        </button>
      </div>
    </>
  );
};
