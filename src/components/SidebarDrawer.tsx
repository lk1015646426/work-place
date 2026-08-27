import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Home,
  Sparkles,
  CalendarHeart,
  MessageCircleHeart,
  Timer,
  PieChart,
  Wind,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  undoneHabitCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  undoneHabitCount,
}) => {
  const [activePreview, setActivePreview] = useState<{
    name: string;
    desc: string;
    tag: string;
  } | null>(null);

  // Grouped Navigation Items
  const navSections = [
    {
      title: '核心日常',
      items: [
        {
          id: 'home' as TabType,
          label: '今日总览',
          icon: Home,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
          desc: '习惯、纪念日与灵感手札',
        },
        {
          id: 'habit' as TabType,
          label: '习惯养成',
          icon: Sparkles,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          badge: undoneHabitCount > 0 ? undoneHabitCount : undefined,
          desc: '打卡追踪与连击热力图',
        },
        {
          id: 'days' as TabType,
          label: '日子纪念',
          icon: CalendarHeart,
          color: 'text-pink-600 dark:text-pink-400',
          bg: 'bg-pink-500/10',
          desc: '倒数日与累计纪念提醒',
        },
        {
          id: 'hole' as TabType,
          label: '心情树洞',
          icon: MessageCircleHeart,
          color: 'text-violet-600 dark:text-violet-400',
          bg: 'bg-violet-500/10',
          desc: '12种细腻心绪与心声记录',
        },
      ],
    },
    {
      title: '效率与探索 (预留扩展)',
      items: [
        {
          id: 'pomodoro',
          label: '番茄专注时钟',
          icon: Timer,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10',
          tag: '规划中',
          desc: '沉浸白噪音与番茄工作流计时',
        },
        {
          id: 'breathing',
          label: '正念与呼吸',
          icon: Wind,
          color: 'text-teal-500',
          bg: 'bg-teal-500/10',
          tag: '规划中',
          desc: '4-7-8 呼吸减压与身心放松',
        },
        {
          id: 'weekly_report',
          label: '周/月度报表',
          icon: PieChart,
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
          tag: '规划中',
          desc: '打卡达成率与情绪光谱周期图',
        },
        {
          id: 'life_compass',
          label: '愿望清单 (OKR)',
          icon: Compass,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          tag: '规划中',
          desc: '长期目标拆解与心愿成就墙',
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Left Sidebar Drawer Container - Ultra-Compact Width (50% reduced) */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-36 sm:w-40 max-w-[45vw] h-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline-variant)]/20 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-3 border-b border-[var(--md-sys-color-outline-variant)]/15 flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)]">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                  台
                </div>
                <h3 className="font-serif font-bold text-xs text-[var(--md-sys-color-on-surface)] leading-tight">
                  生活台
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors"
                aria-label="关闭侧边栏"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-0.5">
                  <div className="px-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                    {section.title}
                  </div>

                  <div className="space-y-0.5">
                    {section.items.map((it) => {
                      const IconComp = it.icon;
                      const isCore = 'id' in it && ['home', 'habit', 'days', 'hole'].includes(it.id as string);
                      const isCurrent = isCore && activeTab === (it.id as TabType);

                      return (
                        <button
                          key={it.label}
                          type="button"
                          onClick={() => {
                            if (isCore) {
                              onChangeTab(it.id as TabType);
                              onClose();
                            } else {
                              setActivePreview({
                                name: it.label,
                                desc: it.desc,
                                tag: it.tag || '功能规划中',
                              });
                            }
                          }}
                          className={`w-full px-2 py-1.5 rounded-xl flex items-center justify-between text-left transition-all touch-spring ${
                            isCurrent
                              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs'
                              : 'hover:bg-[var(--md-sys-color-surface-container-high)]/60 text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${it.bg} ${it.color}`}
                            >
                              <IconComp className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-medium truncate">{it.label}</span>
                          </div>

                          {it.badge ? (
                            <span className="px-1 py-0.2 rounded-full text-[8px] font-bold bg-amber-500 text-white shrink-0">
                              {it.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>

          {/* Quick Preview Toast for Coming Soon Features */}
          {activePreview && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/40"
                onClick={() => setActivePreview(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-xs rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 p-4 space-y-3 shadow-2xl z-20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--md-sys-color-primary)]">
                    {activePreview.tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[var(--md-sys-color-on-surface)]">
                    {activePreview.name}
                  </h4>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
                    {activePreview.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]/10 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  💡 侧边栏已预留此功能槽位，随时可接入扩展。
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
