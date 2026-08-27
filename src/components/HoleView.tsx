import React, { useState } from 'react';
import {
  Plus,
  Send,
  Trash2,
  Copy,
  Sparkles,
  Smile,
  BarChart2,
  Check,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { TreeHoleItem, MoodType } from '../types';
import {
  MOOD_DEFINITIONS,
  getTodayStr,
  getCurrentTimeStr,
  generateId,
} from '../constants';

interface HoleViewProps {
  treeholes: TreeHoleItem[];
  onAddHole: (item: TreeHoleItem) => void;
  onDeleteHole: (id: string) => void;
}

export const HoleView: React.FC<HoleViewProps> = ({
  treeholes,
  onAddHole,
  onDeleteHole,
}) => {
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [filterMood, setFilterMood] = useState<MoodType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newItem: TreeHoleItem = {
      id: generateId(),
      text: text.trim(),
      mood: selectedMood,
      date: getTodayStr(),
      time: getCurrentTimeStr(),
    };

    onAddHole(newItem);
    setText('');
  };

  const handleCopy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate mood stats
  const totalHoles = treeholes.length;
  const moodCounts: Record<string, number> = {};
  treeholes.forEach((th) => {
    moodCounts[th.mood] = (moodCounts[th.mood] || 0) + 1;
  });

  const moodsList = Object.keys(MOOD_DEFINITIONS) as MoodType[];
  const curMoodMeta = MOOD_DEFINITIONS[selectedMood] || MOOD_DEFINITIONS.calm;

  // Active moods with > 0 count, sorted by count descending
  const activeMoodEntries = moodsList
    .filter((k) => (moodCounts[k] || 0) > 0)
    .map((k) => ({
      key: k,
      meta: MOOD_DEFINITIONS[k],
      count: moodCounts[k] || 0,
      percent: Math.round(((moodCounts[k] || 0) / (totalHoles || 1)) * 100),
      fraction: (moodCounts[k] || 0) / (totalHoles || 1),
    }))
    .sort((a, b) => b.count - a.count);

  const dominantMood = activeMoodEntries[0];

  // SVG Donut Calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  // Filtered treeholes for timeline
  const displayTreeholes = filterMood
    ? treeholes.filter((th) => th.mood === filterMood)
    : treeholes;

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4 pb-nav">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold font-serif text-[var(--md-sys-color-on-surface)]">
          树洞心事
        </h2>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          把情绪安放于此，给心灵留一片私密无扰的呼吸空间
        </p>
      </div>

      {/* 1. Quick Post Box */}
      <section className="rounded-[28px] p-5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/25 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              此刻心绪
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all"
              style={{
                backgroundColor: curMoodMeta.lightBg,
                color: curMoodMeta.textColor,
              }}
            >
              <span>{curMoodMeta.emoji}</span>
              <span>{curMoodMeta.label}</span>
            </span>
          </div>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-75">
            私密本地存储 · 离线安全
          </span>
        </div>

        {/* Mood Chips Selector - 12 Enriched Moods */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
          {moodsList.map((mKey) => {
            const m = MOOD_DEFINITIONS[mKey];
            const isSelected = selectedMood === mKey;
            // Short 2-char label for compact chip view
            const shortLabel = m.label.slice(0, 2);

            return (
              <button
                key={mKey}
                type="button"
                onClick={() => setSelectedMood(mKey)}
                className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1 text-[11px] transition-all touch-spring ${
                  isSelected
                    ? 'ring-2 font-bold shadow-xs scale-102 z-10'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/20 hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
                style={{
                  backgroundColor: isSelected ? m.lightBg : undefined,
                  color: isSelected ? m.textColor : undefined,
                  borderColor: isSelected ? m.color : undefined,
                }}
                title={m.label}
              >
                <span className="text-xs leading-none">{m.emoji}</span>
                <span className="truncate leading-none">{shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Integrated Composer Box: Textarea + Embedded Action Bar */}
        <div className="rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/15 transition-all overflow-hidden shadow-xs">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="倾吐此刻的所思、所感、生活琐碎或只说给树洞的秘密……"
            className="w-full p-3.5 bg-transparent text-sm outline-none resize-none leading-relaxed text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50"
          />

          {/* Action & Status Bar inside the composer */}
          <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-[var(--md-sys-color-outline-variant)]/15 bg-[var(--md-sys-color-surface-container-low)]/50">
            <div className="flex items-center gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              <span className="font-mono text-[10px] opacity-75">
                {text.length > 0 ? `${text.length} 字` : '私密倾诉'}
              </span>
              {text.length > 0 && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-[10px] text-rose-500/80 hover:text-rose-600 hover:underline"
                >
                  清空
                </button>
              )}
            </div>

            <button
              id="btn-post-hole"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none shadow-xs hover:opacity-95 active:scale-95 touch-spring transition-all"
            >
              <Send className="w-3.5 h-3.5" /> 投进树洞
            </button>
          </div>
        </div>
      </section>

      {/* 2. Beautiful & Compact Donut Ring Compass (环形情绪罗盘) */}
      {totalHoles > 0 && (
        <section className="rounded-[24px] p-4 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 shadow-xs space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--md-sys-color-primary)]/10 text-[var(--md-sys-color-primary)] flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] tracking-wide">
                情绪罗盘
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20 text-[var(--md-sys-color-on-surface-variant)] font-mono">
                {totalHoles} 条心事
              </span>
            </div>

            {filterMood ? (
              <button
                type="button"
                onClick={() => setFilterMood(null)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--md-sys-color-primary)] hover:underline touch-spring"
              >
                <RotateCcw className="w-3 h-3" />
                <span>显示全部</span>
              </button>
            ) : (
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                点击环形或标签筛选
              </span>
            )}
          </div>

          {/* Donut Ring + Single-line Horizontally Scrollable Pure Text Badges */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            {/* SVG Donut Ring Chart */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  className="text-[var(--md-sys-color-surface-container-high)] opacity-40"
                  strokeWidth="8"
                />

                {/* Mood Ring Segments */}
                {(() => {
                  let cumulative = 0;
                  return activeMoodEntries.map((item) => {
                    const strokeDasharray = `${item.fraction * circumference} ${circumference}`;
                    const strokeDashoffset = -cumulative * circumference;
                    cumulative += item.fraction;

                    const isFiltered = filterMood === item.key;

                    return (
                      <circle
                        key={item.key}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={item.meta.color}
                        strokeWidth={isFiltered ? '11' : '8'}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="cursor-pointer transition-all duration-200 hover:opacity-85"
                        onClick={() =>
                          setFilterMood((prev) => (prev === item.key ? null : item.key))
                        }
                      />
                    );
                  });
                })()}
              </svg>

              {/* Ring Center Info */}
              <div className="absolute inset-2.5 rounded-full bg-[var(--md-sys-color-surface)]/90 backdrop-blur-xs border border-[var(--md-sys-color-outline-variant)]/20 shadow-2xs flex flex-col items-center justify-center text-center pointer-events-none p-0.5">
                {filterMood ? (
                  <>
                    <span className="text-sm leading-none">
                      {MOOD_DEFINITIONS[filterMood]?.emoji}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface)] mt-0.5 truncate max-w-[48px]">
                      {MOOD_DEFINITIONS[filterMood]?.label}
                    </span>
                    <span className="text-[8px] text-[var(--md-sys-color-primary)] font-bold font-mono">
                      {activeMoodEntries.find((e) => e.key === filterMood)?.percent || 0}%
                    </span>
                  </>
                ) : dominantMood ? (
                  <>
                    <span className="text-sm leading-none">{dominantMood.meta.emoji}</span>
                    <span className="text-[9px] font-bold text-[var(--md-sys-color-on-surface)] mt-0.5 font-mono">
                      {dominantMood.percent}%
                    </span>
                    <span className="text-[8px] text-[var(--md-sys-color-on-surface-variant)] opacity-75 truncate max-w-[48px] leading-tight">
                      {dominantMood.meta.label}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right: Single-line Horizontally Scrollable (推动滑动，无滚动条，纯文字完整显现) */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {activeMoodEntries.map((item) => {
                const isFiltered = filterMood === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setFilterMood((prev) => (prev === item.key ? null : item.key))
                    }
                    className={`whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all touch-spring ${
                      isFiltered
                        ? 'ring-2 ring-[var(--md-sys-color-primary)] font-bold shadow-2xs'
                        : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/25 hover:border-[var(--md-sys-color-outline-variant)]/50 text-[var(--md-sys-color-on-surface)]'
                    }`}
                    style={
                      isFiltered
                        ? {
                            backgroundColor: item.meta.lightBg,
                            borderColor: item.meta.color,
                            color: item.meta.textColor,
                          }
                        : undefined
                    }
                  >
                    <span className="font-medium text-[11px] sm:text-xs">
                      {item.meta.label}
                    </span>
                    <span className="font-mono font-bold text-[11px]">
                      {item.percent}%
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">
                      ({item.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Timeline Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              时间印记
            </span>
            {filterMood && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary)]/10 text-[var(--md-sys-color-primary)] font-medium">
                仅显示 {MOOD_DEFINITIONS[filterMood].label}
              </span>
            )}
          </div>
        </div>

        {displayTreeholes.length === 0 ? (
          <div className="rounded-[24px] p-8 text-center bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
            <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-1">
              {filterMood ? '暂无匹配该心绪的心事记录' : '树洞里还很空荡'}
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              {filterMood ? (
                <button
                  type="button"
                  onClick={() => setFilterMood(null)}
                  className="text-[var(--md-sys-color-primary)] underline"
                >
                  查看全部心事记录
                </button>
              ) : (
                '写下第一条心事，它会默默为你珍藏'
              )}
            </p>
          </div>
        ) : (
          displayTreeholes.map((th) => {
            const m = MOOD_DEFINITIONS[th.mood] || MOOD_DEFINITIONS.calm;
            const isCopied = copiedId === th.id;

            return (
              <div
                key={th.id}
                id={`treehole-card-${th.id}`}
                className="rounded-[24px] p-4 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20 transition-all space-y-2.5"
              >
                {/* Meta header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: m.lightBg,
                        color: m.textColor,
                      }}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </span>

                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-75">
                      {th.date} {th.time}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(th.text, th.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] touch-spring"
                      title="复制内容"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定从树洞中清除此条心事？')) {
                          onDeleteHole(th.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 touch-spring"
                      title="清除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text Content */}
                <p className="text-sm text-[var(--md-sys-color-on-surface)] leading-relaxed whitespace-pre-wrap break-words">
                  {th.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
