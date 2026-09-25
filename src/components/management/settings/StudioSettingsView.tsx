import React, { useState, useEffect, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { 
  StudioSettings, 
  StudioOpeningHour, 
  StudioProfileSettings, 
  AppointmentPoliciesSettings, 
  NotificationPreferencesSettings, 
  AnalyticsPeriod,
  BeverageOption,
  AnnouncementSettings,
  Barber
} from '../../../types';
import { 
  Sliders, 
  Building, 
  Clock, 
  ShieldAlert, 
  Target, 
  Bell, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  AlertTriangle,
  X,
  Coffee,
  GlassWater,
  Leaf,
  UtensilsCrossed,
  Edit2,
  Megaphone,
  UserCheck,
  CalendarCheck,
  Calendar,
  Copy,
  Sun,
  Moon,
  Zap,
  CheckSquare,
  Square,
  Scissors
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/dateUtils';

export const StudioSettingsView: React.FC = () => {
  const { 
    settings, 
    barbers,
    activeBarber,
    setActiveBarber,
    updateBarber,
    updateBarberAvailability,
    updateStudioSettings, 
    updateStudioProfile, 
    updateAnnouncement,
    updateOperatingHours, 
    updatePolicies, 
    updateFinancialTarget, 
    updateNotificationPreferences, 
    resetSettingsToDefault,
    beverageOptions,
    addBeverageOption,
    updateBeverageOption,
    deleteBeverageOption
  } = useAtelier();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'announcement' | 'hours' | 'policies' | 'targets' | 'notifications' | 'hospitality'
  >('hours');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Beverage Modal / Inline Form State
  const [newBevName, setNewBevName] = useState('');
  const [newBevDesc, setNewBevDesc] = useState('');
  const [newBevPrice, setNewBevPrice] = useState<number>(35000);
  const [newBevCategory, setNewBevCategory] = useState<'hot' | 'cold' | 'herbal' | 'snack'>('hot');
  const [newBevIcon, setNewBevIcon] = useState<'coffee' | 'tea' | 'juice' | 'water' | 'sparkle' | 'croissant'>('coffee');

  // Edit in-place state
  const [editingBevId, setEditingBevId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [editNameVal, setEditNameVal] = useState<string>('');
  const [editDescVal, setEditDescVal] = useState<string>('');

  // Barber Availability & Working Hours State
  const [selectedBarberId, setSelectedBarberId] = useState<string>(activeBarber?.id || barbers[0]?.id || 'barber-1');
  const currentBarber = useMemo(() => {
    return barbers.find((b) => b.id === selectedBarberId) || activeBarber || barbers[0];
  }, [barbers, selectedBarberId, activeBarber]);

  const [barberAvailableToday, setBarberAvailableToday] = useState<boolean>(
    currentBarber?.isAvailableToday ?? true
  );

  const ALL_WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  const [barberWorkingDays, setBarberWorkingDays] = useState<string[]>(() => {
    if (currentBarber?.workingDays && currentBarber.workingDays.length > 0) {
      return currentBarber.workingDays;
    }
    return ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
  });

  // Local copy of form state for smooth editing
  const [profileForm, setProfileForm] = useState<StudioProfileSettings>(settings.profile);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementSettings>(
    settings.announcement || { headline: '', body: '', tag: 'طرح ویژه', isActive: false }
  );
  const [hoursForm, setHoursForm] = useState<StudioOpeningHour[]>(
    currentBarber?.workingHours && currentBarber.workingHours.length > 0
      ? currentBarber.workingHours
      : settings.operatingHours
  );
  const [policiesForm, setPoliciesForm] = useState<AppointmentPoliciesSettings>(settings.policies);
  const [targetsForm, setTargetsForm] = useState<Record<AnalyticsPeriod, number>>(settings.financialTargets);
  const [notifsForm, setNotifsForm] = useState<NotificationPreferencesSettings>(settings.notificationPreferences);

  // When selected barber changes, reload schedule state
  useEffect(() => {
    if (currentBarber) {
      setBarberAvailableToday(currentBarber.isAvailableToday ?? true);
      if (currentBarber.workingDays && currentBarber.workingDays.length > 0) {
        setBarberWorkingDays(currentBarber.workingDays);
      } else {
        setBarberWorkingDays(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه']);
      }

      if (currentBarber.workingHours && currentBarber.workingHours.length > 0) {
        setHoursForm(currentBarber.workingHours);
      } else {
        setHoursForm(settings.operatingHours);
      }
    }
  }, [currentBarber, selectedBarberId]);

  useEffect(() => {
    setProfileForm(settings.profile);
    setAnnouncementForm(settings.announcement || { headline: '', body: '', tag: 'طرح ویژه', isActive: false });
    setPoliciesForm(settings.policies);
    setTargetsForm(settings.financialTargets);
    setNotifsForm(settings.notificationPreferences);
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Save Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudioProfile(profileForm);
    showToast('اطلاعات پروفایل و مشخصات آتلیه با موفقیت ذخیره شد.');
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnnouncement(announcementForm);
    showToast('اطلاعیه و پیام بنر سالن با موفقیت ذخیره شد.');
  };

  const toggleWorkingDay = (dayName: string) => {
    setBarberWorkingDays((prev) => {
      const isCurrentlyActive = prev.includes(dayName);
      let updatedDays: string[];
      if (isCurrentlyActive) {
        updatedDays = prev.filter((d) => d !== dayName);
      } else {
        updatedDays = [...prev, dayName];
      }

      // Also sync isClosed in hoursForm
      setHoursForm((prevHours) =>
        prevHours.map((h) => {
          if (h.dayOfWeek === dayName) {
            return {
              ...h,
              isClosed: isCurrentlyActive, // if was active, now closed
            };
          }
          return h;
        })
      );

      return updatedDays;
    });
  };

  const applyPresetDays = (presetType: 'all' | 'workweek' | 'standard' | 'odd' | 'even' | 'weekend') => {
    let targetDays: string[] = [];
    if (presetType === 'all') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    } else if (presetType === 'workweek') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'];
    } else if (presetType === 'standard') {
      targetDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
    } else if (presetType === 'odd') {
      targetDays = ['شنبه', 'دوشنبه', 'چهارشنبه', 'جمعه'];
    } else if (presetType === 'even') {
      targetDays = ['یکشنبه', 'سه‌شنبه', 'پنج‌شنبه'];
    } else if (presetType === 'weekend') {
      targetDays = ['پنج‌شنبه', 'جمعه'];
    }

    setBarberWorkingDays(targetDays);
    setHoursForm((prevHours) =>
      prevHours.map((h) => ({
        ...h,
        isClosed: !targetDays.includes(h.dayOfWeek),
      }))
    );
    showToast(`الگوی روزهای انتخابی بر روی برنامه «${currentBarber.name}» اعمال شد.`);
  };

  const applyHoursToAllActiveDays = (sourceDayIndex: number) => {
    const source = hoursForm[sourceDayIndex];
    if (!source) return;
    const updated = hoursForm.map((h) => {
      if (barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed) {
        return {
          ...h,
          openTime: source.openTime,
          closeTime: source.closeTime,
          breakStart: source.breakStart,
          breakEnd: source.breakEnd,
        };
      }
      return h;
    });
    setHoursForm(updated);
    showToast(`ساعات کاری (${toPersianDigits(source.openTime)} تا ${toPersianDigits(source.closeTime)}) به همه روزهای کاری فعال اعمال شد.`);
  };

  const scheduleMetrics = useMemo(() => {
    let totalMinutes = 0;
    let activeDaysCount = 0;

    hoursForm.forEach((h) => {
      const isDayActive = barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed;
      if (isDayActive) {
        activeDaysCount += 1;
        const [openH, openM] = (h.openTime || '10:00').split(':').map(Number);
        const [closeH, closeM] = (h.closeTime || '20:30').split(':').map(Number);
        let dayMinutes = (closeH * 60 + closeM) - (openH * 60 + openM);

        if (h.breakStart && h.breakEnd) {
          const [bStartH, bStartM] = h.breakStart.split(':').map(Number);
          const [bEndH, bEndM] = h.breakEnd.split(':').map(Number);
          const breakMinutes = (bEndH * 60 + bEndM) - (bStartH * 60 + bStartM);
          if (breakMinutes > 0) {
            dayMinutes = Math.max(0, dayMinutes - breakMinutes);
          }
        }

        if (dayMinutes > 0) {
          totalMinutes += dayMinutes;
        }
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    return {
      activeDaysCount,
      totalHours,
      totalMinutes,
    };
  }, [hoursForm, barberWorkingDays]);

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateBarberAvailability(selectedBarberId, barberWorkingDays, hoursForm, barberAvailableToday);
    showToast(`برنامه روزها و ساعات کاری «${currentBarber.name}» با موفقیت ذخیره و در نوبت‌دهی اعمال شد.`);
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updatePolicies(policiesForm);
    showToast('خط‌مشی‌ها و قوانین رزرو نوبت بروزرسانی شد.');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(targetsForm).forEach(([period, amount]) => {
      updateFinancialTarget(period as AnalyticsPeriod, Number(amount));
    });
    showToast('اهداف و بودجه مالی دوره‌ای ذخیره گردید.');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPreferences(notifsForm);
    showToast('ترجیحات ارسال اعلانات بروزرسانی شد.');
  };

  const handleConfirmReset = () => {
    resetSettingsToDefault();
    setShowResetConfirmModal(false);
    showToast('تمام تنظیمات به پیش‌فرض اولیه بازگردانده شد.');
  };

  return (
    <div id="studio-settings-view" className="space-y-6 animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#cbb5b4]" />
            <span>تنظیمات و پیکربندی مرکزی آتلیه</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            مدیریت هویت سازمانی، ساعات پذیرش، قوانین نوبت‌دهی، تارگت‌های مالی و اعلانات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirmModal(true)}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازنشانی به پیش‌فرض</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'profile', label: 'پروفایل آتلیه', icon: Building },
          { id: 'announcement', label: 'اطلاعیه و بنر صفحه اصلی', icon: Megaphone },
          { id: 'hours', label: 'ساعات و روزهای کاری آرایشگر', icon: Clock },
          { id: 'policies', label: 'قوانین و ودیعه نوبت', icon: ShieldAlert },
          { id: 'targets', label: 'اهداف و تارگت‌های مالی', icon: Target },
          { id: 'notifications', label: 'تنظیمات اعلانات', icon: Bell },
          { id: 'hospitality', label: 'منوی پذیرایی و تشریفات', icon: UtensilsCrossed },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
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

      {/* ─── TAB 1: STUDIO PROFILE ───────────────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-200">
              مشخصات عمومی و هویت سازمانی
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  عنوان کامل آتلیه
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  شعار و بیانیه آتلیه
                </label>
                <input
                  type="text"
                  value={profileForm.tagline}
                  onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  نام آرایشگر / استاد پیرایش
                </label>
                <input
                  type="text"
                  value={profileForm.masterName}
                  onChange={(e) => setProfileForm({ ...profileForm, masterName: e.target.value })}
                  placeholder="مثال: علی رضایی"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                />
                <p className="text-[10px] text-stone-500">
                  این نام در تمامی صفحات وبسایت، هدر، فاکتورها، کارت‌های رزرو و پیام‌ها نمایش داده می‌شود.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  عنوان شغلی و تخصص آرایشگر
                </label>
                <input
                  type="text"
                  value={profileForm.masterTitle}
                  onChange={(e) => setProfileForm({ ...profileForm, masterTitle: e.target.value })}
                  placeholder="مثال: سرآرایشگر و مدیر آتلیه"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  شماره تماس مستقیم آتلیه
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  شماره خط کانسیرج اختصاصی
                </label>
                <input
                  type="text"
                  value={profileForm.conciergePhone}
                  onChange={(e) => setProfileForm({ ...profileForm, conciergePhone: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-stone-300">
                  آدرس و نشانی دقیق سالن
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات پروفایل</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB: ANNOUNCEMENT & BANNER ─────────────────────────────── */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveAnnouncement} className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#cbb5b4]" />
                  <span>اطلاعیه و بنر صفحه اصلی مشتریان</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  هنگامی که متن اطلاعیه را تکمیل و فعال نمایید، به صورت خودکار در صفحه اصلی به مشتریان نمایش داده می‌شود. اگر متنی وارد نشود یا غیرفعال گردد، کادر اطلاعیه در صفحه اصلی پنهان خواهد شد.
                </p>
              </div>

              {/* Active Toggle Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  checked={announcementForm.isActive}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#7e5352] focus:ring-0 focus:ring-offset-0 bg-stone-900 border-stone-700 cursor-pointer"
                />
                <span className={`text-xs font-bold ${announcementForm.isActive ? 'text-emerald-400' : 'text-stone-400'}`}>
                  {announcementForm.isActive ? 'فعال (نمایش در خانه)' : 'غیرفعال (مخفی)'}
                </span>
              </label>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">
                    تیتر یا عنوان اطلاعیه
                  </label>
                  <input
                    type="text"
                    value={announcementForm.headline}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, headline: e.target.value })}
                    placeholder="مثال: اطلاعیه سالن رویال / تخفیف ویژه ساعات صبحگاهی"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-300">
                    برچسب / بج (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.tag || ''}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, tag: e.target.value })}
                    placeholder="مثال: طرح ویژه / مهم / هدیه"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  متن کامل اطلاعیه
                </label>
                <textarea
                  rows={3}
                  value={announcementForm.body}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                  placeholder="متن پیام مدیریت به مشتریان را اینجا بنویسید (مانند تخفیف‌ها، ساعات ویژه یا اطلاع‌رسانی تعطیلی)..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 leading-relaxed focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              {/* Preview Card */}
              <div className="mt-4 p-3 rounded-2xl bg-stone-950/80 border border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 block mb-2">
                  پیش‌نمایش اطلاعیه در صفحه اصلی:
                </span>
                {announcementForm.isActive && (announcementForm.headline.trim() || announcementForm.body.trim()) ? (
                  <div className="bg-white/90 border border-white/90 rounded-[20px] p-3 text-stone-900 shadow-sm flex items-start gap-2.5 max-w-sm">
                    <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#7e5352] shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-900">
                          {announcementForm.headline || 'اطلاعیه سالن رویال'}
                        </span>
                        {announcementForm.tag && (
                          <span className="text-[9px] font-semibold text-[#7e5352] bg-[#7e5352]/10 border border-[#7e5352]/20 px-1.5 py-0.5 rounded-md">
                            {announcementForm.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-700 mt-0.5 leading-relaxed">
                        {announcementForm.body || 'متن اطلاعیه...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    در حال حاضر متنی تنظیم نشده یا وضعیت غیرفعال است (چیزی در صفحه اصلی نمایش داده نخواهد شد).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setAnnouncementForm({ headline: '', body: '', tag: '', isActive: false });
                updateAnnouncement({ headline: '', body: '', tag: '', isActive: false });
                showToast('اطلاعیه پاک و از صفحه اصلی حذف شد.');
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف و پاکسازی اطلاعیه</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره و انتشار اطلاعیه</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 2: BARBER WORKING DAYS & HOURS AVAILABILITY ────────── */}
      {activeTab === 'hours' && (
        <form onSubmit={handleSaveHours} className="space-y-6 animate-fade-in">
          {/* Barber Selection & Profile Header Card */}
          <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentBarber.avatarUrl}
                    alt={currentBarber.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-stone-700 shadow-md"
                  />
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-stone-900 flex items-center justify-center ${
                    barberAvailableToday ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {barberAvailableToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-100">{currentBarber.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#7e5352]/20 border border-[#7e5352]/40 text-[#cbb5b4] text-[10px] font-bold">
                      {currentBarber.title}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    تنظیم روزهای پذیرش نوبت، ساعات شیفت کاری و زمان استراحت در هفته
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">روزهای کاری فعال</div>
                    <div className="text-xs font-bold text-stone-200">
                      {toPersianDigits(scheduleMetrics.activeDaysCount)} روز در هفته
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {scheduleMetrics.activeDaysCount === 7 ? 'تمام هفته' : 'شیفت منظم'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">مجموع ساعات در دسترس</div>
                    <div className="text-xs font-bold text-stone-200">
                      {toPersianDigits(scheduleMetrics.totalHours)} ساعت هفتگی
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  ~{toPersianDigits(Math.round(scheduleMetrics.totalHours / (scheduleMetrics.activeDaysCount || 1)))} س/روز
                </span>
              </div>

              {/* Real-time Attendance Instant Switch */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    barberAvailableToday 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">حضور امروز در استودیو</div>
                    <div className={`text-xs font-bold ${barberAvailableToday ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {barberAvailableToday ? 'حاضر و نوبت‌دهی فعال' : 'مرخصی / عدم حضور'}
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={barberAvailableToday}
                    onChange={(e) => setBarberAvailableToday(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 1: Days of Week Selection & Quick Presets */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
              <div>
                <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#cbb5b4]" />
                  <span>تعیین روزهای در دسترس برای کار (Working Days)</span>
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  روزهایی که مایل به پذیرش نوبت‌های مشتریان هستید را انتخاب نمایید.
                </p>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-stone-400 font-medium">الگوهای سریع:</span>
                <button
                  type="button"
                  onClick={() => applyPresetDays('workweek')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  شنبه تا پنج‌شنبه
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('standard')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  شنبه تا چهارشنبه
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('all')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  همه ۷ روز
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('odd')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  روزهای فرد
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('even')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  روزهای زوج
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays('weekend')}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-[10px] font-bold text-stone-300 hover:text-white transition-colors"
                >
                  فقط آخر هفته
                </button>
              </div>
            </div>

            {/* 7 Days Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {ALL_WEEK_DAYS.map((dayName) => {
                const isActive = barberWorkingDays.includes(dayName);
                const hourObj = hoursForm.find((h) => h.dayOfWeek === dayName);
                const isClosed = hourObj?.isClosed || !isActive;

                return (
                  <button
                    key={dayName}
                    type="button"
                    onClick={() => toggleWorkingDay(dayName)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-2.5 relative group ${
                      !isClosed && isActive
                        ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                        : 'bg-stone-950/50 border-stone-800/80 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${!isClosed && isActive ? 'text-stone-100' : 'text-stone-400'}`}>
                        {dayName}
                      </span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        !isClosed && isActive ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                      }`}>
                        {!isClosed && isActive ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                      </div>
                    </div>

                    <div className="w-full text-right">
                      {!isClosed && isActive ? (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-400 block">روز کاری فعال</span>
                          <span className="text-[10px] text-stone-300 font-mono block">
                            {hourObj?.openTime ? `${toPersianDigits(hourObj.openTime)} - ${toPersianDigits(hourObj.closeTime)}` : '۱۰:۰۰ - ۲۰:۳۰'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-medium text-rose-400/80 block">تعطیل / بدون پذیرش</span>
                          <span className="text-[10px] text-stone-500 block">استراحت</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Daily Hours & Shift Breakdown */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div>
                <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#cbb5b4]" />
                  <span>ساعات کاری روزانه و شیفت‌ها (Daily Working Hours)</span>
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  ساعت شروع، ساعت پایان و زمان استراحت میان‌روز را برای هر روز هفته به دقت پیکربندی فرمایید.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {hoursForm.map((h, idx) => {
                const isDayActive = barberWorkingDays.includes(h.dayOfWeek) && !h.isClosed;

                return (
                  <div
                    key={h.dayOfWeek}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDayActive
                        ? 'bg-stone-950/80 border-stone-800/90 shadow-sm'
                        : 'bg-stone-950/30 border-stone-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                      {/* Day Name & Status */}
                      <div className="flex items-center gap-3 w-36 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${isDayActive ? 'bg-emerald-500' : 'bg-stone-600'}`} />
                        <div>
                          <div className="text-xs font-bold text-stone-200">{h.dayOfWeek}</div>
                          <span className={`text-[10px] ${isDayActive ? 'text-emerald-400' : 'text-stone-500'}`}>
                            {isDayActive ? 'فعال در نوبت‌دهی' : 'تعطیل'}
                          </span>
                        </div>
                      </div>

                      {/* Working Hours (Open to Close) */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-800">
                          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-[11px] text-stone-400 whitespace-nowrap">از ساعت:</span>
                          <input
                            type="time"
                            value={h.openTime || '10:00'}
                            disabled={!isDayActive}
                            onChange={(e) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, openTime: e.target.value };
                              setHoursForm(updated);
                            }}
                            className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-0.5 text-xs text-stone-100 font-mono text-center disabled:opacity-30 focus:outline-none focus:border-[#7e5352]"
                          />
                        </div>

                        <div className="flex items-center gap-2 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-800">
                          <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-[11px] text-stone-400 whitespace-nowrap">تا ساعت:</span>
                          <input
                            type="time"
                            value={h.closeTime || '20:30'}
                            disabled={!isDayActive}
                            onChange={(e) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, closeTime: e.target.value };
                              setHoursForm(updated);
                            }}
                            className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-0.5 text-xs text-stone-100 font-mono text-center disabled:opacity-30 focus:outline-none focus:border-[#7e5352]"
                          />
                        </div>

                        {/* Mid-day Break / Pause */}
                        <div className="flex items-center gap-2 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-stone-800">
                          <Coffee className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="text-[11px] text-stone-400 whitespace-nowrap">استراحت میان‌روز:</span>
                          <input
                            type="time"
                            value={h.breakStart || ''}
                            disabled={!isDayActive}
                            placeholder="شروع"
                            onChange={(e) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, breakStart: e.target.value };
                              setHoursForm(updated);
                            }}
                            className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-0.5 text-xs text-stone-100 font-mono text-center disabled:opacity-30 focus:outline-none focus:border-[#7e5352]"
                          />
                          <span className="text-stone-500 text-xs">تا</span>
                          <input
                            type="time"
                            value={h.breakEnd || ''}
                            disabled={!isDayActive}
                            placeholder="پایان"
                            onChange={(e) => {
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, breakEnd: e.target.value };
                              setHoursForm(updated);
                            }}
                            className="bg-stone-950 border border-stone-800 rounded-lg px-2 py-0.5 text-xs text-stone-100 font-mono text-center disabled:opacity-30 focus:outline-none focus:border-[#7e5352]"
                          />
                        </div>
                      </div>

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-2 justify-end">
                        {isDayActive && (
                          <button
                            type="button"
                            onClick={() => applyHoursToAllActiveDays(idx)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[10px] font-bold text-stone-300 hover:text-white transition-colors flex items-center gap-1"
                            title="اعمال همین ساعت‌ها به همه روزهای کاری دیگر"
                          >
                            <Copy className="w-3 h-3 text-[#cbb5b4]" />
                            <span>کپی به همه روزها</span>
                          </button>
                        )}

                        <label className="text-xs text-stone-400 flex items-center gap-1.5 cursor-pointer bg-stone-900/60 px-2.5 py-1.5 rounded-lg border border-stone-800/80">
                          <input
                            type="checkbox"
                            checked={h.isClosed}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const updated = [...hoursForm];
                              updated[idx] = { ...h, isClosed: isChecked };
                              setHoursForm(updated);

                              if (isChecked) {
                                setBarberWorkingDays((prev) => prev.filter((d) => d !== h.dayOfWeek));
                              } else {
                                setBarberWorkingDays((prev) =>
                                  prev.includes(h.dayOfWeek) ? prev : [...prev, h.dayOfWeek]
                                );
                              }
                            }}
                            className="rounded border-stone-700 text-[#7e5352] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] whitespace-nowrap">تعطیل</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                تغییرات ساعات و روزهای کاری به صورت زنده در تقویم رزرو مشتریان و الگوریتم‌های پر کردن فواصل زمانی اعمال می‌گردد.
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  applyPresetDays('workweek');
                  setHoursForm([
                    { dayOfWeek: 'شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'یکشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'دوشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'سه‌شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'چهارشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
                    { dayOfWeek: 'پنج‌شنبه', openTime: '10:00', closeTime: '22:00', isClosed: false },
                    { dayOfWeek: 'جمعه', openTime: '12:00', closeTime: '18:00', isClosed: true },
                  ]);
                  setBarberAvailableToday(true);
                  showToast('ساعات کاری به مقادیر استاندارد آتلیه بازگردانده شد.');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs font-bold transition-colors"
              >
                بازنشانی ساعات
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره برنامه روزها و ساعات کاری</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 3: APPOINTMENT POLICIES ─────────────────────────────── */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSavePolicies} className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-200">
              خط‌مشی‌ها، لغو و مبلغ ودیعه رزرو
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  مهلت لغو بدون کسر هزینه (ساعت)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={policiesForm.cancellationWindowHours}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, cancellationWindowHours: parseInt(e.target.value) || 24 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
                <span className="text-[11px] text-stone-500 block">
                  لغو تا {toPersianDigits(policiesForm.cancellationWindowHours)} ساعت قبل از نوبت رایگان است.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  حداقل فاصله زمانی رزرو آنلاین (ساعت)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={policiesForm.bookingCutoffHours}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, bookingCutoffHours: parseInt(e.target.value) || 2 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
                <span className="text-[11px] text-stone-500 block">
                  مشتریان باید حداقل {toPersianDigits(policiesForm.bookingCutoffHours)} ساعت قبل نوبت بگیرند.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  حداکثر افق زمانی رزرو آینده (روز)
                </label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={policiesForm.maxBookingHorizonDays}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, maxBookingHorizonDays: parseInt(e.target.value) || 30 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  مبلغ ودیعه استاندارد ثبت نوبت (تومان)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={policiesForm.depositAmount}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, depositAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-stone-300">
                  متن رسمی اخطار و خط‌مشی رزرو به مشتریان
                </label>
                <textarea
                  rows={2}
                  value={policiesForm.policyNotice}
                  onChange={(e) => setPoliciesForm({ ...policiesForm, policyNotice: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#7e5352]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره خط‌مشی‌ها</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 4: FINANCIAL TARGETS ────────────────────────────────── */}
      {activeTab === 'targets' && (
        <form onSubmit={handleSaveTargets} className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-200">
              تارگت‌ها و بودجه‌بندی درآمدی ادواری آتلیه
            </h3>
            <p className="text-xs text-stone-400">
              این مقادیر مستقیماً در محاسبات نوار پیشرفت و شاخص‌های هوش تجاری گزارش‌ها منعکس می‌گردند.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  تارگت روزانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.today}
                  onChange={(e) => setTargetsForm({ ...targetsForm, today: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  تارگت هفتگی (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.week}
                  onChange={(e) => setTargetsForm({ ...targetsForm, week: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  تارگت ماهانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.month}
                  onChange={(e) => setTargetsForm({ ...targetsForm, month: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-300">
                  تارگت سالانه (تومان)
                </label>
                <input
                  type="number"
                  value={targetsForm.year}
                  onChange={(e) => setTargetsForm({ ...targetsForm, year: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره اهداف مالی</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 5: NOTIFICATIONS ────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <h3 className="text-sm font-bold text-stone-200">
              ترجیحات ارسال رویدادها و اعلانات زنده آتلیه
            </h3>

            <div className="space-y-3">
              {[
                { key: 'newOnlineBooking', label: 'اعلان رزرو نوبت جدید آنلاین', desc: 'ارسال هشدار فوری هنگام رزرو آنلاین توسط مشتری' },
                { key: 'appointmentCancellation', label: 'اعلان لغو نوبت توسط مشتری', desc: 'ارسال هشدار آزادسازی صندلی و نوبت' },
                { key: 'appointmentReschedule', label: 'اعلان تغییر زمان و جابجایی نوبت', desc: 'بروزرسانی تغییر تقویم کاری' },
                { key: 'paymentConfirmation', label: 'اعلان تایید پرداخت و تسویه', desc: 'ثبت واریز مبلغ فاکتورها' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800"
                >
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">{item.label}</span>
                    <span className="text-[11px] text-stone-500 block">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(notifsForm as any)[item.key]}
                    onChange={(e) => setNotifsForm({ ...notifsForm, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-700 text-[#7e5352] focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره ترجیحات اعلانات</span>
            </button>
          </div>
        </form>
      )}

      {/* 7. Hospitality / Beverage Settings Tab */}
      {activeTab === 'hospitality' && (
        <div className="space-y-6">
          {/* Header & Quick Stats */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#cbb5b4]" />
                <span>مدیریت منوی پذیرایی و تشریفات سالن (پذیرایی)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                تعریف اقلام پذیرایی، نوشیدنی‌های گرم، آب‌میوه‌های تازه، دمنوش‌ها و قیمت‌گذاری منو
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-300 text-xs flex items-center gap-2">
                <span className="text-stone-400">تعداد اقلام:</span>
                <span className="font-bold text-[#cbb5b4]">{toPersianDigits(beverageOptions.length)} آیتم</span>
              </div>
            </div>
          </div>

          {/* Add New Hospitality Item Card */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#cbb5b4]" />
                <span>افزودن آیتم جدید به منوی پذیرایی</span>
              </h4>
              <span className="text-[11px] text-stone-400">قیمت‌گذاری به تومان</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBevName.trim()) {
                  showToast('لطفاً عنوان آیتم پذیرایی را وارد نمایید.');
                  return;
                }
                const result = addBeverageOption({
                  name: newBevName.trim(),
                  description: newBevDesc.trim() || 'تهیه تازه و سرو اختصاصی',
                  price: Number(newBevPrice) || 0,
                  category: newBevCategory,
                  icon: newBevIcon,
                  isAvailable: true,
                });
                if (result.success) {
                  showToast(`آیتم «${newBevName}» با موفقیت به منو اضافه شد.`);
                  setNewBevName('');
                  setNewBevDesc('');
                  setNewBevPrice(35000);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 block">
                    نام آیتم پذیرایی <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBevName}
                    onChange={(e) => setNewBevName(e.target.value)}
                    placeholder="مثال: لاته ماکیاتو کارامل، چای ماسالا..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs focus:outline-none focus:border-[#7e5352]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 block">
                    دسته‌بندی
                  </label>
                  <select
                    value={newBevCategory}
                    onChange={(e) => setNewBevCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-[#7e5352]"
                  >
                    <option value="hot">نوشیدنی گرم (اسپرسو، کافه، چای)</option>
                    <option value="cold">نوشیدنی سرد و آب‌میوه تازه</option>
                    <option value="herbal">دمنوش‌های گیاهی و آرام‌بخش</option>
                    <option value="snack">میان‌وعده، شیرینی و کرواسان</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 block">
                    قیمت (تومان) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      step={5000}
                      value={newBevPrice}
                      onChange={(e) => setNewBevPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-[#7e5352] font-mono"
                    />
                    <span className="absolute left-3 top-2 text-[10px] text-stone-500 pointer-events-none">
                      تومان
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 block">
                    توضیحات کوتاه و طعم‌شناسی
                  </label>
                  <input
                    type="text"
                    value={newBevDesc}
                    onChange={(e) => setNewBevDesc(e.target.value)}
                    placeholder="مثال: عصاره‌گیری تازه با دانه‌های ۱۰۰٪ عربیکا کلمبیا"
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder:text-stone-600 text-xs focus:outline-none focus:border-[#7e5352]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300 block">
                    نوع آیکون نمایشی
                  </label>
                  <select
                    value={newBevIcon}
                    onChange={(e) => setNewBevIcon(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-[#7e5352]"
                  >
                    <option value="coffee">قهوه / اسپرسو</option>
                    <option value="tea">چای / دمنوش</option>
                    <option value="juice">آب‌میوه طبیعی</option>
                    <option value="water">آب معدنی / گازدار</option>
                    <option value="croissant">کرواسان / شیرینی</option>
                    <option value="sparkle">میکس تشریفاتی اختصاصی</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت و افزودن به منوی پذیرایی</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Existing Hospitality Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-300">
              اقلام موجود در منوی پذیرایی سالن ({toPersianDigits(beverageOptions.length)})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beverageOptions.map((bev) => {
                const isEditing = editingBevId === bev.id;

                return (
                  <div
                    key={bev.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      bev.isAvailable !== false
                        ? 'bg-stone-900/80 border-stone-800'
                        : 'bg-stone-950/60 border-stone-900 opacity-60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                          <span className="text-xs font-bold text-stone-200">ویرایش آیتم</span>
                          <button
                            type="button"
                            onClick={() => setEditingBevId(null)}
                            className="text-stone-400 hover:text-stone-200 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="text-[10px] text-stone-400 block mb-0.5">عنوان:</label>
                            <input
                              type="text"
                              value={editNameVal}
                              onChange={(e) => setEditNameVal(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-stone-400 block mb-0.5">قیمت (تومان):</label>
                            <input
                              type="number"
                              value={editPriceVal}
                              onChange={(e) => setEditPriceVal(Number(e.target.value))}
                              step={5000}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-stone-400 block mb-0.5">توضیحات:</label>
                            <input
                              type="text"
                              value={editDescVal}
                              onChange={(e) => setEditDescVal(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateBeverageOption(bev.id, {
                                name: editNameVal.trim() || bev.name,
                                price: Number(editPriceVal) >= 0 ? Number(editPriceVal) : bev.price,
                                description: editDescVal.trim() || bev.description,
                              });
                              setEditingBevId(null);
                              showToast(`قیمت و مشخصات «${bev.name}» با موفقیت بروزرسانی شد.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>ذخیره تغییرات</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-stone-800 text-[#cbb5b4] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            {bev.icon === 'tea' ? (
                              <Leaf className="w-4 h-4" />
                            ) : bev.icon === 'water' ? (
                              <GlassWater className="w-4 h-4" />
                            ) : bev.icon === 'croissant' ? (
                              <UtensilsCrossed className="w-4 h-4" />
                            ) : (
                              <Coffee className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs font-bold text-stone-100 truncate">
                                {bev.name}
                              </h5>
                              <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[9px] text-stone-400 font-medium">
                                {bev.category === 'cold'
                                  ? 'نوشیدنی سرد'
                                  : bev.category === 'herbal'
                                  ? 'دمنوش'
                                  : bev.category === 'snack'
                                  ? 'میان‌وعده'
                                  : 'نوشیدنی گرم'}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                              {bev.description}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs font-bold text-[#cbb5b4] font-mono">
                                {bev.price > 0
                                  ? `${toPersianDigits(bev.price.toLocaleString())} تومان`
                                  : 'رایگان'}
                              </span>

                              <label className="text-[10px] text-stone-400 flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bev.isAvailable !== false}
                                  onChange={(e) => {
                                    updateBeverageOption(bev.id, { isAvailable: e.target.checked });
                                    showToast(`وضعیت موجودی «${bev.name}» بروزرسانی شد.`);
                                  }}
                                  className="rounded border-stone-700 text-[#7e5352] focus:ring-0"
                                />
                                <span>موجود در سالن</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBevId(bev.id);
                              setEditNameVal(bev.name);
                              setEditPriceVal(bev.price);
                              setEditDescVal(bev.description);
                            }}
                            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                            title="ویرایش قیمت و مشخصات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteBeverageOption(bev.id);
                              showToast(`آیتم «${bev.name}» حذف گردید.`);
                            }}
                            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-rose-900/50 text-stone-400 hover:text-rose-300 flex items-center justify-center transition-colors"
                            title="حذف از منو"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reset Settings Confirmation Modal */}
      {showResetConfirmModal && (
        <div
          id="reset-settings-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowResetConfirmModal(false)}
        >
          <div
            id="reset-settings-modal-content"
            className="relative w-full max-w-md bg-[#161514] border border-stone-800 rounded-3xl p-6 text-stone-100 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-stone-100">
                    بازنشانی تنظیمات آتلیه
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    بازگشت به مقادیر پیش‌فرض هویت، ساعات و قوانین
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              آیا از بازنشانی تمام بخش‌های تنظیمات (پروفایل، ساعات کاری، قوانین ودیعه، تارگت‌های مالی و اعلانات) به مقادیر اولیه اطمینان دارید؟
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بله، بازنشانی شود</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

