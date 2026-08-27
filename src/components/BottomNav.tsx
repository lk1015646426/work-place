import React from 'react';
import { Home, Sparkles, CalendarHeart, MessageCircleHeart } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  undoneHabitCount: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  undoneHabitCount,
}) => {
  const items: NavItem[] = [
    { id: 'home', label: '今日', icon: Home },
    {
      id: 'habit',
      label: '习惯',
      icon: Sparkles,
      badge: undoneHabitCount > 0 ? undoneHabitCount : undefined,
    },
    { id: 'days', label: '日子', icon: CalendarHeart },
    { id: 'hole', label: '树洞', icon: MessageCircleHeart },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Edge-to-Edge compliant, 4 core tabs) */}
      <nav
        id="bottom-nav-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--md-sys-color-surface-container-lowest)]/95 backdrop-blur-xl border-t border-[var(--md-sys-color-outline-variant)]/25 pb-safe pt-1.5 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 px-2">
          {items.map((it) => {
            const isActive = activeTab === it.id;
            const IconComponent = it.icon;

            return (
              <button
                key={it.id}
                id={`tab-btn-${it.id}`}
                onClick={() => onChangeTab(it.id)}
                className="flex flex-col items-center justify-center py-1 group touch-spring relative"
                aria-selected={isActive}
              >
                {/* Material 3 Active Pill Container */}
                <div
                  className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]/60'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-105' : 'scale-95'
                    }`}
                  />

                  {/* Badge */}
                  {it.badge && it.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {it.badge > 9 ? '9+' : it.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] mt-1 font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--md-sys-color-on-surface)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-80'
                  }`}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Tablet Navigation Rail (for wide screens) */}
      <aside
        id="side-nav-rail"
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-24 bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)]/25 flex-col items-center py-8 z-40"
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center font-serif font-bold text-xl mb-8 shadow-sm">
          台
        </div>

        <div className="flex-1 flex flex-col gap-6 w-full px-2">
          {items.map((it) => {
            const isActive = activeTab === it.id;
            const IconComponent = it.icon;

            return (
              <button
                key={it.id}
                id={`rail-btn-${it.id}`}
                onClick={() => onChangeTab(it.id)}
                className="flex flex-col items-center justify-center py-2 w-full rounded-2xl group touch-spring"
              >
                <div
                  className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {it.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {it.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isActive
                      ? 'text-[var(--md-sys-color-on-surface)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
