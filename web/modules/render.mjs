// 渲染层（纯函数）：输入数据 + storage，输出 HTML 字符串。
// 不接触 DOM、不绑定事件，便于在 Node 中做单元测试。
// app.js 负责把这些字符串写入 DOM 并绑定交互。
import { formatChineseHeaderDate, formatHeatmapMonth, formatShortWeekday, toDateKey } from './date.mjs';
import { isTaskCompleted } from './storage.mjs';
import {
  computeDayProgress,
  extractWorkoutGroups,
  getDailyHighlights,
  getHeatLevel,
  getTrainingGroupStatus,
  getVisualContext,
  isTrainingMeal,
} from './ui.mjs';

export function renderMealBlock(item, dateKey, storage) {
  const completed = isTaskCompleted(storage, dateKey, item.id);

  return `
    <button type="button" class="timeline-item timeline-task ${completed ? 'completed' : ''}" data-task-id="${item.id}">
      <div class="timeline-rail">
        <span class="custom-checkbox"><i data-lucide="check"></i></span>
      </div>
      <div class="task-surface task-surface-meal">
        <div class="task-head">
          <div>
            <div class="task-title">${item.title}</div>
            <p class="task-desc">${item.desc}</p>
          </div>
          <div class="task-meta-stack"><span class="time-chip">${item.time}</span><span class="task-meta-inline">轻量执行</span></div>
        </div>
      </div>
    </button>
  `;
}

