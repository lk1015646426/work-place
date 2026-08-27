import { Habit } from '../types';
import { getTodayStr, getOffsetDateStr } from '../constants';
import confetti from 'canvas-confetti';

export type HabitDayStatus = 'completed' | 'missed' | 'pending' | 'before_created';

/**
 * Check if a habit is completed on a specific date
 */
export function isHabitDoneForDate(habit: Habit, dateStr: string): boolean {
  const rec = habit.records?.[dateStr] || 0;
  if (habit.type === 'check') {
    return rec > 0;
  }
  if (habit.type === 'count') {
    return rec >= (habit.targetCount || 1);
  }
  if (habit.type === 'value') {
    return rec > 0;
  }
  return rec > 0;
}

/**
 * Determine the exact status for a specific date:
 * - 'completed': Done for that date
 * - 'missed': Date is in the past (< today), habit existed, and was NOT completed before midnight
 * - 'pending': Today and not yet completed (still has time before midnight!)
 * - 'before_created': Habit was not yet created on that date
 */
export function getHabitDateStatus(habit: Habit, dateStr: string): HabitDayStatus {
  const today = getTodayStr();
  const isDone = isHabitDoneForDate(habit, dateStr);

  if (isDone) {
    return 'completed';
  }

  // If date is today and not done, it is in-progress / pending
  if (dateStr === today) {
    return 'pending';
  }

  // If date is in the past (< today) and not done:
  // It means midnight has passed and it was missed / can be made up!
  if (dateStr < today) {
    return 'missed';
  }

  return 'before_created';
}

/**
 * Calculate streak and historical completion stats
 */
export function calculateHabitStreak(habit: Habit): {
  currentStreak: number;
  bestStreak: number;
  isYesterdayMissed: boolean;
  totalCompletedDays: number;
} {
  const today = getTodayStr();
  const yesterday = getOffsetDateStr(-1);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let totalCompletedDays = 0;

  // Check past 365 days
  const d = new Date();
  let checkedToday = false;

  for (let i = 0; i < 365; i++) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    const isDone = isHabitDoneForDate(habit, key);

    if (isDone) {
      totalCompletedDays++;
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    // For current streak from today/yesterday backwards
    if (i === 0) {
      if (isDone) {
        currentStreak++;
        checkedToday = true;
      }
    } else if (i === 1) {
      if (isDone) {
        currentStreak++;
      } else if (!checkedToday) {
        // Neither today nor yesterday was done -> current streak is 0
        currentStreak = 0;
      }
    } else {
      if (isDone && currentStreak > 0) {
        currentStreak++;
      } else if (currentStreak > 0 && !isDone) {
        // Streak ended
        break;
      }
    }

    d.setDate(d.getDate() - 1);
  }

  // Check if yesterday was missed (created on or before yesterday, but not done)
  const createdDate = habit.createdAt ? habit.createdAt.slice(0, 10) : '2000-01-01';
  const isYesterdayActive = yesterday >= createdDate;
  const isYesterdayDone = isHabitDoneForDate(habit, yesterday);
  const isYesterdayMissed = isYesterdayActive && !isYesterdayDone;

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    isYesterdayMissed,
    totalCompletedDays,
  };
}

/**
 * Get recent 7 days status array for micro timeline
 */
export function getRecentDaysStatus(
  habit: Habit,
  daysCount = 7
): {
  dateStr: string;
  weekdayLabel: string;
  dayNum: string;
  isToday: boolean;
  status: HabitDayStatus;
}[] {
  const today = getTodayStr();
  const result: {
    dateStr: string;
    weekdayLabel: string;
    dayNum: string;
    isToday: boolean;
    status: HabitDayStatus;
  }[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const dateStr = getOffsetDateStr(-i);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const weekdayIndex = (dateObj.getDay() + 6) % 7;
    const weekdayLabel = ['一', '二', '三', '四', '五', '六', '日'][weekdayIndex];
    const dayNum = dateStr.slice(8);
    const isToday = dateStr === today;
    const status = getHabitDateStatus(habit, dateStr);

    result.push({
      dateStr,
      weekdayLabel,
      dayNum,
      isToday,
      status,
    });
  }

  return result;
}

/**
 * Trigger lightweight joyful confetti burst on completion
 */
export function triggerCompletionConfetti(originX = 0.5, originY = 0.6) {
  try {
    confetti({
      particleCount: 36,
      spread: 60,
      startVelocity: 25,
      ticks: 120,
      gravity: 1.1,
      scalar: 0.9,
      origin: { x: originX, y: originY },
      colors: ['#10b981', '#f59e0b', '#38bdf8', '#fb7185', '#a855f7'],
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if canvas is not available in test/iframe
  }
}
