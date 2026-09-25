import React from 'react';
import { NavigationTab } from '../types';
import { Home, Calendar, CalendarCheck, User } from 'lucide-react';
import { useAtelier } from '../store/AtelierContext';

interface BottomNavBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { currentCustomer, appointments } = useAtelier();

  const isHomeActive = activeTab === 'atelier';
  const isBookActive = activeTab === 'book';
  const isMyBookingsActive = activeTab === 'my_bookings' || activeTab === 'visits';
  const isProfileActive = activeTab === 'client';

  // Count active upcoming appointments for badge
  const upcomingCount = React.useMemo(() => {
    if (!currentCustomer || !appointments) return 0;
    const clean = (p?: string) => (p ? p.replace(/\D/g, '') : '');
    const userPhone = clean(currentCustomer.phone);
    return appointments.filter((a) => {
      const isMine = 
        a.customerId === currentCustomer.id || 
        (userPhone && clean(a.customerPhone) === userPhone) ||
        a.customerName?.trim().toLowerCase() === currentCustomer.name?.trim().toLowerCase();
      return isMine && (a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'reserved');
    }).length;
  }, [appointments, currentCustomer]);

  return (
    <div
      id="royal-bottom-dock-container"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-3.5 px-3"
    >
      <div className="max-w-[390px] mx-auto w-full">
        {/* Telegram-style floating dock pill */}
        <nav
          id="telegram-style-nav-dock"
          aria-label="منوی ناوبری تلگرامی"
          className="pointer-events-auto w-full bg-white/95 backdrop-blur-2xl text-stone-700 rounded-[32px] px-2 py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-white/80 flex items-center justify-between"
          dir="rtl"
        >
          {/* 1. Home Tab (خانه) */}
          <button
            id="nav-tab-home"
            type="button"
            onClick={() => onTabChange('atelier')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none ${
              isHomeActive ? 'text-[#7e5352] font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {/* Telegram-style Capsule for active tab */}
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isHomeActive ? 'bg-[#7e5352]/12 scale-105' : 'bg-transparent'
              }`}
            >
              <Home
                className={`w-[21px] h-[21px] transition-transform duration-200 ${
                  isHomeActive ? 'text-[#7e5352] stroke-[2.4]' : 'text-stone-600 stroke-[1.8] group-hover:scale-110'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isHomeActive ? 'font-bold text-[#7e5352]' : 'font-medium text-stone-600'
              }`}
            >
              خانه
            </span>
          </button>

          {/* 2. Book Tab (رزرو نوبت) */}
          <button
            id="nav-tab-book"
            type="button"
            onClick={() => onTabChange('book')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none ${
              isBookActive ? 'text-[#7e5352] font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isBookActive ? 'bg-[#7e5352]/12 scale-105' : 'bg-transparent'
              }`}
            >
              <Calendar
                className={`w-[21px] h-[21px] transition-transform duration-200 ${
                  isBookActive ? 'text-[#7e5352] stroke-[2.4]' : 'text-stone-600 stroke-[1.8] group-hover:scale-110'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isBookActive ? 'font-bold text-[#7e5352]' : 'font-medium text-stone-600'
              }`}
            >
              رزرو نوبت
            </span>
          </button>

          {/* 3. Appointments Tab (نوبت‌های من) with Telegram-style Badge */}
          <button
            id="nav-tab-my-bookings"
            type="button"
            onClick={() => onTabChange('my_bookings')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none ${
              isMyBookingsActive ? 'text-[#7e5352] font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                isMyBookingsActive ? 'bg-[#7e5352]/12 scale-105' : 'bg-transparent'
              }`}
            >
              <CalendarCheck
                className={`w-[21px] h-[21px] transition-transform duration-200 ${
                  isMyBookingsActive ? 'text-[#7e5352] stroke-[2.4]' : 'text-stone-600 stroke-[1.8] group-hover:scale-110'
                }`}
              />

              {/* Telegram-style Notification Badge */}
              {upcomingCount > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-[17px] h-[17px] px-1 bg-[#2AABEE] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs border border-white leading-none animate-in zoom-in-50">
                  {upcomingCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isMyBookingsActive ? 'font-bold text-[#7e5352]' : 'font-medium text-stone-600'
              }`}
            >
              نوبت‌های من
            </span>
          </button>

          {/* 4. Profile Tab with Circular Photo Avatar (Telegram style) */}
          <button
            id="nav-tab-profile"
            type="button"
            onClick={() => onTabChange('client')}
            className={`group relative flex-1 flex flex-col items-center justify-center min-h-[46px] transition-all duration-200 select-none ${
              isProfileActive ? 'text-[#7e5352] font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div
              className={`relative flex items-center justify-center px-3.5 py-1 rounded-full transition-all duration-200 ${
                isProfileActive ? 'bg-[#7e5352]/12 scale-105' : 'bg-transparent'
              }`}
            >
              {currentCustomer?.avatarUrl ? (
                <div className="relative">
                  <img
                    src={currentCustomer.avatarUrl}
                    alt={currentCustomer.name}
                    referrerPolicy="no-referrer"
                    className={`w-[22px] h-[22px] rounded-full object-cover border transition-all duration-200 ${
                      isProfileActive
                        ? 'border-[#7e5352] ring-1.5 ring-[#7e5352] shadow-xs'
                        : 'border-stone-300 group-hover:border-stone-500'
                    }`}
                  />
                </div>
              ) : (
                <User
                  className={`w-[21px] h-[21px] transition-transform duration-200 ${
                    isProfileActive ? 'text-[#7e5352] stroke-[2.4]' : 'text-stone-600 stroke-[1.8] group-hover:scale-110'
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isProfileActive ? 'font-bold text-[#7e5352]' : 'font-medium text-stone-600'
              }`}
            >
              پروفایل
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};
