import { StudioSettings, StudioOpeningHour } from '../types';

export const DEFAULT_OPERATING_HOURS: StudioOpeningHour[] = [
  { dayOfWeek: 'شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'یکشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'دوشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'سه‌شنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'چهارشنبه', openTime: '10:00', closeTime: '20:30', isClosed: false },
  { dayOfWeek: 'پنج‌شنبه', openTime: '10:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'جمعه', openTime: '12:00', closeTime: '18:00', isClosed: false },
];

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  profile: {
    name: 'آتلیه رویال — سوئیت پیرایش و آیین‌های اختصاصی',
    tagline: 'کانسیرج اختصاصی و آیین‌های اصلاح و پیرایش آقایان',
    masterName: 'علی رضایی',
    masterTitle: 'سرآرایشگر و مدیر آتلیه',
    phone: '+1 (212) 555-8900',
    conciergePhone: '+1 (212) 555-8901',
    email: 'concierge@sanctuary.design',
    address: 'خیابان مرسر ۴۲، سوهو، نیویورک، طبقه ۴',
    neighborhood: 'سوهو (SoHo)',
    city: 'نیویورک',
    operationalStatus: 'open',
    privateCourtyardCode: '',
    valetServiceAvailable: false,
    valetInstructions: '',
    amenities: [
      'پذیرایی باریستای اختصاصی با دانه‌های تک‌خاستگاه',
      'سوئیت‌های خصوصی آکوستیک با دیزاین ابسیدین و تراورتن',
      'سیستم هوای تصفیه‌شده با رایحه‌های گیاهی انحصاری',
    ],
  },
  announcement: {
    headline: '',
    body: '',
    tag: 'اطلاعیه سالن',
    isActive: false,
  },
  operatingHours: DEFAULT_OPERATING_HOURS,
  policies: {
    cancellationWindowHours: 24,
    bookingCutoffHours: 2,
    maxBookingHorizonDays: 30,
    depositAmount: 20,
    policyNotice: 'لغو یا جابجایی نوبت تا ۲۴ ساعت پیش از زمان رزرو شده بدون کسر ودیعه انجام می‌پذیرد.',
  },
  financialTargets: {
    today: 850,
    week: 4200,
    month: 18000,
    year: 220000,
    custom: 5000,
  },
  notificationPreferences: {
    newOnlineBooking: true,
    appointmentCancellation: true,
    appointmentReschedule: true,
    newBoutiqueOrder: false,
    paymentConfirmation: true,
    lowInventoryAlerts: false,
  },
};

/**
 * Validates tariff pricing inputs
 */
export function validateTariffInput(price: number, effectiveDate?: string): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(price) || price === null || price === undefined) {
    return { isValid: false, error: 'لطفاً یک مبلغ عددی معتبر وارد نمایید.' };
  }
  if (price < 0) {
    return { isValid: false, error: 'تعرفه خدمت نمی‌تواند منفی باشد.' };
  }
  if (price > 10000) {
    return { isValid: false, error: 'مبلغ وارد شده بیش از حد مجاز است.' };
  }
  return { isValid: true };
}
