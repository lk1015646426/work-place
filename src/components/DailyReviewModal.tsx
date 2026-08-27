import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Share2,
  Check,
  Calendar,
  Quote,
  Flame,
  Award,
  Heart,
  MessageCircleHeart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { Habit, TreeHoleItem } from '../types';
import { getTodayStr, MOOD_DEFINITIONS, DailyQuote } from '../constants';
import { triggerCompletionConfetti } from '../utils/habitUtils';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  treeholes: TreeHoleItem[];
  quote: DailyQuote | null;
}

type CardTheme = 'warm' | 'emerald' | 'twilight' | 'paper';

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({
  isOpen,
  onClose,
  habits,
  treeholes,
  quote,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTheme, setActiveTheme] = useState<CardTheme>('warm');
  const [selectedHoleIndex, setSelectedHoleIndex] = useState(0);
  const today = getTodayStr();

  if (!isOpen) return null;

  // Habit metrics
  const habitStatuses = habits.map((h) => {
    const rec = h.records?.[today] || 0;
    const isDone =
      h.type === 'check' ? rec > 0 : h.type === 'count' ? rec >= (h.targetCount || 1) : rec > 0;
    return { habit: h, isDone, record: rec };
  });

  const completed = habitStatuses.filter((s) => s.isDone);
  const uncompleted = habitStatuses.filter((s) => !s.isDone);
  const completionRate =
    habits.length > 0 ? Math.round((completed.length / habits.length) * 100) : 0;

  // Treehole info (filter for today, or fallback to latest)
  const todayHoles = treeholes.filter((th) => th.date === today);
  const displayHoles = todayHoles.length > 0 ? todayHoles : treeholes.slice(0, 1);
  const currentHole = displayHoles[selectedHoleIndex] || displayHoles[0] || null;
  const moodMeta = currentHole ? MOOD_DEFINITIONS[currentHole.mood] : MOOD_DEFINITIONS.calm;

  // Format today's date for display
  const dateObj = new Date();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekDayStr = weekDays[dateObj.getDay()];
  const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const timeStr = dateObj.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // Theme styling configurations
  const themeStyles = {
    warm: {
      cardBg: 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950',
      border: 'border-amber-900/10 dark:border-stone-800',
      headerAccent: 'text-amber-900 dark:text-amber-200',
      quoteBg: 'bg-amber-500/5 dark:bg-stone-800/60 border-amber-500/20 dark:border-stone-700/60',
      textAccent: 'text-amber-800 dark:text-amber-300',
      tagBg: 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
    },
    emerald: {
      cardBg: 'bg-gradient-to-b from-[#F7FCF9] via-[#EFF9F3] to-[#E5F5EC] dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-950',
      border: 'border-emerald-900/10 dark:border-emerald-900/30',
      headerAccent: 'text-emerald-950 dark:text-emerald-200',
      quoteBg: 'bg-emerald-500/5 dark:bg-emerald-950/30 border-emerald-500/20 dark:border-emerald-800/40',
      textAccent: 'text-emerald-800 dark:text-emerald-300',
      tagBg: 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
    twilight: {
      cardBg: 'bg-gradient-to-b from-[#F9F8FC] via-[#F3F0FA] to-[#EAE4F5] dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950',
      border: 'border-indigo-900/10 dark:border-indigo-900/30',
      headerAccent: 'text-indigo-950 dark:text-indigo-200',
      quoteBg: 'bg-indigo-500/5 dark:bg-indigo-950/30 border-indigo-500/20 dark:border-indigo-800/40',
      textAccent: 'text-indigo-800 dark:text-indigo-300',
      tagBg: 'bg-indigo-100/70 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300',
    },
    paper: {
      cardBg: 'bg-[var(--md-sys-color-surface)]',
      border: 'border-[var(--md-sys-color-outline-variant)]/30',
      headerAccent: 'text-[var(--md-sys-color-on-surface)]',
      quoteBg: 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline-variant)]/20',
      textAccent: 'text-[var(--md-sys-color-primary)]',
      tagBg: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]',
    },
  }[activeTheme];

  const handleCopySummary = () => {
    const habitLines = completed.length > 0
      ? completed
          .map((c) => {
            const h = c.habit;
            const extra =
              h.type === 'count'
                ? ` (${c.record}/${h.targetCount || 1}${h.unit || '次'})`
                : h.type === 'value'
                ? ` (${c.record}${h.unit || ''})`
                : '';
            return `  ✓ ${h.name}${extra}`;
          })
          .join('\n')
      : '  (今日暂未打卡)';

    const treeholeText = currentHole
      ? `🌿 情绪归属：${moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : '平静'}\n💭 今日心声：\n“${currentHole.text}”`
      : '🌿 情绪归属：平静心境\n💭 今日心声：今天心境平和，未写下烦扰。';

    const quoteText = quote
      ? `📜 每日灵感：\n“${quote.hitokoto}”\n—— ${quote.from_who ? quote.from_who + ' ' : ''}《${quote.from}》`
      : '';

    const summaryText = [
      `╭──────── 时光手记 · 今日复盘 ────────╮`,
      `📅 日期：${formattedDate} · ${weekDayStr}`,
      `⏰ 结语时刻：${timeStr}`,
      ``,
      `🎯 习惯执行力：${completionRate}% (${completed.length}/${habits.length} 项达成)`,
      habitLines,
      ``,
      treeholeText,
      ``,
      quoteText,
      `╰──────────────────────────────────────╯`,
      `—— 来自 我的日常工作台 · 记录每日点滴`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      triggerCompletionConfetti(0.5, 0.4);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg my-auto rounded-[32px] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Top Bar Controls */}
          <div className="px-5 py-3.5 border-b border-[var(--md-sys-color-outline-variant)]/15 flex items-center justify-between shrink-0 bg-[var(--md-sys-color-surface)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--md-sys-color-on-surface)]">
                  时光手记 · 今日复盘
                </h3>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  {formattedDate} · {weekDayStr}
                </p>
              </div>
            </div>

            {/* Theme Selector Pills */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center p-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/20">
                {(
                  [
                    { key: 'warm', label: '暖阳', color: '#f59e0b' },
                    { key: 'emerald', label: '青竹', color: '#10b981' },
                    { key: 'twilight', label: '暮紫', color: '#8b5cf6' },
                    { key: 'paper', label: '素雅', color: '#78716c' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTheme(t.key)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                      activeTheme === t.key
                        ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs font-bold'
                        : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors ml-1"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Journal Canvas */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* The Artistic Journal Card Frame */}
            <div
              className={`rounded-[26px] p-5 sm:p-6 border shadow-sm transition-all duration-300 space-y-5 relative ${themeStyles.cardBg} ${themeStyles.border}`}
            >
              {/* Card Header Stamp */}
              <div className="flex items-start justify-between border-b border-black/5 dark:border-white/10 pb-3.5">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-70 mb-0.5">
                    <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>DAILY MEMOIR & REFLECTION</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-[var(--md-sys-color-on-surface)] tracking-tight">
                    今日生活与心境手札
                  </h4>
                </div>

                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-mono font-bold text-[var(--md-sys-color-on-surface)]">
                    {timeStr}
                  </div>
                  <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                    晚间结算
                  </p>
                </div>
              </div>

              {/* 1. Habit Completion Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    习惯达成概览
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      达成率
                    </span>
                    <span className="text-base font-serif font-extrabold text-emerald-600 dark:text-emerald-400">
                      {completionRate}%
                    </span>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      ({completed.length}/{habits.length})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* Completed Habit Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {completed.length > 0 ? (
                    completed.map((c) => {
                      const h = c.habit;
                      const extra =
                        h.type === 'count'
                          ? ` (${c.record}/${h.targetCount || 1}${h.unit || '次'})`
                          : h.type === 'value'
                          ? ` (${c.record}${h.unit || ''})`
                          : '';
                      return (
                        <span
                          key={h.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{h.name}</span>
                          {extra && <span className="opacity-75 text-[11px]">{extra}</span>}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                      今日暂无已完成的习惯打卡
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Mood & Treehole Echo Section (Full text display with zero truncation) */}
              <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/10">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                    <MessageCircleHeart className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    情绪归属与心声
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Mood attribution chip */}
                    {moodMeta && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs border border-black/5"
                        style={{
                          backgroundColor: moodMeta.lightBg,
                          color: moodMeta.textColor,
                        }}
                      >
                        <span className="text-sm leading-none">{moodMeta.emoji}</span>
                        <span className="whitespace-nowrap">{moodMeta.label}</span>
                      </span>
                    )}

                    {/* Multi-entry pagination if today has multiple thoughts */}
                    {displayHoles.length > 1 && (
                      <div className="flex items-center gap-1 text-[11px] text-[var(--md-sys-color-on-surface-variant)] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedHoleIndex((prev) =>
                              prev > 0 ? prev - 1 : displayHoles.length - 1
                            )
                          }
                          className="hover:text-[var(--md-sys-color-on-surface)]"
                          title="前一条心事"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span>
                          {selectedHoleIndex + 1}/{displayHoles.length}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedHoleIndex((prev) =>
                              prev < displayHoles.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="hover:text-[var(--md-sys-color-on-surface)]"
                          title="后一条心事"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Heart reflection card - Full expanded view, completely free of truncation */}
                {currentHole ? (
                  <div className="rounded-2xl p-4 bg-white/70 dark:bg-stone-900/70 border border-black/5 dark:border-white/10 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {currentHole.time || '今日'}
                      </span>
                      <span>树洞投递</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto pr-1">
                      <p className="text-sm font-serif leading-relaxed text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap break-words tracking-wide">
                        “{currentHole.text}”
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 bg-white/40 dark:bg-stone-900/40 border border-dashed border-black/10 dark:border-white/10 text-center py-5">
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                      今天心境平和无澜，未曾在树洞写下烦扰。
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Daily Hitokoto Quote */}
              {quote && (
                <div
                  className={`rounded-2xl p-4 border space-y-2 transition-colors ${themeStyles.quoteBg}`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Quote className="w-3.5 h-3.5" />
                    <span>今日灵感寄语</span>
                  </div>

                  <p className="text-xs sm:text-sm font-serif italic text-[var(--md-sys-color-on-surface)] leading-relaxed">
                    “{quote.hitokoto}”
                  </p>

                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] text-right font-medium">
                    —— {quote.from_who ? `${quote.from_who} ` : ''}《{quote.from}》
                  </p>
                </div>
              )}

              {/* Card Footer Watermark */}
              <div className="pt-2 text-center text-[10px] tracking-widest text-[var(--md-sys-color-on-surface-variant)] opacity-50 uppercase font-mono">
                ✦ TIMELESS JOURNAL · 岁序常易 华章日新 ✦
              </div>
            </div>
          </div>

          {/* Action Bottom Bar */}
          <div className="p-4 sm:p-5 border-t border-[var(--md-sys-color-outline-variant)]/15 bg-[var(--md-sys-color-surface)] flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all touch-spring shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> 已复制手记文案
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> 复制今日复盘手记
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs sm:text-sm font-medium touch-spring hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
            >
              留存收起
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

