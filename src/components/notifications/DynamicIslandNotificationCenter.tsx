import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Bell,
  BellRing,
  Calendar,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Trash2,
  X,
  Maximize2,
  Coffee,
  Car,
  PlusCircle,
} from 'lucide-react';
import { useAtelier } from '../../store/AtelierContext';
import { StudioNotification } from '../../types';
import { toPersianDigits } from '../../utils/dateUtils';
import { playNotificationChime } from '../../utils/soundUtils';

interface DynamicIslandNotificationCenterProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DynamicIslandNotificationCenter: React.FC<DynamicIslandNotificationCenterProps> = ({
  onNavigateToTab,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
    liveAlertNotification,
    dismissLiveAlertNotification,
    portalMode,
  } = useAtelier();

  // Mode state: 'compact' | 'alert' | 'expanded' | 'fullscreen'
  const [mode, setMode] = useState<'compact' | 'alert' | 'expanded' | 'fullscreen'>('compact');
  const [filter, setFilter] = useState<'all' | 'appointment' | 'order' | 'broadcast'>('all');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep live time updated every second in English digits
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const liveClockEn = `${hours}:${minutes}:${seconds}`;

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  // React to incoming live alert (Dynamic Island in-place morph banner)
  useEffect(() => {
    if (liveAlertNotification) {
      playNotificationChime();
      setMode('alert');
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        dismissLiveAlertNotification();
        setMode((prev) => (prev === 'alert' ? 'compact' : prev));
      }, 5000);
    }
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [liveAlertNotification, dismissLiveAlertNotification]);

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'appointment') return n.type.includes('appointment');
    if (filter === 'order') return n.type.includes('order');
    if (filter === 'broadcast') return !n.type.includes('appointment') && !n.type.includes('order');
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_new':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'order_update':
        return <ShoppingBag className="w-4 h-4 text-emerald-300" />;
      case 'concierge_message':
        return <Coffee className="w-4 h-4 text-emerald-400" />;
      case 'valet_ready':
        return <Car className="w-4 h-4 text-emerald-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_new':
        return 'نوبت آتلیه';
      case 'order_update':
        return 'سفارش بوتیک';
      case 'concierge_message':
        return 'کانسیرج رویال';
      default:
        return 'اطلاعیه استودیو';
    }
  };

  const handleNotificationAction = (notif: StudioNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.link && onNavigateToTab) {
      onNavigateToTab(notif.link);
      setMode('compact');
    }
  };

  const handleSwipeDismiss = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, notifId: string) => {
    // Dismiss if swiped left or right by more than 75px or fast flick
    if (Math.abs(info.offset.x) > 75 || Math.abs(info.velocity.x) > 400) {
      clearNotification(notifId);
    }
  };

  return (
    <div className="relative flex justify-center items-center z-50">
      {/* Click outside to collapse */}
      {mode === 'expanded' && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity"
          onClick={() => setMode('compact')}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          APPLE DYNAMIC ISLAND IN-PLACE SMOOTH EXPANDING CAPSULE
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        id="ios-dynamic-island-clock"
        style={{
          fontFamily: 'Arial, sans-serif',
          transformOrigin: 'top center',
          marginTop: '0px',
          marginBottom: '6px',
        }}
        animate={{
          width: mode === 'compact' ? 110 : mode === 'alert' ? 320 : 350,
          borderRadius: mode === 'compact' ? 9999 : mode === 'alert' ? 24 : 28,
        }}
        transition={{
          type: 'spring',
          stiffness: 340,
          damping: 28,
          mass: 0.8,
        }}
        title="ساعت زنده و مرکز اعلان‌ها (کلیک برای مشاهده)"
        className={`select-none overflow-hidden backdrop-blur-2xl ${
          mode === 'compact'
            ? 'h-[34px] bg-white/40 dark:bg-white/20 border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-white/80 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/50 px-2'
            : mode === 'alert'
            ? 'fixed top-3 left-1/2 -translate-x-1/2 z-50 h-[44px] max-w-[calc(100vw-32px)] bg-stone-950/95 border border-emerald-400/40 shadow-[0_8px_32px_rgba(16,185,129,0.25)] flex items-center justify-between px-3 cursor-pointer'
            : mode === 'expanded'
            ? 'fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-32px)] bg-stone-950/95 border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-4 flex flex-col'
            : 'h-0 w-0 opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          if (mode === 'compact' || mode === 'alert') {
            setMode('expanded');
          }
        }}
      >
        <AnimatePresence mode="wait">
          {/* ─── 1. COMPACT STATE CONTENT (Black Font for Time, Green for Notifications) ─── */}
          {mode === 'compact' && (
            <motion.div
              key="compact-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-center gap-1.5 w-full h-full px-1"
            >
              {/* Emerald Green Notification Indicator */}
              {unreadCount > 0 ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.7)] shrink-0" />
              )}

              {/* Black Font Live Digital Time */}
              <span
                className="font-bold tracking-tight text-stone-900 tabular-nums text-[13px]"
                dir="ltr"
              >
                {liveClockEn}
              </span>

              {/* Emerald Green Unread Notification Counter or Bell */}
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white font-black text-[9px] rounded-full leading-none shadow-xs">
                  {unreadCount}
                </span>
              ) : (
                <Bell className="w-3 h-3 text-stone-700 opacity-75" />
              )}
            </motion.div>
          )}

          {/* ─── 2. LIVE ALERT STATE CONTENT (Apple Dynamic Island Live Notification) ─── */}
          {mode === 'alert' && (
            <motion.div
              key="alert-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full h-full"
              dir="rtl"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
                  {liveAlertNotification ? (
                    getNotificationIcon(liveAlertNotification.type)
                  ) : (
                    <BellRing className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-right truncate flex flex-col">
                  <span className="text-[11px] font-bold text-white truncate">
                    {liveAlertNotification?.title || 'اعلان زنده آتلیه'}
                  </span>
                  <span className="text-[9px] text-emerald-200/90 truncate">
                    {liveAlertNotification?.message || 'برای باز کردن ضربه بزنید'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-1" dir="ltr">
                <span className="text-[11px] font-mono text-white font-bold tabular-nums">
                  {liveClockEn.slice(0, 5)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissLiveAlertNotification();
                    setMode('compact');
                  }}
                  className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── 3. EXPANDED ISLAND CONTENT (With Swipe-to-Dismiss) ─── */}
          {mode === 'expanded' && (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col w-full text-white space-y-3"
              dir="rtl"
            >
              {/* Expanded Header with Clock & Controls */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>
                        {portalMode === 'management' ? 'مرکز اعلان‌های مدیریت سالن' : 'مرکز اعلان‌ها'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-black">
                          {toPersianDigits(unreadCount)} جدید
                        </span>
                      )}
                    </h3>
                    <p className="text-[9px] text-stone-300">برای حذف اعلان، به چپ یا راست بکشید</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" dir="ltr">
                  <span
                    className="text-xs font-mono font-bold text-white tabular-nums px-2 py-0.5 bg-white/10 rounded-lg border border-white/20 shadow-xs"
                  >
                    {liveClockEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('fullscreen')}
                    title="تمام صفحه (Full Screen)"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('compact')}
                    title="جمع کردن"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Action Tools */}
              <div className="flex items-center justify-between py-1 border-b border-white/10 text-[11px]">
                <div className="flex items-center gap-1.5 text-stone-300 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>اعلان‌های زنده سیستم و رزروها</span>
                </div>

                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 text-[10px]"
                      >
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        <span>خوانده شد همه</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10"
                      title="پاک کردن همه"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Items List with Swipe Left/Right Gesture */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto overflow-x-hidden pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 text-xs">
                    <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-emerald-400" />
                    <p>هیچ اعلانی در حافظه نیست</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.slice(0, 4).map((notif) => {
                      const isUnread = !notif.read && !notif.isRead;
                      return (
                        <div key={notif.id} className="relative overflow-hidden rounded-2xl">
                          {/* Swipe Dismiss Background Red Accent */}
                          <div className="absolute inset-0 bg-rose-600/30 border border-rose-500/40 rounded-2xl flex items-center justify-between px-4 text-rose-300 pointer-events-none">
                            <div className="flex items-center gap-1 text-[10px] font-medium">
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-medium">
                              <span>حذف</span>
                              <Trash2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          {/* Swipeable Draggable Card */}
                          <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.6}
                            onDragEnd={(e, info) => handleSwipeDismiss(e, info, notif.id)}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{
                              opacity: 0,
                              x: 200,
                              height: 0,
                              marginBottom: 0,
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ cursor: 'grabbing' }}
                            onClick={() => handleNotificationAction(notif)}
                            className={`relative z-10 p-2.5 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing flex items-start gap-2.5 touch-pan-y ${
                              isUnread
                                ? 'bg-stone-900 border-emerald-400/40 shadow-sm'
                                : 'bg-stone-900/90 border-white/10 hover:bg-stone-800'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white truncate">
                                  {notif.title}
                                </span>
                                <span className="text-[9px] text-stone-400 shrink-0">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <p className="text-[10px] text-stone-200 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/10 text-stone-300">
                                  {getNotificationTypeLabel(notif.type)}
                                </span>
                                <span className="text-[9px] text-emerald-400">
                                  مشاهده و تایید →
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Apple Dynamic Island Pull Down Handle to Full Screen */}
              <motion.div
                onClick={() => setMode('fullscreen')}
                className="pt-1.5 flex flex-col items-center justify-center gap-1 cursor-pointer group/pulldown hover:bg-white/5 rounded-xl py-1 transition-colors"
                whileHover={{ y: 2 }}
                whileTap={{ y: 4 }}
              >
                <div className="w-10 h-1 bg-stone-500 group-hover/pulldown:bg-emerald-400 rounded-full transition-colors" />
                <div className="flex items-center gap-1 text-[9px] text-stone-400 group-hover/pulldown:text-emerald-300 font-medium">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                  <span>برای تمام‌صفحه به پایین بکشید</span>
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          4. FULL SCREEN NOTIFICATION CENTER HUB (When Pulled Down)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mode === 'fullscreen' && (
          <motion.div
            id="ios-notification-center-fullscreen"
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-2xl text-white flex flex-col justify-between p-5 overflow-hidden"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            dir="rtl"
          >
            {/* Top Navigation Bar */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">مرکز اعلان‌های رویال آتلیه</h2>
                    <p className="text-[10px] text-stone-400">Royal Barber Notification Center</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('expanded')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
                    title="بازگشت به Dynamic Island"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('compact')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
                    title="بستن"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Large Digital Clock */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-3xl p-4 text-center shadow-lg">
                <div
                  className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-sm"
                  dir="ltr"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  {liveClockEn}
                </div>
                <div className="text-xs text-emerald-300/90 font-medium mt-1">
                  امروز · ساعت رسمی هماهنگ آتلیه
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'همه اعلان‌ها', count: notifications.length },
                  {
                    id: 'appointment',
                    label: 'نوبت‌ها',
                    count: notifications.filter((n) => n.type.includes('appointment')).length,
                  },
                  {
                    id: 'order',
                    label: 'سفارشات بوتیک',
                    count: notifications.filter((n) => n.type.includes('order')).length,
                  },
                  {
                    id: 'broadcast',
                    label: 'اطلاعیه‌ها',
                    count: notifications.filter(
                      (n) => !n.type.includes('appointment') && !n.type.includes('order')
                    ).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      filter === tab.id
                        ? 'bg-emerald-500 text-stone-950 shadow-md font-bold'
                        : 'bg-white/10 text-stone-300 border border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-80">({toPersianDigits(tab.count)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Stream with Swipe-to-Dismiss */}
            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden my-3 space-y-2.5 pr-1">
              {filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-12">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-emerald-400">
                    <Bell className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">هیچ اعلانی در این دسته وجود ندارد</h4>
                  <p className="text-xs text-stone-400">تمام پیام‌ها و هشدارهای جدید در اینجا نمایش داده می‌شوند.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((notif) => {
                    const isUnread = !notif.read && !notif.isRead;
                    return (
                      <div key={notif.id} className="relative overflow-hidden rounded-2xl">
                        {/* Swipe indicator background */}
                        <div className="absolute inset-0 bg-rose-600/30 border border-rose-500/40 rounded-2xl flex items-center justify-between px-5 text-rose-300 pointer-events-none">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <span>حذف</span>
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </div>

                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.6}
                          onDragEnd={(e, info) => handleSwipeDismiss(e, info, notif.id)}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: 240,
                            height: 0,
                            marginBottom: 0,
                            transition: { duration: 0.2 },
                          }}
                          className={`relative z-10 p-3.5 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing ${
                            isUnread
                              ? 'bg-stone-900 border-emerald-400/40 shadow-md'
                              : 'bg-stone-900/90 border-white/10 hover:bg-stone-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 pointer-events-none">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  )}
                                </div>
                                <span className="text-[10px] text-stone-400">{notif.timestamp}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 pointer-events-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isUnread) markNotificationAsRead(notif.id);
                                }}
                                className={`p-1.5 rounded-lg ${
                                  isUnread ? 'text-emerald-400 hover:bg-white/10' : 'text-stone-400'
                                }`}
                                title={isUnread ? 'علامت به عنوان خوانده شده' : 'خوانده شده'}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notif.id);
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10"
                                title="حذف این اعلان"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-stone-200 mt-2 leading-relaxed pointer-events-none">
                            {notif.message}
                          </p>

                          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between pointer-events-none">
                            <span className="text-[9px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-md">
                              {getNotificationTypeLabel(notif.type)}
                            </span>
                            {notif.link && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notif);
                                }}
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pointer-events-auto"
                              >
                                <span>مشاهده در بخش مربوطه</span>
                                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Swipe Up Handle */}
            <div className="relative z-10 pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>علامت همه به عنوان خوانده شده ({toPersianDigits(unreadCount)})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('compact')}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all active:scale-98"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>بستن مرکز اعلان</span>
                  </button>
                )}
              </div>

              <div
                onClick={() => setMode('compact')}
                className="pt-1 flex flex-col items-center justify-center gap-1 cursor-pointer group/pullup text-center hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-1 text-[10px] text-stone-400 group-hover/pullup:text-emerald-300">
                  <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
                  <span>برای بستن به بالا بکشید (Swipe up to close)</span>
                  <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="w-14 h-1 bg-stone-600 group-hover/pullup:bg-emerald-400 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