export function renderTrainingBlock(item, workouts, warmup, dateKey, storage, expandedIds = new Set()) {
  const statusClass = getTrainingGroupStatus(workouts, storage, dateKey);
  const expandedClass = expandedIds.has(String(item.id)) ? 'expanded' : '';
  const warmupHtml = (!item.title.includes('晚训') && warmup !== '无')
    ? `<div class="warmup-note"><span class="warmup-label">热身</span><span>${warmup}</span></div>`
    : '';

  return `
    <section class="timeline-item timeline-training ${statusClass} ${expandedClass}" id="block-${item.id}">
      <div class="timeline-rail">
        <span class="training-icon"><i data-lucide="dumbbell"></i></span>
      </div>
      <div class="task-surface task-surface-training"><div class="training-sheen"></div>
        <button type="button" class="training-toggle" data-training-id="${item.id}">
          <div class="task-head task-head-training">
            <div>
              <div class="task-title">${item.title}</div>
              <p class="task-desc">${item.desc}</p>
            </div>
            <div class="training-side">
              <span class="time-chip">${item.time}</span>
              <span class="meta-chip">${workouts.length} 个动作</span>
              <i data-lucide="chevron-down" class="chevron-icon"></i>
            </div>
          </div>
        </button>
        <div class="training-panel">
          ${warmupHtml}
          <div class="sub-task-list">
            ${workouts.map((workout) => {
              const completed = isTaskCompleted(storage, dateKey, workout.id);
              return `
                <button type="button" class="sub-task ${completed ? 'completed' : ''}" data-workout-id="${workout.id}">
                  <span class="custom-checkbox"><i data-lucide="check"></i></span>
                  <span class="sub-task-content">
                    <span class="sub-task-row">
                      <span class="sub-task-title">${workout.name}</span>
                      <span class="badge">${workout.sets}</span>
                    </span>
                    <span class="sub-task-meta">${workout.remark}</span>
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderTimeline(dayData, dateKey, storage, expandedIds = new Set()) {
  const workoutGroups = extractWorkoutGroups(dayData.workouts);

  return dayData.meals.map((item) => {
    if (isTrainingMeal(item)) {
      const isEvening = item.title.includes('晚训');
      const workouts = isEvening ? workoutGroups.evening : workoutGroups.morning;
      return renderTrainingBlock(item, workouts, dayData.warmup, dateKey, storage, expandedIds);
    }
    return renderMealBlock(item, dateKey, storage);
  }).join('');
}

export function renderTodayView(dayData, dateKey, storage, { appDate = new Date(), debug = false, expandedIds = new Set() } = {}) {
  const progress = computeDayProgress(dayData, storage, dateKey);
  const highlights = getDailyHighlights(dayData);
  const visual = getVisualContext(dayData);
  const timelineHtml = renderTimeline(dayData, dateKey, storage, expandedIds);
  const isComplete = progress.totalItems > 0 && progress.progressPercent === 100;
  const summaryCopy = isComplete
    ? '今日计划已全部完成，记得补够蛋白、睡满 7 小时，让训练真正落地。'
    : `${progress.completedItems} / ${progress.totalItems} 项完成，继续保持节奏。`;

  const html = `
    <section class="summary-card summary-card--${visual.tone}${isComplete ? ' summary-card--complete' : ''}">
      <div class="summary-backdrop"></div>
      <div class="summary-gridline"></div>
      <div class="summary-row">
        <div class="summary-copyblock">
          <div class="eyebrow-row">
            <span class="summary-pill">${dayData.dayName}</span>
            <span class="summary-pill summary-pill-energy">${visual.badge}</span>
            ${isComplete ? '<span class="summary-pill summary-pill-complete">今日达成</span>' : ''}
            ${debug ? '<span class="summary-pill summary-pill-debug">调试模式</span>' : ''}
          </div>
          <div class="summary-kicker-row">
            <p class="summary-label">今日训练主题</p>
            <span class="summary-energy">${visual.energy}</span>
          </div>
          <h2 class="summary-title">${dayData.workoutType}</h2>
          <p class="summary-copy">${summaryCopy}</p>
          <div class="summary-stats-bar">
            <div class="summary-stat">
              <span class="summary-stat-label">完成率</span>
              <strong>${progress.progressPercent}%</strong>
            </div>
            <div class="summary-stat">
              <span class="summary-stat-label">待完成</span>
              <strong>${Math.max(progress.totalItems - progress.completedItems, 0)} 项</strong>
            </div>
          </div>
        </div>
        <div class="summary-progress-wrap">
          <div class="summary-progress-halo"></div>
          <div class="circular-progress" style="--progress:${progress.progressPercent}%">
            <span class="progress-value">${progress.progressPercent}%</span>
          </div>
        </div>
      </div>
      <div class="highlight-list">
        ${highlights.map((item, index) => `<div class="highlight-chip highlight-chip--${index + 1}"><i data-lucide="sparkles"></i><span>${item}</span></div>`).join('')}
      </div>
    </section>

    <div class="section-title section-title-inline">
      <span>今日安排</span>
      <span class="section-meta">按时间顺序执行训练与饮食</span>
    </div>

    <div class="timeline-container">
      ${timelineHtml}
    </div>
  `;

  return {
    title: '今日',
    subtitle: formatChineseHeaderDate(appDate, debug),
    html,
  };
}

export function renderPlanView(gymData) {
  const html = `
    <section class="info-banner">
      <i data-lucide="file-text"></i>
      <div>
        <h3>计划同步说明</h3>
        <p>训练与饮食请以 <code>docs/训练与饮食计划.md</code> 为主；网页数据需要手动同步，避免两边内容漂移。</p>
      </div>
    </section>

    <div class="section-title section-title-inline">
      <span>每周安排</span>
      <span class="section-meta">固定节奏，按天执行</span>
    </div>
    <section class="overview-grid">
      ${gymData.weeklyOverview.map((item) => `
        <article class="overview-card">
          <div class="overview-head">
            <span class="overview-day">${item.day}</span>
            <span class="overview-focus">${item.focus}</span>
          </div>
          <div class="overview-line"><span>早训</span><strong>${item.morning}</strong></div>
          <div class="overview-line overview-line-muted"><span>晚间</span><strong>${item.evening}</strong></div>
        </article>
      `).join('')}
    </section>

    <div class="section-title section-title-inline">
      <span>补剂节奏</span>
      <span class="section-meta">按固定时点补充</span>
    </div>
    <section class="content-card stack-list">
      ${gymData.supplements.map((item) => `
        <article class="stack-item">
          <div>
            <div class="stack-title">${item.name}</div>
            <p class="stack-desc">${item.time}</p>
          </div>
          <span class="badge">${item.dose}</span>
        </article>
      `).join('')}
    </section>

    <div class="section-title section-title-inline">
      <span>执行硬规则</span>
      <span class="section-meta">训练安全与恢复优先级</span>
    </div>
    <section class="content-card stack-list">
      ${gymData.rules.map((rule) => `
        <article class="rule-item">
          <i data-lucide="shield-alert"></i>
          <span>${rule}</span>
        </article>
      `).join('')}
    </section>
  `;

  return {
    title: '总计划',
    subtitle: '文档为主，网页负责展示与打卡',
    html,
  };
}

export function renderHeatmap(gymData, storage, today = new Date()) {
  const lastDayOfGrid = new Date(today);
  lastDayOfGrid.setDate(today.getDate() + (6 - today.getDay()));

  const firstDayOfGrid = new Date(lastDayOfGrid);
  firstDayOfGrid.setDate(lastDayOfGrid.getDate() - 83);

  const gridDays = [];
  for (let i = 0; i < 84; i += 1) {
    const date = new Date(firstDayOfGrid);
    date.setDate(firstDayOfGrid.getDate() + i);
    gridDays.push(date);
  }

  let monthsHtml = '';
  let currentMonth = -1;
  let colsInMonth = 0;
  let columnsHtml = '';

  for (let col = 0; col < 12; col += 1) {
    const firstDayOfCol = gridDays[col * 7];
    const monthIndex = firstDayOfCol.getMonth();

    if (monthIndex !== currentMonth) {
      if (currentMonth !== -1) {
        monthsHtml += `<div class="month-label" style="--month-columns:${colsInMonth}">${formatHeatmapMonth(new Date(2000, currentMonth, 1))}</div>`;
      }
      currentMonth = monthIndex;
      colsInMonth = 1;
    } else {
      colsInMonth += 1;
    }

    columnsHtml += '<div class="heatmap-col">';
    for (let row = 0; row < 7; row += 1) {
      const index = col * 7 + row;
      const dateObj = gridDays[index];
      if (dateObj > today) {
        columnsHtml += '<div class="heatmap-cell hidden"></div>';
        continue;
      }

      const dateKey = toDateKey(dateObj);
      const dayData = gymData.dailyRoutines[String(dateObj.getDay())];
      const heatLevel = getHeatLevel(dayData, storage, dateKey);
      columnsHtml += `<div class="heatmap-cell heat-${heatLevel}" title="${dateKey}"></div>`;
    }
    columnsHtml += '</div>';
  }

  if (currentMonth !== -1) {
    monthsHtml += `<div class="month-label" style="--month-columns:${colsInMonth}">${formatHeatmapMonth(new Date(2000, currentMonth, 1))}</div>`;
  }

  const weekdays = [0, 1, 2, 3, 4, 5, 6];
  return `
    <div class="heatmap-wrapper">
      <div class="heatmap-weekdays">
        ${weekdays.map((dayIndex) => `<div class="weekday-label ${dayIndex % 2 === 0 ? 'weekday-label-muted' : ''}">${formatShortWeekday(dayIndex)}</div>`).join('')}
      </div>
      <div class="heatmap-scroll-container" id="heatmap-scroll">
        <div class="heatmap-months">${monthsHtml}</div>
        <div class="heatmap-grid">${columnsHtml}</div>
      </div>
    </div>
    <div class="heatmap-legend">
      <span>少</span>
      <div class="legend-item heat-0"></div>
      <div class="legend-item heat-1"></div>
      <div class="legend-item heat-2"></div>
      <div class="legend-item heat-3"></div>
      <div class="legend-item heat-4"></div>
      <span>多</span>
    </div>
  `;
}

export function renderProfileView(gymData, storage, today = new Date()) {
  const profile = gymData.profile;
  const html = `
    <div class="section-title section-title-inline">
      <span>训练热力图</span>
      <span class="section-meta">最近 12 周完成度</span>
    </div>
    <section class="content-card heatmap-card">
      ${renderHeatmap(gymData, storage, today)}
    </section>

    <div class="section-title section-title-inline">
      <span>身体指标</span>
      <span class="section-meta">当前基础数据</span>
    </div>
    <section class="content-card stats-grid">
      <article class="metric-card">
        <span class="metric-label">身高 / 体重</span>
        <strong>${profile.height} / ${profile.weight}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">体脂率</span>
        <strong>${profile.bodyFat} → ${profile.targetBodyFat}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">基础代谢</span>
        <strong>${profile.bmr}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">目标体重</span>
        <strong>${profile.targetWeight}</strong>
      </article>
    </section>

    <details class="settings-panel">
      <summary class="settings-summary">
        <div>
          <span class="settings-title">高级设置</span>
          <p class="settings-copy">调试日期与清理本地打卡，仅在需要时使用</p>
        </div>
        <i data-lucide="chevron-down"></i>
      </summary>
      <div class="settings-body">
        <label class="field-label" for="day-override">调试日期覆盖（仅调试用）</label>
        <select id="day-override" class="select-override">
          <option value="none">自动（今天）</option>
          <option value="1">周一</option>
          <option value="2">周二</option>
          <option value="3">周三</option>
          <option value="4">周四</option>
          <option value="5">周五</option>
          <option value="6">周六</option>
          <option value="0">周日</option>
        </select>
        <p class="field-help">开启后，今日页标题和任务内容都会切换到对应日期，便于检查各天排版与文案。</p>

        <button id="clear-cache" type="button" class="btn-danger">清理本地打卡进度</button>
      </div>
    </details>
  `;

  return {
    title: '我的',
    subtitle: '查看打卡趋势与高级设置',
    html,
  };
}
