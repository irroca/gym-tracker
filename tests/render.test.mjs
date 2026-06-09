import test from 'node:test';
import assert from 'node:assert/strict';

import { GYM_DATA } from '../web/data.js';
import {
  renderHeatmap,
  renderMealBlock,
  renderPlanView,
  renderProfileView,
  renderTimeline,
  renderTodayView,
  renderTrainingBlock,
} from '../web/modules/render.mjs';

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
  };
}

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const sampleDay = {
  dayName: '周二',
  workoutType: '上肢推（胸/肩/三头）+ 晚有氧',
  warmup: '椭圆机 4min + 肩袖激活',
  meals: [
    { id: 'm1', time: '7:00', title: '晨起', desc: '黑咖啡 200ml' },
    { id: 'm2', time: '8:00', title: '早训', desc: '上肢推训练' },
    { id: 'm3', time: '12:00', title: '食堂午餐', desc: '主食1拳量 + 蛋白1掌量' },
    { id: 'm4', time: '21:00', title: '晚训', desc: '稳态有氧 30min' },
  ],
  workouts: [
    { id: 'w1', name: '杠铃卧推', sets: '4×6–8', remark: '主项' },
    { id: 'w2', name: '哑铃推举', sets: '3×8–10', remark: '肩部' },
    { id: 'w3', name: '【晚训】稳态有氧', sets: '30min', remark: '心率125-135' },
  ],
};

test('renderMealBlock reflects task content and completion state', () => {
  const item = { id: 'm1', time: '7:00', title: '晨起', desc: '黑咖啡 200ml' };

  const pending = renderMealBlock(item, '2026-5-25', createStorage());
  assert.match(pending, /data-task-id="m1"/);
  assert.match(pending, /晨起/);
  assert.match(pending, /黑咖啡 200ml/);
  assert.match(pending, /7:00/);
  assert.doesNotMatch(pending, /timeline-task completed/);

  const done = renderMealBlock(item, '2026-5-25', createStorage({ 'gym_2026-5-25_m1': 'true' }));
  assert.match(done, /timeline-task completed/);
});

test('renderTrainingBlock shows morning warmup, action count, and sub-task state', () => {
  const morningItem = { id: 'm2', time: '8:00', title: '早训', desc: '上肢推训练' };
  const morningWorkouts = sampleDay.workouts.slice(0, 2);
  const storage = createStorage({ 'gym_2026-5-25_w1': 'true' });

  const html = renderTrainingBlock(morningItem, morningWorkouts, sampleDay.warmup, '2026-5-25', storage);
  assert.match(html, /data-training-id="m2"/);
  assert.match(html, /2 个动作/);
  assert.match(html, /warmup-note/);
  assert.match(html, /椭圆机 4min/);
  assert.match(html, /data-workout-id="w1"/);
  // 已完成的 w1 带 completed 类，未完成的 w2 不带
  assert.match(html, /class="sub-task completed" data-workout-id="w1"/);
  assert.match(html, /class="sub-task " data-workout-id="w2"/);
});

