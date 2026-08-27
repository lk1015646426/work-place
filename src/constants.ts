import { MoodMeta, MoodType, AppData } from './types';

export const MOOD_DEFINITIONS: Record<MoodType, MoodMeta> = {
  happy: {
    id: 'happy',
    label: '欢欣雀跃',
    emoji: '✨',
    color: '#d97706', // amber-600
    lightBg: '#fef3c7',
    darkBg: '#78350f33',
    textColor: '#b45309',
  },
  calm: {
    id: 'calm',
    label: '松弛宁静',
    emoji: '🌿',
    color: '#059669', // emerald-600
    lightBg: '#d1fae5',
    darkBg: '#064e3b33',
    textColor: '#047857',
  },
  grateful: {
    id: 'grateful',
    label: '感恩温存',
    emoji: '🌸',
    color: '#e11d48', // rose-600
    lightBg: '#ffe4e6',
    darkBg: '#88133733',
    textColor: '#be123c',
  },
  inspired: {
    id: 'inspired',
    label: '充实专注',
    emoji: '⚡',
    color: '#4f46e5', // indigo-600
    lightBg: '#e0e7ff',
    darkBg: '#312e8133',
    textColor: '#4338ca',
  },
  hopeful: {
    id: 'hopeful',
    label: '憧憬期待',
    emoji: '🌟',
    color: '#0d9488', // teal-600
    lightBg: '#ccfbf1',
    darkBg: '#134e4a33',
    textColor: '#0f766e',
  },
  relieved: {
    id: 'relieved',
    label: '释怀治愈',
    emoji: '🕊️',
    color: '#0891b2', // cyan-600
    lightBg: '#cffafe',
    darkBg: '#164e6333',
    textColor: '#0e7490',
  },
  tired: {
    id: 'tired',
    label: '疲惫乏力',
    emoji: '☕',
    color: '#64748b', // slate-500
    lightBg: '#f1f5f9',
    darkBg: '#33415533',
    textColor: '#475569',
  },
  sad: {
    id: 'sad',
    label: '低落伤感',
    emoji: '🌧️',
    color: '#0284c7', // sky-600
    lightBg: '#e0f2fe',
    darkBg: '#0c4a6e33',
    textColor: '#0369a1',
  },
  anxious: {
    id: 'anxious',
    label: '紧绷焦虑',
    emoji: '🌀',
    color: '#7c3aed', // violet-600
    lightBg: '#ede9fe',
    darkBg: '#4c1d9533',
    textColor: '#6d28d9',
  },
  confused: {
    id: 'confused',
    label: '迷茫困惑',
    emoji: '🌫️',
    color: '#71717a', // zinc-500
    lightBg: '#f4f4f5',
    darkBg: '#3f3f4633',
    textColor: '#52525b',
  },
  lonely: {
    id: 'lonely',
    label: '孤单怅惘',
    emoji: '🌙',
    color: '#9333ea', // purple-600
    lightBg: '#f3e8ff',
    darkBg: '#581c8733',
    textColor: '#7e22ce',
  },
  angry: {
    id: 'angry',
    label: '烦躁郁闷',
    emoji: '🔥',
    color: '#dc2626', // red-600
    lightBg: '#fee2e2',
    darkBg: '#7f1d1d33',
    textColor: '#b91c1c',
  },
};

