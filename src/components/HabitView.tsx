import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Check,
  Calendar,
  Clock,
  Ban,
} from 'lucide-react';
import { Habit, HabitType } from '../types';
import { getTodayStr, generateId } from '../constants';
import {
  isHabitDoneForDate,
  calculateHabitStreak,
  getRecentDaysStatus,
  triggerCompletionConfetti,
} from '../utils/habitUtils';
import { BottomSheet } from './BottomSheet';

interface HabitViewProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onIncrementHabit: (id: string, delta: number) => void;
  onSetValueHabit: (id: string, value: number) => void;
  onAddHabit: (habit: Habit) => void;
  onUpdateHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitView: React.FC<HabitViewProps> = ({
  habits,
  onToggleHabit,
  onIncrementHabit,
  onSetValueHabit,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('check');
  const [unit, setUnit] = useState('');
  const [targetCount, setTargetCount] = useState(1);

  const today = getTodayStr();

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setName('');
    setType('check');
    setUnit('');
    setTargetCount(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Habit) => {
    setEditingHabit(h);
    setName(h.name);
    setType(h.type);
    setUnit(h.unit || '');
    setTargetCount(h.targetCount || 1);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingHabit) {
      onUpdateHabit({
        ...editingHabit,
        name: name.trim(),
        type,
        unit: unit.trim() || undefined,
        targetCount: type === 'count' ? targetCount : undefined,
      });
    } else {
      const newHabit: Habit = {
        id: generateId(),
        name: name.trim(),
        type,
        unit: unit.trim() || undefined,
        targetCount: type === 'count' ? targetCount : undefined,
        records: {},
        createdAt: today,
      };
      onAddHabit(newHabit);
    }
    setIsModalOpen(false);
  };

  // Toggle habit for today ONLY with celebration confetti on completion
  const handleToggleToday = (habit: Habit, e?: React.MouseEvent) => {
    const isCurrentlyDone = isHabitDoneForDate(habit, today);
    if (!isCurrentlyDone) {
      if (e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        triggerCompletionConfetti(x, y);
      } else {
        triggerCompletionConfetti(0.5, 0.5);
      }
    }
    onToggleHabit(habit.id);
  };

  // State for interactive heatmap day inspection
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  // State for monthly navigation
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  // Render Monthly Activity Heatmap (Pure Historical Record Display - No retroactive editing)
  const renderHeatmap = () => {
    if (habits.length === 0) return null;

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth(); // 0-11
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekdayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const isCurrentMonth =
      viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth();

    const calendarDays: {
      dateStr: string;
      dayNum: number;
      monthNum: number;
      weekdayIndex: number;
      weekdayLabel: string;
      isToday: boolean;
      isFuture: boolean;
      isPast: boolean;
      doneCount: number;
      totalCount: number;
      ratio: number;
      habitDetails: {
        habitId: string;
        habitName: string;
        isDone: boolean;
        recordValue: number;
        unit?: string;
        type: HabitType;
      }[];
    }[] = [];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const monthStr = String(viewMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
      const isToday = dateStr === today;
      const isFuture = dateStr > today;
      const isPast = dateStr < today;
      const weekdayIndex = (dateObj.getDay() + 6) % 7;
      const weekdayLabel = '周' + '一二三四五六日'[weekdayIndex];

      let doneCount = 0;
      const habitDetails = habits.map((h) => {
        const isDone = isHabitDoneForDate(h, dateStr);
        if (isDone) doneCount++;
        return {
          habitId: h.id,
          habitName: h.name,
          isDone,
          recordValue: h.records?.[dateStr] || 0,
          unit: h.unit,
          type: h.type,
        };
      });

      const totalCount = habits.length;
      const ratio = totalCount > 0 ? doneCount / totalCount : 0;

      calendarDays.push({
        dateStr,
        dayNum: day,
        monthNum: viewMonth + 1,
        weekdayIndex,
        weekdayLabel,
        isToday,
        isFuture,
        isPast,
        doneCount,
        totalCount,
        ratio,
        habitDetails,
      });
    }

    const selectedDayData = selectedDateStr
      ? calendarDays.find((d) => d.dateStr === selectedDateStr)
      : null;

    return (
      <section className="rounded-[24px] p-4 sm:p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-3">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--md-sys-color-on-surface)]">
              习惯打卡月历 · {viewYear}年{viewMonth + 1}月
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors touch-spring"
              title="上个月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              disabled={isCurrentMonth}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                isCurrentMonth
                  ? 'opacity-40 cursor-default text-[var(--md-sys-color-on-surface-variant)]'
                  : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] font-bold touch-spring'
              }`}
            >
              今月
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors touch-spring"
              title="下个月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-70">
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span className="text-amber-600 dark:text-amber-400">六</span>
            <span className="text-amber-600 dark:text-amber-400">日</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Blank placeholders before the first day */}
            {Array.from({ length: firstWeekdayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-lg opacity-0" />
            ))}

            {calendarDays.map((d) => {
              const isSelected = selectedDateStr === d.dateStr;

              let bgClass = 'bg-[var(--md-sys-color-surface-container-high)]/40';
              let textClass = 'text-[var(--md-sys-color-on-surface-variant)]';

              if (d.isFuture) {
                bgClass = 'bg-transparent border border-dashed border-[var(--md-sys-color-outline-variant)]/20';
                textClass = 'text-[var(--md-sys-color-on-surface-variant)]/30';
              } else if (d.ratio === 1 && d.totalCount > 0) {
                bgClass = 'bg-emerald-500 text-white font-bold shadow-2xs';
                textClass = 'text-white';
              } else if (d.ratio >= 0.66) {
                bgClass = 'bg-emerald-500/70 text-white font-semibold';
                textClass = 'text-white';
              } else if (d.ratio > 0) {
                bgClass = 'bg-emerald-500/35 text-emerald-950 dark:text-emerald-100 font-medium';
                textClass = 'text-emerald-950 dark:text-emerald-100';
              } else if (d.isPast) {
                bgClass = 'bg-rose-500/10 text-rose-600/70 border border-rose-500/15';
                textClass = 'text-rose-600/70 dark:text-rose-400/70';
              }

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr((prev) => (prev === d.dateStr ? null : d.dateStr))}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all touch-spring ${bgClass} ${
                    d.isToday ? 'ring-2 ring-[var(--md-sys-color-primary)] ring-offset-1 font-bold' : ''
                  } ${isSelected ? 'scale-108 z-10 ring-2 ring-amber-500 shadow-md' : 'hover:scale-104'}`}
                >
                  <span className={`text-[11px] leading-none ${textClass}`}>{d.dayNum}</span>
                  {d.doneCount > 0 && !d.isFuture && (
                    <span className="text-[8px] opacity-80 leading-none mt-0.5 scale-90">
                      {d.doneCount}/{d.totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (Read-only historical view) */}
        {selectedDayData && (
          <div className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/25 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                <span>📅 {selectedDayData.dateStr} ({selectedDayData.weekdayLabel})</span>
                <span className="font-normal text-[var(--md-sys-color-on-surface-variant)] text-[11px]">
                  完成 {selectedDayData.doneCount}/{selectedDayData.totalCount} 项
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="text-[11px] text-[var(--md-sys-color-primary)] hover:underline"
              >
                收起
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {selectedDayData.habitDetails.map((item) => (
                <div
                  key={item.habitId}
                  className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-1.5 border ${
                    item.isDone
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                      : 'bg-rose-500/5 text-rose-700 dark:text-rose-300 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="font-medium truncate">{item.habitName}</span>
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 ${item.isDone ? 'opacity-80' : 'opacity-70'}`}>
                    {item.isDone ? '已完成' : '未打卡'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4 pb-nav">
      {/* Top Header Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold font-serif text-[var(--md-sys-color-on-surface)] truncate">
            习惯养成
          </h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
            真实记录点滴成长 · 仅限当日打卡，错过不可补签
          </p>
        </div>
        <button
          id="btn-add-habit"
          onClick={handleOpenAdd}
          className="whitespace-nowrap shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-sm touch-spring"
        >
          <Plus className="w-4 h-4" /> <span>新建习惯</span>
        </button>
      </div>

      {/* Strict Rule Notice */}
      <div className="rounded-[20px] px-3.5 py-2.5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/25 flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
        <Ban className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="text-[11px] leading-tight">
          <strong className="text-[var(--md-sys-color-on-surface)]">不可补签规则：</strong>
          习惯打卡必须在当天完成，历史日期无法追溯补签，请坚持每天打卡保持连击！
        </p>
      </div>

      {/* Heatmap */}
      {renderHeatmap()}

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="rounded-[24px] p-8 text-center bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
            <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-1">
              还没有添加习惯
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">
              喝水、阅读、早睡……从一个微小的好习惯开始吧
            </p>
            <button
              onClick={handleOpenAdd}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold"
            >
              立即创建第一个习惯
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const streakData = calculateHabitStreak(habit);
            const streak = streakData.currentStreak;
            const rec = habit.records?.[today] || 0;
            const isDoneToday = isHabitDoneForDate(habit, today);
            const isYesterdayMissed = streakData.isYesterdayMissed;
            const recentDays = getRecentDaysStatus(habit, 7);

            return (
              <div
                key={habit.id}
                id={`habit-card-${habit.id}`}
                className={`relative rounded-[22px] sm:rounded-[24px] p-3.5 sm:p-4 transition-all duration-300 border overflow-hidden ${
                  isDoneToday
                    ? 'bg-emerald-500/8 dark:bg-emerald-500/12 border-emerald-500/35 shadow-xs'
                    : isYesterdayMissed
                    ? 'bg-rose-500/5 dark:bg-rose-950/15 border-rose-500/30'
                    : 'bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[var(--md-sys-color-surface-container-low)] border-dashed border-[var(--md-sys-color-outline-variant)]/50'
                }`}
              >
                {/* Completed Ribbon for checked habits */}
                {isDoneToday && (
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none overflow-hidden">
                    <div className="absolute transform rotate-45 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-bold py-0.5 right-[-34px] sm:right-[-32px] top-[12px] sm:top-[14px] w-[95px] sm:w-[100px] text-center shadow-xs">
                      今日达成
                    </div>
                  </div>
                )}

                <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3">
                  {/* Left: Check Toggle & Name & Badges */}
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={(e) => handleToggleToday(habit, e)}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-full flex items-center justify-center transition-all duration-200 touch-spring shrink-0 mt-0.5 sm:mt-0 ${
                        isDoneToday
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-2 sm:ring-4 ring-emerald-500/20'
                          : 'border-2 border-dashed border-[var(--md-sys-color-outline)]/60 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]/60 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                      aria-label={`打卡 ${habit.name}`}
                    >
                      {isDoneToday ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8] animate-pop" />
                      ) : (
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className={`text-sm sm:text-base font-bold truncate max-w-full ${
                            isDoneToday
                              ? 'text-emerald-950 dark:text-emerald-100'
                              : 'text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          {habit.name}
                        </h4>

                        {/* Streak Badge */}
                        {streak > 0 ? (
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                            <span>{streak}天连击</span>
                          </span>
                        ) : isYesterdayMissed ? (
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>断卡</span>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                            <Clock className="w-2.5 h-2.5 opacity-60" />
                            <span>今日待打卡</span>
                          </span>
                        )}

                        {isDoneToday && (
                          <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>已完成</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] flex-wrap">
                        <span className="whitespace-nowrap">
                          {habit.type === 'count'
                            ? `今日进度: ${rec} / ${habit.targetCount || 1} ${habit.unit || '次'}`
                            : habit.type === 'value'
                            ? `今日数值: ${rec} ${habit.unit || ''}`
                            : isDoneToday
                            ? '今日目标已达成 ✨'
                            : '今日尚未打卡 · 点击左侧圆圈完成'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions / Steppers */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {habit.type === 'count' && (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--md-sys-color-surface)] rounded-full p-0.5 sm:p-1 border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
                        <button
                          onClick={() => onIncrementHabit(habit.id, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring"
                          aria-label="减少"
                        >
                          -
                        </button>
                        <span className="min-w-[18px] sm:min-w-[22px] text-center font-serif font-bold text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] tabular-nums">
                          {rec}
                        </span>
                        <button
                          onClick={(e) => {
                            if (rec + 1 >= (habit.targetCount || 1)) {
                              triggerCompletionConfetti(0.5, 0.5);
                            }
                            onIncrementHabit(habit.id, 1);
                          }}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring"
                          aria-label="增加"
                        >
                          +
                        </button>
                      </div>
                    )}

                    {habit.type === 'value' && (
                      <input
                        type="number"
                        value={rec || ''}
                        onChange={(e) => onSetValueHabit(habit.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-14 sm:w-16 px-2 py-1 text-center text-xs rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-mono font-bold outline-none"
                      />
                    )}

                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring"
                      title="编辑习惯"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`确认删除习惯“${habit.name}”？历史打卡数据也将一并清除。`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 touch-spring"
                      title="删除习惯"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Micro Timeline Tracker (Read-only historical view, only shows records) */}
                <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[var(--md-sys-color-outline-variant)]/15 flex items-center justify-between gap-1">
                  <div className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 whitespace-nowrap shrink-0">
                    <Calendar className="w-3 h-3 opacity-60" />
                    <span>近7天打卡记录:</span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
                    {recentDays.map((item) => {
                      const isCompleted = item.status === 'completed';
                      const isMissed = item.status === 'missed';
                      const isPending = item.status === 'pending';

                      return (
                        <div
                          key={item.dateStr}
                          className={`relative flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                            item.isToday
                              ? 'bg-[var(--md-sys-color-surface-container-highest)]/60'
                              : ''
                          }`}
                          title={`${item.dateStr} (${item.weekdayLabel}): ${
                            isCompleted
                              ? '已打卡达成'
                              : isMissed
                              ? '未打卡（已逾期不可补）'
                              : '今日待打卡'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-[var(--md-sys-color-on-surface-variant)] opacity-70 scale-90">
                            {item.isToday ? '今' : item.weekdayLabel}
                          </span>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                              isCompleted
                                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                : isMissed
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-bold'
                                : 'border border-dashed border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : isMissed ? (
                              <span className="text-[10px] leading-none">×</span>
                            ) : isPending ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)]" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Habit Modal Bottom Sheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? '编辑习惯' : '新建习惯'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              习惯名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：每日晨起喝温水、阅读20分钟"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 focus:border-[var(--md-sys-color-primary)] text-sm outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              打卡方式
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'check', label: '完成打勾' },
                { id: 'count', label: '频次计数' },
                { id: 'value', label: '数值记录' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as HabitType)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    type === t.id
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent font-semibold'
                      : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'count' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
                  每日目标频次
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
                  单位 (选填)
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="如：杯、次、页"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {type === 'value' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
                记录单位
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="如：步数、页、分钟"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-sm outline-none"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-sm shadow-sm touch-spring whitespace-nowrap"
            >
              {editingHabit ? '保存修改' : '立即创建'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
