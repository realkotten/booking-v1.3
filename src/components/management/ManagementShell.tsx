import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { ManagementTab } from '../../types';
import { AtelierShell } from '../AtelierShell';
import { TodayView } from './TodayView';
import { ScheduleView } from './ScheduleView';
import { ClientsView } from './ClientsView';
import { AnalyticsView } from './AnalyticsView';
import { ServiceManagementView } from './ServiceManagementView';
import { ReportsView } from './reports/ReportsView';
import { StudioSettingsView } from './settings/StudioSettingsView';
import { ClientDossierModal } from './ClientDossierModal';
import { 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  Sparkles,
  Bell,
  ChevronDown,
  Scissors,
  Armchair,
  FileText,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';

export const ManagementShell: React.FC = () => {
  const { 
    managementTab, 
    setManagementTab, 
    managementSubTab,
    setManagementSubTab,
    logoutManagement,
    activeChair,
    activeBarber,
    customers,
    selectedClientForDossier,
    setSelectedClientForDossier,
  } = useAtelier();

  const handleOpenDossier = (customerId?: string) => {
    if (customerId) {
      const client = customers.find((c) => c.id === customerId);
      if (client) {
        setSelectedClientForDossier(client);
        return;
      }
    }
    setManagementTab('analytics');
    setManagementSubTab('clients');
  };

  return (
    <AtelierShell id="management-shell-container" isWideLayout={true}>
      {/* 1. Studio Management Top Header */}
      <header
        id="management-header"
        className="relative z-30 px-4 pt-2 pb-1 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        {/* Center Title & Barber Info */}
        <div className="text-right">
          <h1 className="text-xs font-serif font-bold text-stone-900">
            مدیریت آرایشگاه رویال
          </h1>
          <p className="text-[9px] text-stone-600 font-mono">
            {activeBarber.name} · {activeChair.name}
          </p>
        </div>

        {/* Right Action Icons: Return to Client Portal */}
        <div className="flex items-center gap-1.5">
          {/* Switch to Client Portal / Logout Button */}
          <button
            type="button"
            onClick={logoutManagement}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white text-[10px] font-medium px-3 py-1.5 rounded-full transition-all shadow-sm border border-stone-700/60 cursor-pointer"
            title="خروج از پنل مدیریت و بازگشت به نمای مشتری"
          >
            <LogOut className="w-3 h-3 text-amber-400" />
            <span>خروج و نمای مشتری</span>
          </button>
        </div>
      </header>

      {/* 2. Main Floating Monolithic Glass Container (Balanced and Cohesive) */}
      <section
        id="management-main-card"
        style={{ width: '370px', marginRight: '2.5px', marginLeft: '-2.5px' }}
        className="relative z-20 p-3.5 sm:p-4 bg-white/70 backdrop-blur-2xl rounded-[32px] sm:rounded-[36px] shadow-2xl border border-white/80 flex flex-col justify-between mt-1 flex-1 min-h-0 overflow-hidden"
        dir="rtl"
      >
        <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar pb-20">
          {managementTab === 'today' && <TodayView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'schedule' && <ScheduleView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'clients' && (
            <ClientsView
              onOpenDossier={(cId) => {
                const client = customers.find((c) => c.id === cId);
                if (client) setSelectedClientForDossier(client);
              }}
            />
          )}
          {managementTab === 'analytics' && (
            <div className="space-y-3">
              {/* Analytics & Configuration Hub Sub-Navigation Bar */}
              <div 
                id="management-subtabs-bar"
                className="sticky top-0 z-20 flex items-center justify-between p-1 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl shadow-2xs gap-1 overflow-x-auto no-scrollbar"
              >
                {[
                  { id: 'overview', label: 'آمار و تقاضا', icon: BarChart3 },
                  { id: 'clients', label: 'مشتریان', icon: Users },
                  { id: 'reports', label: 'گزارش‌ها', icon: FileText },
                  { id: 'services', label: 'خدمات', icon: Scissors },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = managementSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setManagementSubTab(st.id as any)}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#fbdcd9]' : 'text-stone-500'}`} />
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Render Subtab View */}
              {managementSubTab === 'overview' && <AnalyticsView onOpenDossier={handleOpenDossier} />}
              {managementSubTab === 'clients' && (
                <ClientsView
                  onOpenDossier={(cId) => {
                    const client = customers.find((c) => c.id === cId);
                    if (client) setSelectedClientForDossier(client);
                  }}
                />
              )}
              {managementSubTab === 'reports' && <ReportsView />}
              {managementSubTab === 'services' && <ServiceManagementView />}
              {managementSubTab === 'settings' && <StudioSettingsView />}
            </div>
          )}
          {managementTab === 'settings' && <StudioSettingsView />}
        </div>
      </section>

      {/* Client Dossier Detail & History Modal */}
      <ClientDossierModal
        customer={selectedClientForDossier}
        isOpen={!!selectedClientForDossier}
        onClose={() => setSelectedClientForDossier(null)}
        onNavigateToSchedule={() => setManagementTab('schedule')}
      />

      {/* 3. Bottom Floating Navigation Dock */}
      <div
        id="management-bottom-dock-container"
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-3"
      >
        <div className="px-3 max-w-[380px] mx-auto">
          <nav
            id="management-bottom-dock"
            aria-label="منوی ناوبری مدیریت آتلیه"
            className="pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-full px-3 py-1.5 shadow-2xl border border-white/80 flex items-center justify-between"
            dir="rtl"
          >
            {/* Today Tab */}
            <button
              id="mgmt-tab-today"
              type="button"
              onClick={() => setManagementTab('today')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'today'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Clock className="w-4 h-4" />
                {managementTab === 'today' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                امروز
              </span>
            </button>

            {/* Schedule Tab */}
            <button
              id="mgmt-tab-schedule"
              type="button"
              onClick={() => setManagementTab('schedule')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'schedule'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Calendar className="w-4 h-4" />
                {managementTab === 'schedule' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                برنامه
              </span>
            </button>

            {/* Analytics & Stats Tab */}
            <button
              id="mgmt-tab-analytics"
              type="button"
              onClick={() => setManagementTab('analytics')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'analytics'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
                {managementTab === 'analytics' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                آمار
              </span>
            </button>

            {/* Settings Tab */}
            <button
              id="mgmt-tab-settings"
              type="button"
              onClick={() => setManagementTab('settings')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'settings'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Sliders className="w-4 h-4" />
                {managementTab === 'settings' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                تنظیمات
              </span>
            </button>
          </nav>
        </div>
      </div>
    </AtelierShell>
  );
};
