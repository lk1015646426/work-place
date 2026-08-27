import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageCircleHeart,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  Quote,
  RotateCw,
  Copy,
  Check,
  ClipboardList,
  Trash2,
  ListPlus,
  Send,
  CalendarHeart,
  Moon,
  Pin,
  Flame,
  AlertCircle,
  LayoutGrid,
  Timer,
  Wind,
  Compass,
  PieChart,
} from 'lucide-react';
import { Habit, DayEvent, TreeHoleItem, MemoItem, TabType } from '../types';
import {
  getTodayStr,
  getOffsetDateStr,
  calculateDayEventMeta,
  MOOD_DEFINITIONS,
  fetchRandomQuote,
  DailyQuote,
  FALLBACK_QUOTES,
} from '../constants';
import { DailyReviewModal } from './DailyReviewModal';
import { CircularProgress } from './CircularProgress';
import {
  isHabitDoneForDate,
  calculateHabitStreak,
  triggerCompletionConfetti,
} from '../utils/habitUtils';

interface TodayViewProps {
  habits: Habit[];
  days: DayEvent[];
  treeholes: TreeHoleItem[];
  memos?: MemoItem[];
  onNavigate: (tab: TabType) => void;
  onToggleHabit: (id: string) => void;
  onIncrementHabit: (id: string, delta: number) => void;
  onOpenAddHole: () => void;
  onAddMemo: (text: string) => void;
  onToggleMemo: (id: string) => void;
  onDeleteMemo: (id: string) => void;
  onConvertMemoToHabit: (memo: MemoItem) => void;
  onConvertMemoToHole: (memo: MemoItem) => void;
  onOpenExplore?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  habits,
  days,
  treeholes,
  memos = [],
  onNavigate,
  onToggleHabit,
  onIncrementHabit,
  onOpenAddHole,
  onAddMemo,
  onToggleMemo,
  onDeleteMemo,
  onConvertMemoToHabit,
  onConvertMemoToHole,
  onOpenExplore,
}) => {
  const today = getTodayStr();

  // Quote State
  const [quote, setQuote] = useState<DailyQuote>(() => FALLBACK_QUOTES[0]);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Memo input state
  const [memoInput, setMemoInput] = useState('');

  // Daily Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Fetch a random quote on mount
  useEffect(() => {
    let isMounted = true;
    fetchRandomQuote().then((q) => {
      if (isMounted) setQuote(q);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshQuote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingQuote(true);
    const newQuote = await fetchRandomQuote();
    setQuote(newQuote);
    setIsLoadingQuote(false);
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quote) return;
    const textToCopy = `“${quote.hitokoto}” —— ${quote.from_who ? quote.from_who + ' ' : ''}《${quote.from}》`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    });
  };

  const handleAddMemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoInput.trim()) return;
    onAddMemo(memoInput.trim());
    setMemoInput('');
  };

  // Habit calculations
  const habitStatuses = habits.map((h) => {
    const rec = h.records?.[today] || 0;
    const isDone =
      h.type === 'check' ? rec > 0 : h.type === 'count' ? rec >= (h.targetCount || 1) : rec > 0;
    return { habit: h, isDone, record: rec };
  });

  const completedHabits = habitStatuses.filter((s) => s.isDone);
  const undoneHabits = habitStatuses.filter((s) => !s.isDone);
  const habitCompletionRate =
    habits.length > 0 ? Math.round((completedHabits.length / habits.length) * 100) : 0;

  // Day calculations (Prioritize pinned days, then nearest countdowns)
  const processedDays = days.map((d) => ({
    event: d,
    meta: calculateDayEventMeta(d),
  }));

  const sortedDays = processedDays
    .filter((x) => x.meta.isCountdown && (x.meta.remain ?? 0) >= 0)
    .sort((a, b) => {
      if (a.event.isPinned && !b.event.isPinned) return -1;
      if (!a.event.isPinned && b.event.isPinned) return 1;
      return (a.meta.remain ?? 0) - (b.meta.remain ?? 0);
    });

  // If no upcoming countdown, check for pinned anniversary or first event
  const heroEvent = sortedDays[0] || processedDays.find((d) => d.event.isPinned) || processedDays[0];

  // Treehole calculations
  const todayHole = treeholes.find((th) => th.date === today);
  const latestHole = treeholes[0];
  const activeHole = todayHole || latestHole;
  const moodMeta = activeHole ? MOOD_DEFINITIONS[activeHole.mood] : null;

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4 pb-nav">
      {/* 1. Daily Random Open-Source Quote (Hitokoto) */}
      <section className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-[var(--md-sys-color-surface-container-low)] to-indigo-500/10 border border-[var(--md-sys-color-outline-variant)]/25 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Quote className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">每日灵感寄语 · 开源一言</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyQuote}
              title="复制金句"
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors touch-spring"
            >
              {copiedQuote ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRefreshQuote}
              disabled={isLoadingQuote}
              title="换一句"
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors touch-spring"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingQuote ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm sm:text-base font-serif italic text-[var(--md-sys-color-on-surface)] leading-relaxed">
            “{quote.hitokoto}”
          </p>
          <p className="text-right text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-medium">
            —— {quote.from_who ? `${quote.from_who} ` : ''}《{quote.from}》
          </p>
        </div>
      </section>

      {/* 2. Hero Bento Card: Pinned / Nearest Milestone Countdown */}
      {heroEvent && (
        <section
          id="hero-countdown-card"
          onClick={() => onNavigate('days')}
          className="relative overflow-hidden rounded-[24px] p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm cursor-pointer touch-spring group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1.5">
                {heroEvent.event.isPinned && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5 fill-current" /> 置顶
                  </span>
                )}
                {heroEvent.meta.isCountdown ? '倒数日 · 重要期待' : '纪念日 · 历经时光'}
              </span>
            </div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              查看全部 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="text-xl font-bold font-serif text-[var(--md-sys-color-on-surface)] truncate">
                {heroEvent.event.name}
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {heroEvent.meta.isCountdown ? '目标日期：' : '起始日期：'}
                {heroEvent.meta.dispDate}
                {heroEvent.event.tag && ` · ${heroEvent.event.tag}`}
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <CircularProgress
                progress={heroEvent.meta.progress ?? 100}
                size={76}
                strokeWidth={5.5}
                colorClass={
                  heroEvent.meta.isToday
                    ? 'text-rose-500'
                    : heroEvent.meta.isCountdown
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-emerald-500 dark:text-emerald-400'
                }
              >
                <div className="flex flex-col items-center justify-center leading-none">
                  {heroEvent.meta.isToday ? (
                    <span className="text-xs font-bold font-serif text-rose-500">
                      今天!
                    </span>
                  ) : heroEvent.meta.isCountdown ? (
                    <>
                      <span className="text-xl font-extrabold font-serif text-amber-600 dark:text-amber-400 tabular-nums">
                        {heroEvent.meta.remain}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                        天后
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-extrabold font-serif text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {heroEvent.meta.daysCount}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                        天已过
                      </span>
                    </>
                  )}
                </div>
              </CircularProgress>
            </div>
          </div>
        </section>
      )}

      {/* 3. 2-Column Bento Grid: Habit Progress & Mood Anchor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Habit Quick Progress Widget */}
        <div
          id="bento-habit-summary"
          onClick={() => onNavigate('habit')}
          className="rounded-[24px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 cursor-pointer touch-spring flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface)] text-emerald-600 dark:text-emerald-400">
              {habitCompletionRate}% 完成
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-3xl font-serif font-bold text-[var(--md-sys-color-on-surface)]">
                {completedHabits.length}
                <span className="text-lg font-normal text-[var(--md-sys-color-on-surface-variant)]">
                  /{habits.length}
                </span>
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                今日打卡
              </span>
            </div>

            {/* M3 Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${habitCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Treehole Mood Anchor */}
        <div
          id="bento-treehole-summary"
          onClick={() => onNavigate('hole')}
          className="rounded-[24px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 cursor-pointer touch-spring flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <MessageCircleHeart className="w-5 h-5" />
            </div>
            {moodMeta && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: moodMeta.lightBg,
                  color: moodMeta.textColor,
                }}
              >
                <span>{moodMeta.emoji}</span>
                <span>{moodMeta.label}</span>
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1">
              {todayHole ? '今日心事记录' : '最近树洞回响'}
            </p>
            <p className="text-sm line-clamp-2 text-[var(--md-sys-color-on-surface)] leading-relaxed">
              {activeHole
                ? activeHole.text
                : '树洞里还很安静，把今天想说的一句话悄悄写下来吧...'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Evening Review Banner */}
      <section
        onClick={() => setIsReviewOpen(true)}
        className="rounded-[24px] p-4 sm:p-4.5 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 border border-teal-500/20 cursor-pointer touch-spring flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[var(--md-sys-color-on-surface)]">
              今日心晴与晚间复盘
            </h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              一键查看今日达成手记 · 生成专属复盘卡片
            </p>
          </div>
        </div>
        <button
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-[var(--md-sys-color-surface)] border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-1 shadow-xs"
        >
          生成手记 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 5. Quick Memo / Scratchpad Inbox */}
      <section className="rounded-[24px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            <h3 className="font-serif font-bold text-base text-[var(--md-sys-color-on-surface)]">
              闪念便签 / 收集箱
            </h3>
            {memos.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20 text-[var(--md-sys-color-on-surface-variant)] font-mono">
                {memos.filter((m) => !m.completed).length} 未完成
              </span>
            )}
          </div>
        </div>

        {/* Spacious Memo Input Form */}
        <form onSubmit={handleAddMemoSubmit} className="space-y-2">
          <div className="relative rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20 transition-all p-3 shadow-xs">
            <textarea
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (memoInput.trim()) {
                    onAddMemo(memoInput.trim());
                    setMemoInput('');
                  }
                }
              }}
              rows={3}
              placeholder="捕捉突发灵感、临时待办、随想随记... (按 Enter 快速保存，Shift+Enter 换行)"
              className="w-full bg-transparent text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none resize-none leading-relaxed min-h-[64px]"
            />

            <div className="flex items-center justify-end pt-2 border-t border-[var(--md-sys-color-outline-variant)]/10 text-xs">
              <div className="flex items-center gap-2">
                {memoInput.trim() && (
                  <button
                    type="button"
                    onClick={() => setMemoInput('')}
                    className="px-2 py-1 text-[11px] text-[var(--md-sys-color-on-surface-variant)] hover:text-rose-500 transition-colors"
                  >
                    清空
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!memoInput.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed touch-spring transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> 记下灵感
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Memo List */}
        {memos.length === 0 ? (
          <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
            💡 收集箱空空如也，随时记下一闪而过的想法吧
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="group p-3 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/15 flex items-start justify-between gap-3 hover:border-[var(--md-sys-color-outline-variant)]/40 transition-all shadow-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onToggleMemo(memo.id)}
                    className="shrink-0 mt-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-emerald-500 transition-colors"
                  >
                    {memo.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-4 h-4 stroke-[1.8]" />
                    )}
                  </button>
                  <p
                    className={`text-xs sm:text-[13px] leading-relaxed break-words whitespace-pre-wrap flex-1 ${
                      memo.completed
                        ? 'line-through text-[var(--md-sys-color-on-surface-variant)] opacity-60'
                        : 'text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    {memo.text}
                  </p>
                </div>

                {/* Quick actions: Convert to habit / Convert to treehole / Delete */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onConvertMemoToHabit(memo)}
                    title="转为长期习惯"
                    className="px-2 py-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-emerald-600 hover:bg-[var(--md-sys-color-surface-container-high)] text-[11px] flex items-center gap-1 transition-colors touch-spring"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">转习惯</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onConvertMemoToHole(memo)}
                    title="投进树洞"
                    className="px-2 py-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-violet-600 hover:bg-[var(--md-sys-color-surface-container-high)] text-[11px] flex items-center gap-1 transition-colors touch-spring"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">转树洞</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMemo(memo.id)}
                    title="删除"
                    className="p-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors touch-spring"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Today's Unfinished Habit Quick Checklist */}
      <section className="rounded-[24px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base text-[var(--md-sys-color-on-surface)]">
              待打卡清单
            </h3>
            {undoneHabits.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-semibold">
                剩 {undoneHabits.length} 项
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigate('habit')}
            className="text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] flex items-center gap-1"
          >
            全部习惯 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {undoneHabits.length === 0 ? (
          <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            ✨ 太棒了！今日所有日常打卡已全部达成！
          </div>
        ) : (
          <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
            {undoneHabits.map(({ habit, record }) => {
              const streak = calculateHabitStreak(habit).currentStreak;

              const handleCheck = (e: React.MouseEvent) => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                triggerCompletionConfetti(x, y);
                onToggleHabit(habit.id);
              };

              return (
                <div
                  key={habit.id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={handleCheck}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors touch-spring"
                      aria-label={`完成 ${habit.name}`}
                    >
                      <Circle className="w-6 h-6 stroke-[1.8]" />
                    </button>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                          {habit.name}
                        </p>
                        {streak > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            {streak}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {habit.type === 'count'
                          ? `目标 ${habit.targetCount || 1} ${habit.unit || '次'}`
                          : habit.type === 'value'
                          ? `记录数值 (${habit.unit || '项'})`
                          : '日常单次打卡'}
                      </p>
                    </div>
                  </div>

                  {/* Direct quick action */}
                  {habit.type === 'count' ? (
                    <button
                      onClick={(e) => {
                        if (record + 1 >= (habit.targetCount || 1)) {
                          const x = e.clientX / window.innerWidth;
                          const y = e.clientY / window.innerHeight;
                          triggerCompletionConfetti(x, y);
                        }
                        onIncrementHabit(habit.id, 1);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold touch-spring"
                    >
                      +1 {habit.unit || '次'}
                    </button>
                  ) : (
                    <button
                      onClick={handleCheck}
                      className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs font-medium hover:bg-emerald-500 hover:text-white transition-colors touch-spring"
                    >
                      打卡
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Quick Treehole Action Button */}
      <section className="rounded-[24px] p-5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-sm text-[var(--md-sys-color-on-surface)]">
            此刻有些心事想收录？
          </h4>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            写给树洞，它永远是你安静的避风港
          </p>
        </div>
        <button
          id="btn-quick-treehole"
          onClick={onOpenAddHole}
          className="whitespace-nowrap shrink-0 px-4 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-sm touch-spring"
        >
          <Plus className="w-4 h-4" /> <span>投递心事</span>
        </button>
      </section>

      {/* 8. Modular Feature Exploration Showcase (Future Modules Hub) */}
      {onOpenExplore && (
        <section
          onClick={onOpenExplore}
          className="rounded-[24px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/25 space-y-3 cursor-pointer hover:border-[var(--md-sys-color-primary)]/40 transition-all touch-spring group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[var(--md-sys-color-on-surface)]">
                功能扩展中心
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                探索新工具
              </span>
            </div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              查看全部 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            生活台已接入模块化架构，探索专注时钟、正念呼吸、愿望清单与周度报表等丰富工具。
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: '番茄时钟', icon: Timer, color: '#ef4444' },
              { label: '正念呼吸', icon: Wind, color: '#14b8a6' },
              { label: '周度报表', icon: PieChart, color: '#f97316' },
              { label: '愿望清单', icon: Compass, color: '#eab308' },
            ].map((tool, i) => {
              const IconComp = tool.icon;
              return (
                <div
                  key={i}
                  className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/15 flex flex-col items-center gap-1.5 text-center group-hover:bg-[var(--md-sys-color-surface-container-high)]/60 transition-colors"
                >
                  <IconComp className="w-4 h-4" style={{ color: tool.color }} />
                  <span className="text-[10px] font-medium text-[var(--md-sys-color-on-surface)]">
                    {tool.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Daily Review Polaroid Modal */}
      <DailyReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        habits={habits}
        treeholes={treeholes}
        quote={quote}
      />
    </div>
  );
};
