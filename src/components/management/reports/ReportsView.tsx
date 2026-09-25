import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { AnalyticsPeriod, AnalyticsSummary, Appointment } from '../../../types';
import { calculateAnalyticsSummary } from '../../../utils/analyticsUtils';
import { downloadCSV, generateFinancialReportCSV } from '../../../utils/reportExportUtils';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Scissors, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { AnalyticsDetailModal } from '../analytics/AnalyticsDetailModal';

export const ReportsView: React.FC = () => {
  const { 
    appointments, 
    pastAppointments, 
    customers, 
    services, 
    settings, 
    setSelectedClientForDossier, 
    setSelectedAppointmentForDetails 
  } = useAtelier();

  // Period Selection
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const [customRange, setCustomRange] = useState<{ startDay: number; endDay: number }>({
    startDay: 1,
    endDay: 22,
  });

  // Active Report Tab
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'services' | 'customers'>('financial');

  // Detail Modal State
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    inspectionType: 'total' | 'service' | 'transactions' | 'appointments';
  }>({
    isOpen: false,
    inspectionType: 'total',
  });

  // Calculate dynamic analytics summary with target from settings
  const targetRevenue = settings.financialTargets[selectedPeriod] || 18000;
  const summary: AnalyticsSummary = useMemo(() => {
    return calculateAnalyticsSummary(
      appointments,
      pastAppointments,
      [],
      customers,
      services,
      [],
      selectedPeriod,
      selectedPeriod === 'custom' ? customRange : undefined,
      targetRevenue
    );
  }, [appointments, pastAppointments, customers, services, selectedPeriod, targetRevenue, customRange]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = generateFinancialReportCSV(summary);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Atelier_Report_${summary.period}_${dateStr}.csv`;
    downloadCSV(filename, csvContent);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
        <div>
          <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#cbb5b4]" />
            <span>گزارش‌ها و صورت‌های تفکیکی آتلیه</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            استخراج، تجزیه و تحلیل شاخص‌های مالی و عملکرد آتلیه
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#7e5352]/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ گزارش رسمی</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800">
          {[
            { id: 'today', label: 'امروز' },
            { id: 'week', label: 'هفته جاری' },
            { id: 'month', label: 'ماه جاری' },
            { id: 'year', label: 'سال ۱۴۰۳' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPeriod(p.id as AnalyticsPeriod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriod === p.id
                  ? 'bg-[#7e5352] text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#cbb5b4]" />
          <span>محدوده گزارش: <strong className="text-stone-200">{summary.dateRangeDescription}</strong></span>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'financial', label: 'گزارش مالی و تراز کل', icon: DollarSign },
          { id: 'services', label: 'عملکرد آیین‌های پیرایش', icon: Scissors },
          { id: 'customers', label: 'فعالیت و وفاداری مشتریان', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-stone-800 text-[#cbb5b4] border border-stone-700/80 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#cbb5b4]' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: FINANCIAL SUMMARY REPORT ────────────────────────── */}
      {activeReportTab === 'financial' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top High-level Financial KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'total'
              })}
              className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 transition-colors cursor-pointer space-y-2"
            >
              <span className="text-xs text-stone-400 block">درآمد کل آتلیه</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold text-stone-100">
                  {formatPrice(summary.totalRevenue)}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                {toPersianDigits(summary.transactionCount)} تراکنش موفق
              </div>
            </div>

            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'service'
              })}
              className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 transition-colors cursor-pointer space-y-2"
            >
              <span className="text-xs text-stone-400 block">درآمد آیین‌های پیرایش</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold text-[#cbb5b4]">
                  {formatPrice(summary.serviceRevenue)}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400">
                {toPersianDigits(summary.servicePct)}٪ از کل درآمد
              </div>
            </div>

            <div 
              onClick={() => setDrillDownModal({
                isOpen: true,
                inspectionType: 'appointments'
              })}
              className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-stone-700 transition-colors cursor-pointer space-y-2"
            >
              <span className="text-xs text-stone-400 block">ضریب اشغال تقویم</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold text-amber-300">
                  ٪{toPersianDigits(summary.occupancyRate || 0)}
                </span>
              </div>
              <div className="text-[11px] text-amber-400">
                بهره‌وری صندلی
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
              <span className="text-xs text-stone-400 block">میانگین ارزش فاکتور (ATV)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold text-stone-100">
                  {formatPrice(summary.avgTransactionValue)}
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                شاخص بهره‌وری به ازای هر تراکنش
              </div>
            </div>
          </div>

          {/* Target & Budget Progress */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-stone-100">
                  تحقق هدف و بودجه مالی دوره
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-stone-300">
                {formatPrice(summary.financialTarget.currentRevenue)} / {formatPrice(summary.financialTarget.targetAmount)}
              </span>
            </div>

            <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7e5352] to-amber-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.financialTarget.achievedPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
              <span>
                درصد تحقق: <strong className="text-emerald-400 font-mono font-bold">{toPersianDigits(summary.financialTarget.achievedPct)}٪</strong>
              </span>
              <span>
                باقیمانده تا تارگت: <strong className="text-stone-300 font-mono font-bold">{formatPrice(summary.financialTarget.remainingAmount)}</strong>
              </span>
            </div>
          </div>

          {/* Operational Appointment Metrics Table */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-200">
              جدول شاخص‌های بهره‌وری و نوبت‌دهی آتلیه
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-right">
                <span className="text-[11px] text-stone-500 block">نوبت‌های رزروشده</span>
                <span className="text-base font-mono font-bold text-stone-200">
                  {toPersianDigits(summary.totalAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-right">
                <span className="text-[11px] text-stone-500 block">نوبت‌های تکمیل‌شده</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {toPersianDigits(summary.completedAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-right">
                <span className="text-[11px] text-stone-500 block">لغوشده / کنسلی</span>
                <span className="text-base font-mono font-bold text-rose-400">
                  {toPersianDigits(summary.cancelledAppointments)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-right">
                <span className="text-[11px] text-stone-500 block">عدم حضور (No-Show)</span>
                <span className="text-base font-mono font-bold text-amber-400">
                  {toPersianDigits(summary.noShowAppointments)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SERVICE PERFORMANCE REPORT ────────────────────────── */}
      {activeReportTab === 'services' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-700/80">
                <tr>
                  <th className="py-3 px-4 font-bold">نام آیین پیرایش</th>
                  <th className="py-3 px-3 font-bold">دسته</th>
                  <th className="py-3 px-3 font-bold text-center">رزرو کل</th>
                  <th className="py-3 px-3 font-bold text-center">تکمیل‌شده</th>
                  <th className="py-3 px-4 font-bold text-left">درآمد (تومان)</th>
                  <th className="py-3 px-3 font-bold text-center">سهم از درآمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {summary.servicePerformance.map((service, idx) => (
                  <tr key={service.serviceId} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </span>
                      <span>{service.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-stone-400">
                      {service.category === 'haircut' ? 'پیرایش مو' : service.category === 'beard' ? 'طراحی ریش' : 'آیین جامع'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-stone-300">
                      {toPersianDigits(service.totalBookings)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">
                      {toPersianDigits(service.completedCount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#cbb5b4] text-left">
                      {formatPrice(service.revenue)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-stone-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#7e5352] h-1.5 rounded-full"
                            style={{ width: `${service.revenuePct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-stone-400">
                          {toPersianDigits(service.revenuePct)}٪
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CUSTOMER ACTIVITY REPORT ────────────────────────── */}
      {activeReportTab === 'customers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Customer Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-[11px] text-stone-500 block">مشتریان فعال دوره</span>
              <span className="text-xl font-mono font-bold text-stone-100">
                {toPersianDigits(summary.customerMetrics.activeCustomersCount)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-[11px] text-stone-500 block">مشتریان جدید آتلیه</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {toPersianDigits(summary.customerMetrics.newCustomersCount)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-[11px] text-stone-500 block">مشتریان وفادار / بازگشتی</span>
              <span className="text-xl font-mono font-bold text-[#cbb5b4]">
                {toPersianDigits(summary.customerMetrics.returningCustomersCount)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800">
              <span className="text-[11px] text-stone-500 block">میانگین ارزش مشتری (CLV)</span>
              <span className="text-xl font-mono font-bold text-stone-100">
                {formatPrice(summary.customerMetrics.avgCustomerValue)}
              </span>
            </div>
          </div>

          {/* Top VIP Clients Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900/60">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-700/80">
                <tr>
                  <th className="py-3 px-4 font-bold">نام مشتری</th>
                  <th className="py-3 px-3 font-bold text-center">کد عضویت</th>
                  <th className="py-3 px-3 font-bold text-center">نوبت‌های خدمات</th>
                  <th className="py-3 px-4 font-bold text-left">مجموع پرداخت (تومان)</th>
                  <th className="py-3 px-3 font-bold text-center">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {summary.customerMetrics.topCustomers.map((cust, idx) => {
                  const clientObj = customers.find(c => c.id === cust.customerId);
                  return (
                    <tr key={cust.customerId} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>{cust.customerName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-stone-400" dir="ltr">
                        {cust.memberId || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-stone-300">
                        {toPersianDigits(cust.visitsCount)} نوبت
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-100 text-left">
                        {formatPrice(cust.totalSpend)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {clientObj && (
                          <button
                            type="button"
                            onClick={() => setSelectedClientForDossier(clientObj)}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-[#7e5352] text-stone-300 hover:text-white text-[11px] transition-colors"
                          >
                            مشاهده پرونده
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down Modal */}
      <AnalyticsDetailModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ ...drillDownModal, isOpen: false })}
        inspectionType={drillDownModal.inspectionType}
        summary={summary}
        onOpenCustomerDossier={(customerId) => {
          setDrillDownModal({ ...drillDownModal, isOpen: false });
          const client = customers.find((c) => c.id === customerId);
          if (client) {
            setSelectedClientForDossier(client);
          }
        }}
      />
    </div>
  );
};