test('renderTrainingBlock hides warmup for evening sessions and honors expanded ids', () => {
  const eveningItem = { id: 'm4', time: '21:00', title: '晚训', desc: '稳态有氧 30min' };
  const eveningWorkouts = [sampleDay.workouts[2]];

  const collapsed = renderTrainingBlock(eveningItem, eveningWorkouts, sampleDay.warmup, '2026-5-25', createStorage());
  assert.doesNotMatch(collapsed, /warmup-note/);
  assert.doesNotMatch(collapsed, /timeline-training[^"]*expanded/);

  const expanded = renderTrainingBlock(eveningItem, eveningWorkouts, sampleDay.warmup, '2026-5-25', createStorage(), new Set(['m4']));
  assert.match(expanded, /timeline-training[^"]*expanded/);
});

test('renderTimeline routes training meals to training blocks and others to meal blocks', () => {
  const html = renderTimeline(sampleDay, '2026-5-25', createStorage());
  // 两个训练块（早训 + 晚训）
  assert.equal(countOccurrences(html, 'data-training-id='), 2);
  // 两个普通餐次（晨起 + 午餐）
  assert.equal(countOccurrences(html, 'data-task-id='), 2);
  // 晚训块只挂载晚训动作
  assert.match(html, /【晚训】稳态有氧/);
});

test('renderTodayView builds header + summary with debug awareness', () => {
  const appDate = new Date('2026-05-26T09:00:00+08:00'); // 周二
  const view = renderTodayView(sampleDay, '2026-5-26', createStorage(), { appDate, debug: true });

  assert.equal(view.title, '今日');
  assert.match(view.subtitle, /^调试日期 · /);
  assert.match(view.html, /summary-pill-debug/);
  assert.match(view.html, /上肢推（胸\/肩\/三头）\+ 晚有氧/);
  assert.match(view.html, /0 \/ 5 项完成/); // 2 个非训练餐次 + 3 个动作（含晚训动作）
});

test('renderTodayView shows completion state when every item is checked', () => {
  const appDate = new Date('2026-05-26T09:00:00+08:00');
  const seed = {};
  sampleDay.meals.forEach((meal) => { seed[`gym_2026-5-26_${meal.id}`] = 'true'; });
  sampleDay.workouts.forEach((workout) => { seed[`gym_2026-5-26_${workout.id}`] = 'true'; });

  const view = renderTodayView(sampleDay, '2026-5-26', createStorage(seed), { appDate });
  assert.match(view.html, /summary-card--complete/);
  assert.match(view.html, /summary-pill-complete/);
  assert.match(view.html, /今日计划已全部完成/);
  assert.doesNotMatch(view.html, /项完成，继续保持节奏/);
});

test('renderPlanView lists weekly overview, supplements, and rules from data', () => {
  const view = renderPlanView(GYM_DATA);
  assert.equal(view.title, '总计划');
  assert.match(view.html, /计划同步说明/);

  GYM_DATA.weeklyOverview.forEach((item) => {
    assert.ok(view.html.includes(item.day), `缺少 ${item.day}`);
    assert.ok(view.html.includes(item.focus), `缺少焦点 ${item.focus}`);
  });
  GYM_DATA.supplements.forEach((item) => {
    assert.ok(view.html.includes(item.name), `缺少补剂 ${item.name}`);
  });
  GYM_DATA.rules.forEach((rule) => {
    assert.ok(view.html.includes(rule), `缺少规则 ${rule}`);
  });
});

test('renderHeatmap renders a 12-week grid, hides future days, and keeps legend', () => {
  const today = new Date('2026-05-27T09:00:00+08:00'); // 周三
  const html = renderHeatmap(GYM_DATA, createStorage(), today);

  assert.equal(countOccurrences(html, 'heatmap-col'), 12);
  assert.equal(countOccurrences(html, 'heatmap-cell'), 84);
  // 本周三之后到周六共有 3 天属于未来，应被隐藏
  assert.equal(countOccurrences(html, 'heatmap-cell hidden'), 3);
  assert.match(html, /heatmap-legend/);
  assert.match(html, /heat-0/);
});

test('renderHeatmap colors completed days by progress ratio', () => {
  const today = new Date('2026-05-27T09:00:00+08:00');
  // 周日(2026-05-24)所有项目打卡 -> 完全完成 -> heat-4
  const sunday = GYM_DATA.dailyRoutines['0'];
  const seed = {};
  sunday.meals.forEach((meal) => { seed[`gym_2026-5-24_${meal.id}`] = 'true'; });
  sunday.workouts.forEach((workout) => { seed[`gym_2026-5-24_${workout.id}`] = 'true'; });

  const html = renderHeatmap(GYM_DATA, createStorage(seed), today);
  assert.match(html, /heat-4[^>]*title="2026-5-24"/);
});

test('renderProfileView includes metrics, heatmap, and settings controls', () => {
  const view = renderProfileView(GYM_DATA, createStorage(), new Date('2026-05-27T09:00:00+08:00'));
  assert.equal(view.title, '我的');
  assert.match(view.html, /heatmap-grid/);
  assert.match(view.html, new RegExp(GYM_DATA.profile.bmr));
  assert.match(view.html, /id="day-override"/);
  assert.match(view.html, /id="clear-cache"/);
});
