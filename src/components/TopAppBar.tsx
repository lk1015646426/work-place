import React from 'react';
import { Sparkles, Sun, Moon, Database, Settings2, Menu } from 'lucide-react';
import { ThemeMode } from '../types';

interface TopAppBarProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onOpenBackup: () => void;
  onOpenSidebar: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  themeMode,
  onToggleTheme,
  onOpenBackup,
  onOpenSidebar,
}) => {
  const d = new Date();
  const hour = d.getHours();
  let greeting = '早安';
  let greetingIcon = '☀️';
  if (hour < 5) {
    greeting = '夜深了';
    greetingIcon = '🌙';
  } else if (hour < 11) {
    greeting = '早安';
    greetingIcon = '☕';
  } else if (hour < 14) {
    greeting = '午安';
    greetingIcon = '🍃';
  } else if (hour < 18) {
    greeting = '下午好';
    greetingIcon = '⛅';
  } else {
    greeting = '晚上好';
    greetingIcon = '✨';
  }

  const weekDay = '周' + '日一二三四五六'[d.getDay()];
  const dateText = `${d.getMonth() + 1}月${d.getDate()}日 ${weekDay}`;

  return (
    <header className="sticky top-0 z-30 pt-safe px-4 pb-3 transition-colors bg-[var(--md-sys-color-background)]/85 backdrop-blur-md border-b border-[var(--md-sys-color-outline-variant)]/20">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Left Menu Button + Brand & Greeting */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            id="btn-open-sidebar"
            onClick={onOpenSidebar}
            className="w-10 h-10 -ml-1 rounded-2xl flex items-center justify-center text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring transition-colors"
            title="打开功能侧边栏"
            aria-label="打开功能侧边栏"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm font-serif font-bold text-base sm:text-lg">
            台
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-base sm:text-lg tracking-tight text-[var(--md-sys-color-on-surface)]">
                生活台
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] font-medium">
                {greetingIcon} {greeting}
              </span>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-80">
              {dateText}
            </p>
          </div>
        </div>

        {/* Action buttons with minimum 44px touch target */}
        <div className="flex items-center gap-1">
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring transition-colors"
            title={`切换深浅主题 (当前: ${themeMode})`}
            aria-label="切换主题"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-stone-600" />
            )}
          </button>

          <button
            id="btn-open-backup"
            onClick={onOpenBackup}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring transition-colors"
            title="数据备份与恢复"
            aria-label="数据备份与恢复"
          >
            <Database className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
