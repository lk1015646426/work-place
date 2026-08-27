import React, { useState } from 'react';
import {
  Plus,
  CalendarHeart,
  RotateCw,
  Trash2,
  Edit2,
  Sparkles,
  Tag,
  Clock,
  Pin,
  PinOff,
  Info,
} from 'lucide-react';
import { DayEvent, DayType } from '../types';
import { calculateDayEventMeta, generateId, getTodayStr } from '../constants';
import { BottomSheet } from './BottomSheet';
import { CircularProgress } from './CircularProgress';

interface DaysViewProps {
  days: DayEvent[];
  onAddDay: (day: DayEvent) => void;
  onUpdateDay: (day: DayEvent) => void;
  onDeleteDay: (id: string) => void;
  onTogglePinDay?: (id: string) => void;
}

export const DaysView: React.FC<DaysViewProps> = ({
  days,
  onAddDay,
  onUpdateDay,
  onDeleteDay,
  onTogglePinDay,
}) => {
  const [filter, setFilter] = useState<'all' | 'countdown' | 'accum'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<DayEvent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [type, setType] = useState<DayType>('countdown');
  const [repeatYear, setRepeatYear] = useState(false);
  const [tag, setTag] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handleOpenAdd = () => {
    setEditingDay(null);
    setName('');
    setDate(getTodayStr());
    setType('countdown');
    setRepeatYear(false);
    setTag('');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: DayEvent) => {
    setEditingDay(d);
    setName(d.name);
    setDate(d.date);
    setType(d.type);
    setRepeatYear(d.repeatYear);
    setTag(d.tag || '');
    setIsPinned(!!d.isPinned);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !date) return;

    if (editingDay) {
      onUpdateDay({
        ...editingDay,
        name: name.trim(),
        date,
        type,
        repeatYear,
        tag: tag.trim() || undefined,
        isPinned,
        pinnedAt: isPinned ? (editingDay.pinnedAt || new Date().toISOString()) : undefined,
      });
    } else {
      const newDay: DayEvent = {
        id: generateId(),
        name: name.trim(),
        date,
        type,
        repeatYear,
        tag: tag.trim() || undefined,
        isPinned,
        pinnedAt: isPinned ? new Date().toISOString() : undefined,
      };
      onAddDay(newDay);
    }
    setIsModalOpen(false);
  };

  // Process and sort events
  const processed = days.map((d) => ({
    event: d,
    meta: calculateDayEventMeta(d),
  }));

  const filtered = processed.filter((item) => {
    if (filter === 'countdown') return item.meta.isCountdown;
    if (filter === 'accum') return !item.meta.isCountdown;
    return true;
  });

  // Sort: pinned events first, then upcoming countdowns, then anniversaries
  const sorted = filtered.sort((a, b) => {
    // 1. Pinned prioritization
    const aPinned = !!a.event.isPinned;
    const bPinned = !!b.event.isPinned;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // 2. Both pinned or both unpinned
    if (a.meta.isCountdown && b.meta.isCountdown) {
      return (a.meta.remain ?? 0) - (b.meta.remain ?? 0);
    }
    if (!a.meta.isCountdown && !b.meta.isCountdown) {
      return b.meta.daysCount - a.meta.daysCount;
    }
    return a.meta.isCountdown ? -1 : 1;
  });

  const pinnedCount = days.filter((d) => d.isPinned).length;

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4 pb-nav">
      {/* Top Header Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-[var(--md-sys-color-on-surface)]">
            日子记
          </h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            倒数一次期待，或纪念一段开始 · 支持多条重要置顶
          </p>
        </div>
        <button
          id="btn-add-day"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold flex items-center gap-1.5 shadow-sm touch-spring"
        >
          <Plus className="w-4 h-4" /> 记一个日子
        </button>
      </div>

      {/* Counting rule friendly explanation card */}
      <div className="rounded-[20px] p-3.5 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            关于计数规则说明：
          </p>
          <p className="text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/80">
            • <strong>倒数日</strong>：目标日即为第 0 天（显示“就是今天”），明天为“1 天后”。<br />
            • <strong>纪念日</strong>：起始当天为第 0 天，过完第 1 天（满 24 小时自然日）计为“1 天以来”。
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `全部 (${days.length})` },
          {
            id: 'countdown',
            label: `倒数日 (${days.filter((d) => d.type === 'countdown').length})`,
          },
          {
            id: 'accum',
            label: `纪念日 (${days.filter((d) => d.type === 'accum').length})`,
          },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.id
                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-[24px] p-8 text-center bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
            <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-1">
              还没有记录重要日子
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">
              生日、旅行计划、纪念日……把期待数着过
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold"
            >
              添加第一个日子
            </button>
          </div>
        ) : (
          sorted.map(({ event, meta }) => {
            const isCountdown = meta.isCountdown;
            const isToday = meta.isToday;
            const isPinned = !!event.isPinned;

            return (
              <div
                key={event.id}
                id={`day-card-${event.id}`}
                className={`relative rounded-[24px] p-4 transition-all duration-200 border ${
                  isToday
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : isPinned
                    ? 'bg-gradient-to-r from-amber-500/10 via-[var(--md-sys-color-surface-container-low)] to-[var(--md-sys-color-surface-container-low)] border-amber-500/30 shadow-xs'
                    : 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline-variant)]/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      {isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                          <Pin className="w-2.5 h-2.5 fill-current" /> 已置顶
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCountdown
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isCountdown ? '倒数' : '纪念'}
                      </span>

                      {event.repeatYear && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)]">
                          <RotateCw className="w-2.5 h-2.5" /> 每年
                        </span>
                      )}

                      {event.tag && (
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                          #{event.tag}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold font-serif text-[var(--md-sys-color-on-surface)] truncate">
                      {event.name}
                    </h4>

                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                      {isCountdown
                        ? `目标日期：${meta.dispDate}`
                        : `开始日期：${event.date}`}
                    </p>
                  </div>

                  {/* Right: Circular Progress & Numbers & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Circular Progress Gauge */}
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        progress={meta.progress ?? 100}
                        size={64}
                        strokeWidth={4.5}
                        colorClass={
                          isToday
                            ? 'text-rose-500'
                            : isCountdown
                            ? 'text-amber-500 dark:text-amber-400'
                            : 'text-emerald-500 dark:text-emerald-400'
                        }
                      >
                        <div className="flex flex-col items-center justify-center leading-none">
                          {isToday ? (
                            <span className="text-[11px] font-bold font-serif text-rose-500">
                              今天!
                            </span>
                          ) : (
                            <>
                              <span
                                className={`text-base font-extrabold font-serif tabular-nums tracking-tight ${
                                  isCountdown
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {meta.daysCount}
                              </span>
                              <span className="text-[9px] font-medium text-[var(--md-sys-color-on-surface-variant)] mt-0.5 scale-90">
                                {isCountdown ? '天后' : '天已过'}
                              </span>
                            </>
                          )}
                        </div>
                      </CircularProgress>
                    </div>

                    {/* Pin / Edit / Delete Buttons */}
                    <div className="flex flex-col gap-1 border-l border-[var(--md-sys-color-outline-variant)]/25 pl-2">
                      <button
                        onClick={() => onTogglePinDay ? onTogglePinDay(event.id) : onUpdateDay({ ...event, isPinned: !event.isPinned })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors touch-spring ${
                          isPinned
                            ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                            : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                        }`}
                        title={isPinned ? '取消置顶' : '置顶此日子'}
                      >
                        {isPinned ? (
                          <PinOff className="w-3.5 h-3.5" />
                        ) : (
                          <Pin className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring"
                        title="编辑"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`删除日子“${event.name}”？`)) {
                            onDeleteDay(event.id);
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 touch-spring"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Day Modal Bottom Sheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDay ? '编辑日子' : '记一个日子'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              日子名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：妈妈生日、冰岛旅行出发、在一起"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 focus:border-[var(--md-sys-color-primary)] text-sm outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              目标 / 起始日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              日子类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('countdown')}
                className={`py-3 px-3 rounded-2xl text-xs border transition-all ${
                  type === 'countdown'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent font-semibold'
                    : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                倒数日（数着还有几天）
              </button>
              <button
                type="button"
                onClick={() => setType('accum')}
                className={`py-3 px-3 rounded-2xl text-xs border transition-all ${
                  type === 'accum'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-transparent font-semibold'
                    : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                纪念日（数着过了几天）
              </button>
            </div>
          </div>

          {/* Pin toggle in form */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
            <div>
              <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" /> 置顶此日子
              </p>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                在列表中置顶显示，同时优先展示在今日工作台顶部
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
            <div>
              <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                每年自动重复
              </p>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                生日或结婚纪念日每年自动轮替到下一年
              </p>
            </div>
            <input
              type="checkbox"
              checked={repeatYear}
              onChange={(e) => setRepeatYear(e.target.checked)}
              className="w-5 h-5 accent-[var(--md-sys-color-primary)] rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              标签分类 (选填)
            </label>
            <div className="flex items-center gap-2">
              {['家人', '旅行', '生活', '事业', '纪念'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    tag === t
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-sm shadow-sm touch-spring"
            >
              {editingDay ? '保存修改' : '保存日子'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
