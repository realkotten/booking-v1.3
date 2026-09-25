import React from 'react';
import { CalendarClock, Scissors } from 'lucide-react';
import { ClientProfile } from '../../types';

interface RoutineCardProps {
  currentCustomer: ClientProfile;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ currentCustomer }) => {
  const hasRoutine = Boolean(currentCustomer.nextRoutineTargetDate || currentCustomer.routineCadence);

  if (!hasRoutine) {
    return (
      <div className="space-y-2 text-right">
        <div className="p-3 rounded-2xl bg-white/80 border border-white/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-stone-900 block">
              نوبت فعالی ندارید
            </span>
            <p className="text-[10px] text-stone-600 font-medium">
              برای دریافت خدمات تخصصی، نوبت دلخواه خود را آنلاین رزرو نمایید.
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#7e5352]/10 text-[#7e5352] flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-stone-900/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#7e5352]/15 text-[#7e5352] flex items-center justify-center">
            <CalendarClock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#7e5352] block">
              روتین پیشنهادی آرایشگر شما
            </span>
            <h3 className="text-xs font-bold text-stone-900">
              {currentCustomer.routineCadence || currentCustomer.cadence}
            </h3>
          </div>
        </div>

        {currentCustomer.nextRoutineTargetDate && (
          <span className="text-[10px] font-bold text-[#7e5352] bg-white/90 px-2 py-0.5 rounded-full border border-stone-200/70 shadow-2xs">
            موعد: {currentCustomer.nextRoutineTargetDate}
          </span>
        )}
      </div>

      {/* Routine Recommended Service and Barber Note */}
      <div className="bg-white/80 p-2.5 rounded-xl border border-white/90 space-y-1.5 text-right shadow-2xs">
        {currentCustomer.routineServiceTitle && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 text-[10px]">خدمت پیشنهادی آرایشگر:</span>
            <span className="font-bold text-stone-900">
              {currentCustomer.routineServiceTitle}
            </span>
          </div>
        )}

        {currentCustomer.routineBarberNote && (
          <div className="p-2 rounded-lg bg-[#fbdcd9]/30 border border-[#fbdcd9]/60 text-[10px] text-stone-700 leading-relaxed">
            <span className="font-bold text-[#7e5352] block mb-0.5">توصیه آرایشگر:</span>
            <p>{currentCustomer.routineBarberNote}</p>
          </div>
        )}
      </div>
    </div>
  );
};
