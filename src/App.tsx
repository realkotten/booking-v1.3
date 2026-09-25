import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenMode, BookingStep, NavigationTab, Service, Accoutrement } from './types';
import { SERVICES_DATA, ACCOUTREMENTS_DATA } from './data/mockData';
import { AtelierProvider, useAtelier } from './store/AtelierContext';
import { getCurrentSolarDateInfo } from './utils/dateUtils';
import { hapticStepAdvance, hapticLight, hapticSelection } from './utils/hapticUtils';
import { calculateBookingTotals, checkSlotAvailability, getInitialBookingSlot, isSlotExpired } from './utils/bookingUtils';

// Screens & Views
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingStep1 } from './components/OnboardingStep1';
import { OnboardingStep2 } from './components/OnboardingStep2';
import { OnboardingStep3 } from './components/OnboardingStep3';
import { AtelierHomeView } from './components/AtelierHomeView';
import { BookServicesView } from './components/BookServicesView';
import { BookPreferenceView } from './components/BookPreferenceView';
import { BookDateTimeView } from './components/BookDateTimeView';
import { BookCheckoutView } from './components/BookCheckoutView';
import { BookConfirmedView } from './components/BookConfirmedView';
import { MyBookingsView } from './components/MyBookingsView';
import { ClientProfileView } from './components/ClientProfileView';
import { BottomNavBar } from './components/BottomNavBar';
import { ManagementShell } from './components/management/ManagementShell';
import { AdminAuthModal } from './components/management/AdminAuthModal';
import { AuthModal } from './components/auth/AuthModal';

const STEP_ORDER: Record<BookingStep, number> = {
  services: 0,
  addons: 0,
  preference: 1,
  datetime: 2,
  checkout: 3,
  confirmed: 4,
};

const bookingStepVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 32 : -32,
    opacity: 0,
    scale: 0.985,
    filter: 'blur(3px)',
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : 32,
    opacity: 0,
    scale: 0.985,
    filter: 'blur(3px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const tabVariants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function AtelierAppContent() {
  const {
    currentReservation,
    setCurrentReservation,
    portalMode,
    isAuthModalOpen,
    closeManagementAuth,
    isClientAuthModalOpen,
    closeClientAuthModal,
    clientAuthMode,
    services,
    activeServices,
    accoutrements: contextAccoutrements,
    appointments,
  } = useAtelier();

  // Primary navigation state
  const [screenMode, setScreenMode] = useState<ScreenMode>('app');
  const [activeTab, setActiveTab] = useState<NavigationTab>('atelier');
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  const [bookingDirection, setBookingDirection] = useState<number>(1);
  const [skippedDateTimeConfirmation, setSkippedDateTimeConfirmation] = useState<boolean>(false);

  // Booking Form State initialized with dynamic Solar date and non-expired time slot
  const initialSlot = useMemo(() => getInitialBookingSlot(appointments), []);
  const [selectedService, setSelectedService] = useState<Service | null>(() => activeServices[0] || services[0] || null);
  const [selectedDay, setSelectedDay] = useState<number>(() => initialSlot.dayNumber);
  const [selectedTime, setSelectedTime] = useState<string>(() => initialSlot.time);
  const [accoutrements, setAccoutrements] = useState<Accoutrement[]>(() =>
    (contextAccoutrements || ACCOUTREMENTS_DATA).map((acc) => ({ ...acc, selected: false }))
  );

  // Sync accoutrements whenever admin modifies them
  useEffect(() => {
    if (contextAccoutrements) {
      setAccoutrements((prev) => {
        const selectedMap = new Map(prev.map((a) => [a.id, Boolean(a.selected)]));
        return contextAccoutrements.map((acc) => ({
          ...acc,
          selected: selectedMap.get(acc.id) || false,
        }));
      });
    }
  }, [contextAccoutrements]);

  // Guard against stale or deleted service selection
  useEffect(() => {
    if (selectedService && !services.some((s) => s.id === selectedService.id && s.isActive)) {
      setSelectedService(activeServices[0] || null);
    } else if (!selectedService && activeServices.length > 0) {
      setSelectedService(activeServices[0]);
    }
  }, [services, activeServices, selectedService]);

  const navigateBookingStep = useCallback((nextStep: BookingStep) => {
    const currentIdx = STEP_ORDER[bookingStep] ?? 0;
    const nextIdx = STEP_ORDER[nextStep] ?? 0;
    if (nextIdx > currentIdx) {
      hapticStepAdvance();
    } else {
      hapticLight();
    }
    setBookingDirection(nextIdx >= currentIdx ? 1 : -1);
    setBookingStep(nextStep);

    // Sync with browser history
    if (window.history?.pushState) {
      window.history.pushState({ tab: 'book', step: nextStep, screen: 'app' }, '');
    }
  }, [bookingStep]);

  // Handle browser back button (PopState)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.screen) setScreenMode(state.screen);
        if (state.tab) setActiveTab(state.tab);
        if (state.step) setBookingStep(state.step);
      } else {
        setActiveTab('atelier');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Active effective service fallback
  const currentEffectiveService = selectedService || activeServices[0] || services[0];

  // If in Management Portal Mode, render the Management Shell
  if (portalMode === 'management') {
    return <ManagementShell />;
  }

  // Handlers for Accoutrements
  const handleToggleAccoutrement = (acc: Accoutrement) => {
    hapticSelection();
    setAccoutrements((prev) =>
      prev.map((item) =>
        item.id === acc.id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Switch tabs cleanly
  const handleTabChange = (tab: NavigationTab) => {
    hapticLight();
    setActiveTab(tab);
    if (tab === 'book' && bookingStep === 'confirmed') {
      navigateBookingStep('services');
    }
    if (window.history?.pushState) {
      window.history.pushState({ tab, step: bookingStep, screen: 'app' }, '');
    }
  };

  // Rebook an appointment with prefilled service and reset stale selections
  const handleRebook = (service?: Service) => {
    // Reset any stale accoutrements or time with safe non-expired slot
    const freshSlot = getInitialBookingSlot(appointments);
    setAccoutrements((contextAccoutrements || ACCOUTREMENTS_DATA).map((acc) => ({ ...acc, selected: false })));
    setSelectedDay(freshSlot.dayNumber);
    setSelectedTime(freshSlot.time);

    if (service) {
      setSelectedService(service);
      navigateBookingStep('datetime');
    } else {
      navigateBookingStep('services');
    }
    setActiveTab('book');
  };

  // Direct Navigator for user convenience
  const handleDirectNavigation = (mode: ScreenMode, step?: BookingStep) => {
    setScreenMode(mode);
    if (mode === 'app') {
      if (step) {
        setActiveTab('book');
        navigateBookingStep(step);
      } else {
        setActiveTab('atelier');
      }
    }
  };

  return (
    <main className="h-screen max-h-screen bg-gradient-to-b from-[#d3b3aa] via-[#ebd7ca] to-[#c4ab9d] sm:bg-[#1a1918] flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* 1. Welcome Screen */}
      {screenMode === 'welcome' && (
        <WelcomeScreen
          onEnter={() => {
            setScreenMode('app');
            setActiveTab('book');
            navigateBookingStep('services');
          }}
          onStartOnboarding={() => setScreenMode('onboarding-1')}
        />
      )}

      {/* 2. Onboarding Steps */}
      {screenMode === 'onboarding-1' && (
        <OnboardingStep1
          onNext={() => setScreenMode('onboarding-2')}
          onSkip={() => {
            setScreenMode('app');
            setActiveTab('atelier');
          }}
          onSignIn={() => {
            setScreenMode('app');
            setActiveTab('client');
          }}
        />
      )}

      {screenMode === 'onboarding-2' && (
        <OnboardingStep2
          onNext={() => setScreenMode('onboarding-3')}
          onBack={() => setScreenMode('onboarding-1')}
          onSkip={() => {
            setScreenMode('app');
            setActiveTab('atelier');
          }}
          onSignIn={() => {
            setScreenMode('app');
            setActiveTab('client');
          }}
        />
      )}

      {screenMode === 'onboarding-3' && (
        <OnboardingStep3
          onEnter={() => {
            setScreenMode('app');
            setActiveTab('atelier');
          }}
          onBack={() => setScreenMode('onboarding-2')}
          onSkip={() => {
            setScreenMode('app');
            setActiveTab('atelier');
          }}
          onSignIn={() => {
            setScreenMode('app');
            setActiveTab('client');
          }}
        />
      )}

      {/* 3. Main Application Mode */}
      {screenMode === 'app' && (
        <div className="relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            {/* Tab 1: Atelier Home */}
            {activeTab === 'atelier' && (
              <motion.div
                key="tab-atelier"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <AtelierHomeView
                  currentReservation={currentReservation}
                  onBookClick={() => {
                    setActiveTab('book');
                    navigateBookingStep('services');
                  }}
                  onViewReservation={() => {
                    setActiveTab('my_bookings');
                  }}
                />
              </motion.div>
            )}

            {/* Tab 2: Booking Flow Steps */}
            {activeTab === 'book' && (
              <motion.div
                key="tab-book"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <div className="w-full flex justify-center overflow-hidden">
                  <AnimatePresence mode="wait" custom={bookingDirection} initial={false}>
                    {bookingStep === 'services' && (
                      <motion.div
                        key="book-step-services"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookServicesView
                          selectedService={selectedService}
                          onSelectService={(service) => setSelectedService(service)}
                          accoutrements={accoutrements}
                          onToggleAccoutrement={(id) => {
                            setAccoutrements((prev) =>
                              prev.map((item) =>
                                item.id === id ? { ...item, selected: !item.selected } : item
                              )
                            );
                          }}
                          onContinue={() => navigateBookingStep('preference')}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}

                    {bookingStep === 'preference' && currentEffectiveService && (
                      <motion.div
                        key="book-step-preference"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookPreferenceView
                          service={currentEffectiveService}
                          accoutrements={accoutrements}
                          preferredDay={selectedDay}
                          preferredTime={selectedTime}
                          onSetPreferredDay={(day) => setSelectedDay(day)}
                          onSetPreferredTime={(time) => setSelectedTime(time)}
                          onBack={() => navigateBookingStep('services')}
                          onContinue={(confirmedDay, confirmedTime) => {
                            if (!currentEffectiveService) return;
                            const effDay = confirmedDay !== undefined ? confirmedDay : selectedDay;
                            const effTime = confirmedTime || selectedTime;
                            setSelectedDay(effDay);
                            setSelectedTime(effTime);

                            const totals = calculateBookingTotals(currentEffectiveService, accoutrements);
                            const availability = checkSlotAvailability(
                              effDay,
                              effTime,
                              totals.totalDuration,
                              appointments
                            );

                            const isExpired = isSlotExpired(effDay, effTime);

                            if (availability.isAvailable && !availability.isExpired && !isExpired) {
                              // Slot is available and open: skip confirmation and proceed directly to checkout!
                              setSkippedDateTimeConfirmation(true);
                              navigateBookingStep('checkout');
                            } else {
                              // Slot is expired, occupied or conflicting: show datetime confirmation & gap resolution page
                              setSkippedDateTimeConfirmation(false);
                              navigateBookingStep('datetime');
                            }
                          }}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}

                    {bookingStep === 'datetime' && currentEffectiveService && (
                      <motion.div
                        key="book-step-datetime"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookDateTimeView
                          service={currentEffectiveService}
                          selectedDay={selectedDay}
                          selectedTime={selectedTime}
                          preferredTime={selectedTime}
                          accoutrements={accoutrements}
                          onSelectDay={(day) => setSelectedDay(day)}
                          onSelectTime={(time) => setSelectedTime(time)}
                          onBackToPreference={() => navigateBookingStep('preference')}
                          onContinueToCheckout={() => {
                            setSkippedDateTimeConfirmation(false);
                            navigateBookingStep('checkout');
                          }}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}

                    {bookingStep === 'checkout' && currentEffectiveService && (
                      <motion.div
                        key="book-step-checkout"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookCheckoutView
                          service={currentEffectiveService}
                          selectedDay={selectedDay}
                          selectedTime={selectedTime}
                          accoutrements={accoutrements}
                          onBack={() => {
                            if (skippedDateTimeConfirmation) {
                              navigateBookingStep('preference');
                            } else {
                              navigateBookingStep('datetime');
                            }
                          }}
                          onConfirmBooking={(confirmedRes) => {
                            setCurrentReservation(confirmedRes);
                            navigateBookingStep('confirmed');
                          }}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}

                    {bookingStep === 'confirmed' && (
                      <motion.div
                        key="book-step-confirmed"
                        custom={bookingDirection}
                        variants={bookingStepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full flex justify-center"
                      >
                        <BookConfirmedView
                          reservation={currentReservation}
                          onReturnHome={() => {
                            setActiveTab('atelier');
                            navigateBookingStep('services');
                          }}
                          onOpenProfile={() => setActiveTab('client')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Tab 3: My Bookings / Visits */}
            {(activeTab === 'my_bookings' || activeTab === 'visits') && (
              <motion.div
                key="tab-bookings"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <MyBookingsView
                  currentReservation={currentReservation}
                  onViewPass={() => {
                    setActiveTab('book');
                    navigateBookingStep('confirmed');
                  }}
                  onRebook={handleRebook}
                  onOpenProfile={() => setActiveTab('client')}
                />
              </motion.div>
            )}

            {/* Tab 4: Client Quarters / Profile */}
            {activeTab === 'client' && (
              <motion.div
                key="tab-client"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full flex justify-center"
              >
                <ClientProfileView
                  onNavigateScreen={handleDirectNavigation}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Dock Navigation */}
          <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      )}

      {/* Admin Authentication Modal */}
      <AdminAuthModal isOpen={isAuthModalOpen} onClose={closeManagementAuth} />

      {/* Customer / Client Firebase Auth Modal (Google & Email) */}
      <AuthModal 
        isOpen={isClientAuthModalOpen} 
        onClose={closeClientAuthModal} 
        defaultMode={clientAuthMode} 
      />
    </main>
  );
}

export default function App() {
  return (
    <AtelierProvider>
      <AtelierAppContent />
    </AtelierProvider>
  );
}