export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getCurrentWeekKey(): string {
  const now = new Date();
  const week = getWeekNumber(now);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getWeekDateRange(dateObj: Date = new Date()): { startDate: string; endDate: string } {
  const d = new Date(dateObj);
  const day = d.getDay();
  // Monday is start of week
  const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMon));
  const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));

  const format = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dayS = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayS}`;
  };

  return {
    startDate: format(monday),
    endDate: format(sunday),
  };
}

export function getCurrentTimeStr(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getOffsetDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(dateStrA: string, dateStrB: string): number {
  const da = new Date(dateStrA + 'T00:00:00');
  const db = new Date(dateStrB + 'T00:00:00');
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 0;
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function calculateDayEventMeta(day: {
  date: string;
  type: 'countdown' | 'accum';
  repeatYear: boolean;
  createdAt?: string;
}) {
  const today = getTodayStr();
  let target = day.date;
  let dispDate = day.date;

  if (day.type === 'accum') {
    const gone = daysBetween(day.date, today);
    // Milestone intervals: 100, 365, 500, 1000, 3650 days
    const milestoneSteps = [100, 365, 500, 1000, 2000, 3650, 5000, 10000];
    const nextMilestone = milestoneSteps.find((s) => s > gone) || (Math.ceil((gone + 1) / 1000) * 1000);
    const prevMilestone = milestoneSteps.slice().reverse().find((s) => s <= gone) || 0;
    const progressSpan = nextMilestone - prevMilestone;
    const accumProgress = progressSpan > 0 ? Math.min(100, Math.max(0, Math.round(((gone - prevMilestone) / progressSpan) * 100))) : 100;

    return {
      daysCount: Math.max(0, gone),
      isToday: gone === 0,
      dispDate,
      isCountdown: false,
      progress: accumProgress,
      nextMilestone,
    };
  }

  // Countdown
  let cycleStart = day.createdAt || today;

  if (day.repeatYear) {
    const md = day.date.slice(5);
    const y = today.slice(0, 4);
    let cand = `${y}-${md}`;
    if (daysBetween(today, cand) < 0) {
      cand = `${parseInt(y) + 1}-${md}`;
      cycleStart = `${y}-${md}`;
    } else {
      cycleStart = `${parseInt(y) - 1}-${md}`;
    }
    target = cand;
    dispDate = cand;
  }

  const remain = daysBetween(today, target);
  const totalSpan = Math.max(1, daysBetween(cycleStart, target));
  const elapsed = Math.max(0, daysBetween(cycleStart, today));
  // Progress is percentage elapsed towards target date (0% at start -> 100% when arrived)
  let progress = 100;
  if (remain > 0) {
    if (totalSpan > 0 && elapsed >= 0 && elapsed <= totalSpan) {
      progress = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));
    } else {
      // Fallback sensible progression: assume 30, 90, 180, or 365 day frame
      const fallbackSpan = remain <= 30 ? 30 : remain <= 90 ? 90 : remain <= 180 ? 180 : 365;
      progress = Math.min(100, Math.max(0, Math.round(((fallbackSpan - remain) / fallbackSpan) * 100)));
    }
  }

  return {
    daysCount: Math.abs(remain),
    remain,
    isToday: remain === 0,
    isPast: remain < 0,
    dispDate,
    isCountdown: true,
    progress,
    totalSpan,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export const INITIAL_DEMO_DATA: AppData = {
  habits: [
    {
      id: 'h1',
      name: '晨起温水 500ml',
      type: 'count',
      targetCount: 1,
      unit: '杯',
      records: {
        [getTodayStr()]: 1,
        [getOffsetDateStr(-1)]: 1,
        [getOffsetDateStr(-2)]: 1,
        [getOffsetDateStr(-3)]: 1,
      },
    },
    {
      id: 'h2',
      name: '深度阅读 25 分钟',
      type: 'check',
      records: {
        [getTodayStr()]: 1,
        [getOffsetDateStr(-1)]: 1,
        [getOffsetDateStr(-3)]: 1,
      },
    },
    {
      id: 'h3',
      name: '正念冥想 / 呼吸',
      type: 'check',
      records: {
        [getOffsetDateStr(-1)]: 1,
        [getOffsetDateStr(-2)]: 1,
      },
    },
    {
      id: 'h4',
      name: '日常步数',
      type: 'value',
      unit: '步',
      records: {
        [getTodayStr()]: 6480,
        [getOffsetDateStr(-1)]: 8920,
        [getOffsetDateStr(-2)]: 7300,
        [getOffsetDateStr(-3)]: 10200,
      },
    },
  ],
  days: [
    {
      id: 'd1',
      name: '年度重要旅行 · 冰岛极光',
      date: getOffsetDateStr(42),
      type: 'countdown',
      repeatYear: false,
      tag: '旅行',
    },
    {
      id: 'd2',
      name: '妈妈生日',
      date: getOffsetDateStr(88),
      type: 'countdown',
      repeatYear: true,
      tag: '家人',
    },
    {
      id: 'd3',
      name: '开启独立自由职业',
      date: getOffsetDateStr(-320),
      type: 'accum',
      repeatYear: false,
      tag: '事业',
    },
    {
      id: 'd4',
      name: '相遇纪念日',
      date: getOffsetDateStr(-730),
      type: 'accum',
      repeatYear: true,
      tag: '生活',
    },
  ],
  treeholes: [
    {
      id: 'th1',
      text: '今天傍晚走在天桥上，夕阳把整座城市的玻璃幕墙染成了琥珀色。放下手机吹了十分钟的风，心里的焦虑悄悄化开了。',
      mood: 'calm',
      date: getTodayStr(),
      time: '18:45',
      tags: ['日常', '治愈'],
    },
    {
      id: 'th2',
      text: '完成了连续多天攻坚的项目初版，虽然有点累，但看到成果逐渐成形，感到踏实的成就感。',
      mood: 'happy',
      date: getOffsetDateStr(-1),
      time: '21:10',
      tags: ['工作', '突破'],
    },
    {
      id: 'th3',
      text: '昨夜有点失眠，思绪像没关紧的抽屉一样乱。今天学会了放慢节奏，对自己温和一点。',
      mood: 'tired',
      date: getOffsetDateStr(-3),
      time: '23:30',
      tags: ['心绪'],
    },
  ],
  memos: [
    {
      id: 'm1',
      text: '整理本周阅读笔记的思维导图',
      completed: false,
      createdAt: getTodayStr(),
    },
    {
      id: 'm2',
      text: '给阳台绿植浇水换盆',
      completed: true,
      createdAt: getTodayStr(),
    },
    {
      id: 'm3',
      text: '睡前泡脚并少看 20 分钟手机',
      completed: false,
      createdAt: getTodayStr(),
    },
  ],
  dailyReviews: [
    {
      id: 'dr1',
      date: getTodayStr(),
      threeGoodThings: [
        '晨起按计划喝了温水并专注阅读了 25 分钟，开启了清爽的一天',
        '在团队讨论中提出了清晰的模块优化方案，得到了积极认可',
        '傍晚在公园散步偶遇了极美的晚霞，心绪格外宁静',
      ],
      description: '全天完成了核心任务攻坚，保持了节奏感',
      feelings: '午后曾有一小段心浮气躁，但通过 5 分钟深呼吸调整了回来',
      evaluation: '时间块专注度提升明显；夜间还需警惕无意识刷手机',
      actionPlan: '明天上午 9:30 前不开启社交软件，先推进最重要的一件事',
      energyRating: 5,
    },
    {
      id: 'dr2',
      date: getOffsetDateStr(-1),
      threeGoodThings: [
        '顺利排查并解决了一个潜在很久的逻辑漏洞',
        '中午吃到了很鲜美的牛肉汤面，被热腾腾的食物治愈',
        '朋友发来问候，互相分享了近期的阅读书单',
      ],
      description: '集中处理了积压的琐事与日常备忘',
      feelings: '感到充实和脚踏实地',
      evaluation: '效率较高，但喝水量稍显不足',
      actionPlan: '在桌边常备大容量水杯，设定定时起身活动',
      energyRating: 4,
    },
  ],
  weeklyReviews: [
    {
      id: 'wr1',
      weekKey: getCurrentWeekKey(),
      startDate: getWeekDateRange().startDate,
      endDate: getWeekDateRange().endDate,
      obstacle: '容易在多任务并行时产生认知超载和决策疲劳',
      ifThenStrategy: '如果遇到超过 3 项并行的琐事，那么我就先停下 2 分钟，在纸上列出唯一优先级并只做那一项',
      autonomyScore: 9,
      competenceScore: 8,
      relatednessScore: 9,
      peakFlowMoment: '周三下午一口气沉浸式重构完成核心框架，体验到了极致的心流',
      energyDrainer: '周二晚上在低效信息流中消耗了过多心力',
      keyTakeaway: '专注不是做更多的事，而是给最重要的事情腾出最神圣的空间。',
    },
  ],
  monthlyReviews: [
    {
      id: 'mr1',
      monthStr: getCurrentMonthStr(),
      wheelScores: {
        growth: 9,
        career: 8,
        health: 8,
        relationships: 8,
        finance: 7,
        leisure: 8,
        mindset: 9,
        spirit: 8,
      },
      setbackOrFailure: '未能完全坚持每天 23 点前熄灯入睡的目标，偶有拖延到零点后',
      growthLesson: '睡前拖延往往是因为白天缺乏自主时间。通过把“属于自己的治愈时光”提前到傍晚，夜间就不再需要报复性熬夜。',
      cognitiveBreakthrough: '不再追求完美主义的全赢，而是践行“小步快跑与自我宽容”，心理韧性显著增强。',
      northStarGoal: '深度打磨生活节奏感，将专注时间提升到每天 3 小时高质心流。',
    },
  ],
};


export interface DailyQuote {
  hitokoto: string;
  from: string;
  from_who?: string;
}

export const FALLBACK_QUOTES: DailyQuote[] = [
  {
    hitokoto: '万物皆有裂痕，那是光照进来的地方。',
    from: '颂歌',
    from_who: '莱昂纳德·科恩',
  },
  {
    hitokoto: '生活不在别处，当下即是全部。',
    from: '日日是好日',
    from_who: '森下典子',
  },
  {
    hitokoto: '满怀希望，就会所向披靡。',
    from: '百年孤独',
    from_who: '加西亚·马尔克斯',
  },
  {
    hitokoto: '步履不停，生活自会给予回应。',
    from: '步履不停',
    from_who: '是枝裕和',
  },
  {
    hitokoto: '每一个不曾起舞的日子，都是对生命的辜负。',
    from: '查拉图斯特拉如是说',
    from_who: '尼采',
  },
  {
    hitokoto: '吹灭读书灯，一身都是月。',
    from: '续幽梦影',
    from_who: '孙洙',
  },
  {
    hitokoto: '保持热爱，奔赴山海，忠于自己。',
    from: '随笔集',
    from_who: '博尔赫斯',
  },
  {
    hitokoto: '心若自由，无往而非自得。',
    from: '菜根谭',
    from_who: '洪应明',
  },
];

export async function fetchRandomQuote(): Promise<DailyQuote> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&c=h&c=j&encode=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    if (data && data.hitokoto) {
      return {
        hitokoto: data.hitokoto,
        from: data.from || '开源一言',
        from_who: data.from_who || '',
      };
    }
  } catch (e) {
    // silently fallback to offline curated quotes
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}
