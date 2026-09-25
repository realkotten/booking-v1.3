import React from 'react';
import { Scissors, Phone, MapPin } from 'lucide-react';
import { Studio } from '../../types';

interface ShopHeaderProps {
  studio?: Studio;
  onOpenManagement: () => void;
  onOpenMap: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  studio,
  onOpenManagement,
  onOpenMap,
}) => {
  const shopPhone = studio?.phone || '۰۲۱-۲۲۳۳۴۴۵۵';

  return (
    <header 
      id="shop-presence-header" 
      className="bg-white/45 backdrop-blur-2xl border border-white/70 rounded-[28px] p-3 mb-3.5 text-stone-900 shadow-xs"
    >
      <div className="flex items-center justify-between">
        {/* Shop Brand & Name */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="manager-panel-scissor-button"
            onClick={onOpenManagement}
            title="ورود به پنل مدیریت آرایشگاه"
            aria-label="ورود به پنل مدیریت آرایشگاه"
            className="group/scissor relative w-10 h-10 rounded-2xl bg-white/90 hover:bg-stone-900 text-[#7e5352] hover:text-amber-400 border border-white/90 hover:border-amber-400/40 flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Scissors className="w-5 h-5 transition-transform duration-200 group-hover/scissor:rotate-45 group-hover/scissor:scale-110" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">
              {studio?.name || 'آرایشگاه رویال'}
            </h1>
            {/* Live Hours Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-stone-700">
                امروز باز است · تا ساعت ۲۲:۰۰
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Map Actions */}
        <div className="flex items-center gap-1.5">
          <a
            id="home-quick-call-btn"
            href={`tel:${shopPhone.replace(/\D/g, '')}`}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center transition-all border border-white/90 shadow-xs"
            title={`تماس با آرایشگاه: ${shopPhone}`}
          >
            <Phone className="w-3.5 h-3.5" />
          </a>

          <button
            id="home-quick-map-btn"
            type="button"
            onClick={onOpenMap}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center transition-all border border-white/90 shadow-xs"
            title="مشاهده آدرس و مسیریابی"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
