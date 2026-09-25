import React from 'react';
import { Appointment } from '../../types';
import { 
  Clock, 
  User, 
  Scissors, 
  Coffee, 
  DollarSign, 
  CheckCircle2, 
  Play,
  ChevronLeft
} from 'lucide-react';
import { toPersianDigits, addMinutesToTime } from '../../utils/dateUtils';
import { getAppointmentStatusBadge, getBookingSourceLabel } from '../../utils/statusUtils';

interface TodayTimelineProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onStartAppointment: (aptId: string) => void;
  onCompleteAppointment: (aptId: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  appointments,
  onSelectAppointment,
  onStartAppointment,
  onCompleteAppointment,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-[22px] p-4 text-center">
        <p className="text-xs text-stone-600">نوبتی برای امروز ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {appointments.map((apt, index) => {
        const isBlocked = apt.status === 'blocked';
        const isCancelled = apt.status === 'cancelled';
        const isInProgress = apt.status === 'in_progress';
        const isCompleted = apt.status === 'completed';
        const duration = apt.durationMinutes || 45;
        const endTimeStr = apt.endTime || addMinutesToTime(apt.startTime, duration);
        const statusMeta = getAppointmentStatusBadge(apt.status);

        return (
          <div
            key={apt.id || index}
            onClick={() => onSelectAppointment(apt)}
            className={`rounded-[20px] p-2.5 border transition-all cursor-pointer flex items-center justify-between gap-2 ${
              isInProgress
                ? 'bg-stone-900 text-white border-stone-800 shadow-md'
                : isCompleted
                ? 'bg-white/30 backdrop-blur-md border-white/50 text-stone-700 opacity-90'
                : isBlocked
                ? 'bg-stone-200/50 backdrop-blur-md border-stone-300/60 border-dashed text-stone-600'
                : isCancelled
                ? 'bg-stone-100/40 border-stone-200 text-stone-400 opacity-60'
                : 'bg-white/50 backdrop-blur-md border-white/70 hover:bg-white/70 text-stone-900 shadow-2xs'
            }`}
          >
            {/* Left: Time & Customer */}
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-xl text-center shrink-0 ${
                isInProgress ? 'bg-stone-800 text-[#fbdcd9]' : 'bg-white/70 text-stone-800'
              }`}>
                <span className="font-mono text-[11px] font-bold block">
                  {toPersianDigits(apt.startTime)}
                </span>
                <span className="text-[8px] opacity-70 block font-mono">
                  {toPersianDigits(endTimeStr)}
                </span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${isInProgress ? 'text-white' : 'text-stone-900'}`}>
                    {apt.customerName}
                  </span>
                  {apt.isQuietSession && (
                    <span className="text-[8px] bg-[#fbdcd9] text-[#7e5352] px-1 py-0.2 rounded font-bold">
                      سکوت
                    </span>
                  )}
                </div>
                <p className={`text-[9px] ${isInProgress ? 'text-stone-300' : 'text-stone-600'}`}>
                  {apt.service?.name}
                </p>
              </div>
            </div>

            {/* Right: Status / Quick action */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {isInProgress ? (
                <button
                  type="button"
                  onClick={() => onCompleteAppointment(apt.id)}
                  className="text-[9px] font-bold bg-gradient-to-r from-[#fbdcd9] to-[#d88d85] text-stone-950 px-2.5 py-1 rounded-full shadow-2xs transition-transform active:scale-95"
                >
                  تکمیل
                </button>
              ) : apt.status === 'confirmed' || apt.status === 'reserved' ? (
                <button
                  type="button"
                  onClick={() => onStartAppointment(apt.id)}
                  className="text-[9px] font-bold bg-stone-900 text-white px-2.5 py-1 rounded-full shadow-2xs transition-transform active:scale-95 flex items-center gap-0.5"
                >
                  <Play className="w-2.5 h-2.5 fill-current text-[#fbdcd9]" />
                  <span>شروع</span>
                </button>
              ) : (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                  isCompleted ? 'bg-emerald-100 text-emerald-800' :
                  isBlocked ? 'bg-stone-200 text-stone-700' :
                  isCancelled ? 'bg-rose-100 text-rose-800' :
                  'bg-white/60 text-stone-700'
                }`}>
                  {statusMeta.label}
                </span>
              )}

              <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
