import test from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_STORAGE_PREFIX,
  DAY_OVERRIDE_KEY,
  clearGymStorage,
  getTaskKey,
  isTaskCompleted,
  setTaskCompleted,
} from '../web/modules/storage.mjs';
import {
  formatChineseHeaderDate,
  formatHeatmapMonth,
  formatShortWeekday,
  resolveAppDate,
  toDateKey,
} from '../web/modules/date.mjs';
import {
  computeDayProgress,
  extractWorkoutGroups,
  getDailyHighlights,
  getVisualContext,
} from '../web/modules/ui.mjs';

function createStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    dump() {
      return Object.fromEntries(map.entries());
    }
  };
}

const sampleDay = {
  workoutType: '上肢推（胸/肩/三头）+ 晚有氧',
  warmup: '椭圆机 4min + 肩袖激活',
  meals: [
    { id: 'm1', title: '晨起', desc: '黑咖啡 200ml' },
    { id: 'm2', title: '早训', desc: '上肢推训练' },
    { id: 'm3', title: '食堂午餐', desc: '主食1拳量 + 蛋白1掌量' },
    { id: 'm4', title: '晚训', desc: '稳态有氧 30min' }
  ],
  workouts: [
    { id: 'w1', name: '杠铃卧推', sets: '4×6–8', remark: '主项' },
    { id: 'w2', name: '哑铃推举', sets: '3×8–10', remark: '肩部' },
    { id: 'w3', name: '【晚训】稳态有氧', sets: '30min', remark: '心率125-135' }
  ],
  rules: [
    '早训不空腹，7:20 必吃训前加餐',
    '晚训后至少 90min 才能睡觉',
    '晚训严禁大重量深蹲/硬拉'
  ]
};

test('resolveAppDate returns override-matched date instead of real current day', () => {
  const base = new Date('2026-05-29T09:00:00+08:00'); // Friday
  const monday = resolveAppDate(base, '1');
  assert.equal(monday.getDay(), 1);
  assert.equal(toDateKey(monday), '2026-5-25');
});

test('formatChineseHeaderDate uses override date and Chinese labels', () => {
  const date = new Date('2026-05-25T09:00:00+08:00');
  assert.equal(formatChineseHeaderDate(date, true), '调试日期 · 5月25日 星期一');
});

test('heatmap formatters return Chinese month and weekday labels', () => {
  const date = new Date('2026-02-03T09:00:00+08:00');
  assert.equal(formatHeatmapMonth(date), '2月');
  assert.equal(formatShortWeekday(0), '日');
  assert.equal(formatShortWeekday(6), '六');
});

test('storage helpers keep key format compatible and clear all gym_ keys only', () => {
  const storage = createStorage({
    'gym_2026-5-25_m1': 'true',
    'gym_day_override': '2',
    'gym_2031-1-1_w1': 'true',
    'other_app': 'keep'
  });

  assert.equal(APP_STORAGE_PREFIX, 'gym_');
  assert.equal(DAY_OVERRIDE_KEY, 'gym_day_override');
  assert.equal(getTaskKey('2026-5-25', 'm1'), 'gym_2026-5-25_m1');
  assert.equal(isTaskCompleted(storage, '2026-5-25', 'm1'), true);

  setTaskCompleted(storage, '2026-5-25', 'm1', false);
  assert.equal(isTaskCompleted(storage, '2026-5-25', 'm1'), false);

  clearGymStorage(storage);
  assert.deepEqual(storage.dump(), { other_app: 'keep' });
});

test('extractWorkoutGroups splits morning and evening workouts', () => {
  const groups = extractWorkoutGroups(sampleDay.workouts);
  assert.equal(groups.morning.length, 2);
  assert.equal(groups.evening.length, 1);
  assert.equal(groups.evening[0].name, '【晚训】稳态有氧');
});

test('computeDayProgress counts only non-training timeline items plus all workouts', () => {
  const storage = createStorage({
    'gym_2026-5-25_m1': 'true',
    'gym_2026-5-25_m3': 'true',
    'gym_2026-5-25_w1': 'true',
  });
  const result = computeDayProgress(sampleDay, storage, '2026-5-25');
  assert.deepEqual(result, {
    totalItems: 5,
    completedItems: 3,
    progressPercent: 60,
  });
});

test('getDailyHighlights returns compact reminders for today summary', () => {
  const highlights = getDailyHighlights(sampleDay);
  assert.deepEqual(highlights, [
    '早训前记得补充香蕉 + 乳清，避免空腹训练',
    '今天包含晚训，结束后至少预留 90 分钟再睡觉',
    '今日双训日，优先完成早餐恢复和晚间补剂'
  ]);
});


test('getVisualContext distinguishes hybrid training days and recovery days', () => {
  assert.deepEqual(getVisualContext(sampleDay), {
    tone: 'hybrid',
    badge: '双训推进',
    energy: '高输出日',
    accent: 'mint-blue',
  });

  assert.deepEqual(getVisualContext({
    workoutType: '休息',
    workouts: [],
    meals: [{ id: 'm0', title: '早餐', desc: '正常饮食' }],
  }), {
    tone: 'recovery',
    badge: '恢复优先',
    energy: '低压节奏',
    accent: 'slate',
  });
});
