/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, AppData, Habit, DayEvent, TreeHoleItem, MemoItem, ThemeMode } from './types';
import { loadAppData, saveAppData } from './storage';
import { getTodayStr, generateId } from './constants';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/TodayView';
import { HabitView } from './components/HabitView';
import { DaysView } from './components/DaysView';
import { HoleView } from './components/HoleView';
import { BackupModal } from './components/BackupModal';
import { SidebarDrawer } from './components/SidebarDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('livingdesk_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme class to <html>
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('livingdesk_theme_mode', themeMode);
  }, [themeMode]);

  // Persist appData on changes
  const updateData = (newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const today = getTodayStr();

  // Habit Handlers
  const handleToggleHabit = (id: string) => {
    const nextHabits = appData.habits.map((h) => {
      if (h.id !== id) return h;
      const records = { ...(h.records || {}) };
      const current = records[today] || 0;
      if (current > 0) {
        delete records[today];
      } else {
        records[today] = h.type === 'count' ? (h.targetCount || 1) : 1;
      }
      return { ...h, records };
    });
    updateData({ ...appData, habits: nextHabits });
  };

  const handleIncrementHabit = (id: string, delta: number) => {
    const nextHabits = appData.habits.map((h) => {
      if (h.id !== id) return h;
      const records = { ...(h.records || {}) };
      const current = records[today] || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) {
        delete records[today];
      } else {
        records[today] = nextVal;
      }
      return { ...h, records };
    });
    updateData({ ...appData, habits: nextHabits });
  };

  const handleSetValueHabit = (id: string, value: number) => {
    const nextHabits = appData.habits.map((h) => {
      if (h.id !== id) return h;
      const records = { ...(h.records || {}) };
      if (value <= 0) {
        delete records[today];
      } else {
        records[today] = value;
      }
      return { ...h, records };
    });
    updateData({ ...appData, habits: nextHabits });
  };

  const handleAddHabit = (habit: Habit) => {
    updateData({ ...appData, habits: [habit, ...appData.habits] });
  };

  const handleUpdateHabit = (habit: Habit) => {
    updateData({
      ...appData,
      habits: appData.habits.map((h) => (h.id === habit.id ? habit : h)),
    });
  };

  const handleDeleteHabit = (id: string) => {
    updateData({
      ...appData,
      habits: appData.habits.filter((h) => h.id !== id),
    });
  };

  // Day Handlers
  const handleAddDay = (day: DayEvent) => {
    updateData({ ...appData, days: [day, ...appData.days] });
  };

  const handleUpdateDay = (day: DayEvent) => {
    updateData({
      ...appData,
      days: appData.days.map((d) => (d.id === day.id ? day : d)),
    });
  };

  const handleTogglePinDay = (id: string) => {
    updateData({
      ...appData,
      days: appData.days.map((d) =>
        d.id === id
          ? {
              ...d,
              isPinned: !d.isPinned,
              pinnedAt: !d.isPinned ? new Date().toISOString() : undefined,
            }
          : d
      ),
    });
  };

  const handleDeleteDay = (id: string) => {
    updateData({
      ...appData,
      days: appData.days.filter((d) => d.id !== id),
    });
  };

  // Treehole Handlers
  const handleAddHole = (item: TreeHoleItem) => {
    updateData({ ...appData, treeholes: [item, ...appData.treeholes] });
  };

  const handleDeleteHole = (id: string) => {
    updateData({
      ...appData,
      treeholes: appData.treeholes.filter((th) => th.id !== id),
    });
  };

  // Memo Handlers
  const handleAddMemo = (text: string) => {
    const newMemo: MemoItem = {
      id: generateId(),
      text,
      completed: false,
      createdAt: today,
    };
    updateData({
      ...appData,
      memos: [newMemo, ...(appData.memos || [])],
    });
  };

  const handleToggleMemo = (id: string) => {
    const nextMemos = (appData.memos || []).map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    updateData({ ...appData, memos: nextMemos });
  };

  const handleDeleteMemo = (id: string) => {
    const nextMemos = (appData.memos || []).filter((m) => m.id !== id);
    updateData({ ...appData, memos: nextMemos });
  };

  const handleConvertMemoToHabit = (memo: MemoItem) => {
    const newHabit: Habit = {
      id: generateId(),
      name: memo.text,
      type: 'check',
      records: {},
      createdAt: today,
    };
    // Remove from memos and add to habits
    const nextMemos = (appData.memos || []).filter((m) => m.id !== memo.id);
    updateData({
      ...appData,
      habits: [newHabit, ...appData.habits],
      memos: nextMemos,
    });
    setActiveTab('habit');
  };

  const handleConvertMemoToHole = (memo: MemoItem) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newHole: TreeHoleItem = {
      id: generateId(),
      text: memo.text,
      mood: 'calm',
      date: today,
      time: timeStr,
      tags: ['收集箱'],
    };
    const nextMemos = (appData.memos || []).filter((m) => m.id !== memo.id);
    updateData({
      ...appData,
      treeholes: [newHole, ...appData.treeholes],
      memos: nextMemos,
    });
    setActiveTab('hole');
  };

  // Undone habit count for badge
  const undoneHabitCount = appData.habits.filter((h) => {
    const rec = h.records?.[today] || 0;
    return h.type === 'count' ? rec < (h.targetCount || 1) : rec === 0;
  }).length;

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)] transition-colors duration-200 md:pl-24">
      {/* Top App Bar with Edge-to-Edge immersion */}
      <TopAppBar
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Content View with transition */}
      <main className="pt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'home' && (
              <TodayView
                habits={appData.habits}
                days={appData.days}
                treeholes={appData.treeholes}
                memos={appData.memos || []}
                onNavigate={setActiveTab}
                onToggleHabit={handleToggleHabit}
                onIncrementHabit={handleIncrementHabit}
                onOpenAddHole={() => setActiveTab('hole')}
                onAddMemo={handleAddMemo}
                onToggleMemo={handleToggleMemo}
                onDeleteMemo={handleDeleteMemo}
                onConvertMemoToHabit={handleConvertMemoToHabit}
                onConvertMemoToHole={handleConvertMemoToHole}
                onOpenExplore={() => setIsSidebarOpen(true)}
              />
            )}

            {activeTab === 'habit' && (
              <HabitView
                habits={appData.habits}
                onToggleHabit={handleToggleHabit}
                onIncrementHabit={handleIncrementHabit}
                onSetValueHabit={handleSetValueHabit}
                onAddHabit={handleAddHabit}
                onUpdateHabit={handleUpdateHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            )}

            {activeTab === 'days' && (
              <DaysView
                days={appData.days}
                onAddDay={handleAddDay}
                onUpdateDay={handleUpdateDay}
                onDeleteDay={handleDeleteDay}
                onTogglePinDay={handleTogglePinDay}
              />
            )}

            {activeTab === 'hole' && (
              <HoleView
                treeholes={appData.treeholes}
                onAddHole={handleAddHole}
                onDeleteHole={handleDeleteHole}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation for mobile + Navigation Rail for tablet/desktop */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        undoneHabitCount={undoneHabitCount}
      />

      {/* Left Navigation Sidebar Drawer (Expandable for unlimited features) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        undoneHabitCount={undoneHabitCount}
      />

      {/* Backup / Data Management Modal Bottom Sheet */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        appData={appData}
        onRestoreData={(newData) => updateData(newData)}
      />
    </div>
  );
}
