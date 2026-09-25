import React, { useState, useEffect } from 'react';
import { DynamicIslandNotificationCenter } from './notifications/DynamicIslandNotificationCenter';

interface AtelierShellProps {
  id?: string;
  children: React.ReactNode;
  showStatusBar?: boolean;
  className?: string;
  bottomPadding?: string;
  onNavigateToTab?: (tab: string) => void;
  isWideLayout?: boolean;
}

export const AtelierShell: React.FC<AtelierShellProps> = ({
  id = 'atelier-page-container',
  children,
  showStatusBar = true,
  className = '',
  bottomPadding = 'pb-24',
  onNavigateToTab,
  isWideLayout = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const liveShortTimeEn = `${hours}:${minutes}`;

  const containerSizing = isWideLayout
    ? 'max-w-[430px] sm:max-w-[450px] h-[100dvh] sm:h-[874px] sm:max-h-[94vh]'
    : 'max-w-[420px] h-[100dvh] sm:h-[874px] sm:max-h-[94vh]';

  return (
    <div
      id={id}
      className={`relative w-full ${containerSizing} mx-auto bg-gradient-to-b from-[#d3b3aa] via-[#ebd7ca] to-[#c4ab9d] overflow-hidden rounded-none sm:rounded-[36px] shadow-2xl flex flex-col justify-start border-0 sm:border sm:border-white/30 select-none ${className}`}
    >
      {/* Atmosphere Dreamscape Warm Ambient Lighting (No Dark/Black Corners) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft ambient dawn glow */}
        <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-[#F8D2CF]/40 blur-3xl" />
        <div className="absolute -bottom-10 -right-12 w-80 h-80 rounded-full bg-rose-200/35 blur-3xl" />

        {/* Luminous Warm Pearl Sphere: Top Right */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-gradient-to-br from-white/90 via-[#ebd5c8] to-[#cbb2a3] shadow-lg opacity-85" />
        {/* Surreal Ambient Pink Glow Orb: Left Midground */}
        <div className="absolute top-[38%] -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-white via-[#fbdcd9] to-[#d88d85] shadow-glow-pink" />
        {/* Ground Warm Pearl Orb: Bottom Right Foreground */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-white/90 via-[#ebd5c8] to-[#bfa697] shadow-lg opacity-90" />
      </div>

      {/* iOS Status Bar */}
      {showStatusBar && (
        <header
          id="ios-status-bar"
          style={{ height: '48px' }}
          className="relative z-40 px-6 pt-3.5 pb-2 h-[48px] flex justify-center items-center text-stone-800/80 text-xs font-semibold tracking-tight shrink-0 select-none bg-gradient-to-b from-[#d3b3aa]/90 via-[#d3b3aa]/60 to-transparent backdrop-blur-md"
        >
          <DynamicIslandNotificationCenter onNavigateToTab={onNavigateToTab} />
        </header>
      )}

      <div className={`relative z-20 flex-1 min-h-0 flex flex-col overflow-hidden ${bottomPadding}`}>
        {children}
      </div>
    </div>
  );
};
