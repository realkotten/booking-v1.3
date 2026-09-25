import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  getActiveAppointment, 
  getTodayAppointments 
} from '../../utils/appointmentUtils';
import { Appointment } from '../../types';

// Child components
import { ActiveSessionCard } from './ActiveSessionCard';
import { TodayTimeline } from './TodayTimeline';
import { WalkInModal } from './WalkInModal';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

import { Calendar } from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';
import { useLiveClock } from '../../hooks/useLiveClock';

interface TodayViewProps {
  onOpenDossier: (customerId?: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onOpenDossier }) => {
  const { 
    appointments, 
    startAppointment, 
    completeAppointment,
    setSelectedClientForDossier,
    customers,
  } = useAtelier();

  const liveClock = useLiveClock(1000);
  const currentDay = liveClock.dayNumber;

  // Modals state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<{ startTime: string } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Derive today's schedule dynamically from real-time today
  const todayAppointments = getTodayAppointments(appointments, currentDay);
  const activeAppointment = getActiveAppointment(appointments, currentDay);

  const handleStartAppointment = (aptId: string) => {
    startAppointment(aptId);
  };

  const handleCompleteAppointment = (aptId: string) => {
    completeAppointment(aptId);
  };

  const handleOpenClientDossier = (customerId?: string) => {
    if (customerId) {
      const client = customers.find((c) => c.id === customerId);
      if (client) {
        setSelectedClientForDossier(client);
      }
    }
    onOpenDossier(customerId);
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* 1. Active Session Card (Hero Top) */}
      <ActiveSessionCard
        activeAppointment={activeAppointment}
        onCompleteAppointment={handleCompleteAppointment}
        onOpenCustomerDossier={handleOpenClientDossier}
        onQuickWalkIn={() => setIsWalkInOpen(true)}
      />

      {/* 2. Today's Continuous Timeline */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#7e5352]" />
            <h3 className="text-xs font-serif font-bold text-stone-900">
              برنامه زمانی امروز
            </h3>
          </div>
          <span className="text-[10px] text-stone-600 font-mono">
            {toPersianDigits(todayAppointments.length)} نوبت
          </span>
        </div>

        <TodayTimeline
          appointments={todayAppointments}
          onSelectAppointment={(apt) => setSelectedAppointment(apt)}
          onStartAppointment={handleStartAppointment}
          onCompleteAppointment={handleCompleteAppointment}
        />
      </div>

      {/* Modals Styled to Match Customer Panel Glass/Slide-up */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => {
          setIsWalkInOpen(false);
          setSelectedSlotForBooking(null);
        }}
        initialStartTime={selectedSlotForBooking?.startTime}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onOpenDossier={handleOpenClientDossier}
      />
    </div>
  );
};
