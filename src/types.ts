export type TabType = 'home' | 'habit' | 'review' | 'days' | 'hole';

export type MoodType =
  | 'happy'
  | 'calm'
  | 'grateful'
  | 'inspired'
  | 'hopeful'
  | 'relieved'
  | 'tired'
  | 'sad'
  | 'anxious'
  | 'confused'
  | 'lonely'
  | 'angry';

export interface MoodMeta {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
  lightBg: string;
  darkBg: string;
  textColor: string;
}

export type HabitType = 'check' | 'count' | 'value';

export interface Habit {
  id: string;
  name: string;
  icon?: string;
  type: HabitType;
  unit?: string;
  targetCount?: number;
  records: Record<string, number>; // "YYYY-MM-DD" -> number (1 for check, count or value)
  createdAt?: string;
}

export type DayType = 'countdown' | 'accum';

export interface DayEvent {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  type: DayType;
  repeatYear: boolean;
  tag?: string;
  isPinned?: boolean;
  pinnedAt?: string;
  createdAt?: string;
}

export interface TreeHoleItem {
  id: string;
  text: string;
  mood: MoodType;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  tags?: string[];
}

export interface MemoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// 心理学复盘模型数据结构 (Psychological Reflection Models)
// ----------------------------------------------------

export type ReviewPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * 日复盘 - 基于积极心理学 (Seligman) 与 Gibbs 反思循环
 */
export interface DailyReview {
  id: string;
  date: string; // "YYYY-MM-DD"
  // 1. Seligman: Three Good Things (三件好事)
  threeGoodThings: [string, string, string];
  // 2. Gibbs 反思循环: 领悟与下一步行动
  description?: string; // 今日关键事实
  feelings?: string; // 当时的情绪与内省
  evaluation?: string; // 哪些做得好，哪些需要调整
  actionPlan?: string; // 明日最小微调行动 (One Small Step)
  // 3. 心力充盈度评分 (1-5)
  energyRating: number;
  updatedAt?: string;
}

/**
 * 周复盘 - 基于自我决定理论 (SDT) & Gollwitzer 执行意图 & Csikszentmihalyi 心流
 */
export interface WeeklyReview {
  id: string;
  weekKey: string; // e.g. "2026-W35"
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  
  // 1. Gollwitzer 执行意图 (If-Then 规划)
  obstacle: string; // 本周最大阻碍/下周潜在触发情境 (If ...)
  ifThenStrategy: string; // 预设应对策略 (Then I will ...)
  
  // 2. 自我决定论 (SDT) 基本心理需求评分 (1-10)
  autonomyScore: number; // 自主感: 是否掌控自身选择
  competenceScore: number; // 胜任感: 效能与成长收获
  relatednessScore: number; // 归属感: 人际温存与联结
  
  // 3. 心流与精力账本 (Flow & Energy Audit)
  peakFlowMoment: string; // 本周最高光心流时刻
  energyDrainer: string; // 本周能量黑洞/内耗消耗
  
  // 4. 周核心认知洞察
  keyTakeaway: string;
  
  updatedAt?: string;
}

/**
 * 月复盘 - 基于 Carol Dweck 成长型思维 & 生命平衡之轮 (Wheel of Life)
 */
export interface MonthlyReview {
  id: string;
  monthStr: string; // e.g. "2026-08"
  
  // 1. 生命平衡之轮 8大维度评分 (1-10)
  wheelScores: {
    growth: number; // 个人成长
    career: number; // 事业学业
    health: number; // 身心健康
    relationships: number; // 人际亲密
    finance: number; // 财务资产
    leisure: number; // 休闲愉悦
    mindset: number; // 情绪心态
    spirit: number; // 精神充盈
  };
  
  // 2. Carol Dweck 成长型思维重塑 (Growth Mindset Reframing)
  setbackOrFailure: string; // 本月最大挫折/未达成之事
  growthLesson: string; // 认知重塑: 这件事教会了我什么？
  cognitiveBreakthrough: string; // 本月最关键的思维破局点
  
  // 3. Locke & Latham 下月北极星目标 (North Star Goal)
  northStarGoal: string;
  
  updatedAt?: string;
}

export interface AppData {
  habits: Habit[];
  days: DayEvent[];
  treeholes: TreeHoleItem[];
  memos?: MemoItem[];
  dailyReviews?: DailyReview[];
  weeklyReviews?: WeeklyReview[];
  monthlyReviews?: MonthlyReview[];
}

export type ThemeMode = 'system' | 'light' | 'dark';

