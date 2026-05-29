import { GYM_DATA } from './data.js';
import { formatChineseHeaderDate, formatHeatmapMonth, formatShortWeekday, toDateKey } from './modules/date.mjs';
import { createAppState } from './modules/state.mjs';
import { clearGymStorage, isTaskCompleted, setTaskCompleted } from './modules/storage.mjs';
import {
  computeDayProgress,
  extractWorkoutGroups,
  getDailyHighlights,
  getHeatLevel,
  getTrainingGroupStatus,
  getVisualContext,
  isTrainingMeal,
} from './modules/ui.mjs';

const state = createAppState(window.localStorage);

const dom = {
  headerTitle: document.getElementById('header-title'),
  headerDate: document.getElementById('header-date'),
  mainContent: document.getElementById('main-content'),
  navItems: Array.from(document.querySelectorAll('.nav-item')),
};

function init() {
  setupNavigation();
  renderCurrentTab();
}

function setupNavigation() {
  dom.navItems.forEach((item) => {
    item.addEventListener('click', () => {
      state.setCurrentTab(item.dataset.tab);
      syncActiveNav();
      renderCurrentTab();
    });
  });
  syncActiveNav();
}

function syncActiveNav() {
  const currentTab = state.getCurrentTab();
  dom.navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.tab === currentTab);
  });
}

function renderCurrentTab() {
  const currentTab = state.getCurrentTab();
  dom.mainContent.innerHTML = '';
  dom.mainContent.className = 'main-scrollable tab-content';

  if (currentTab === 'today') {
    renderTodayTab();
  } else if (currentTab === 'plan') {
    renderPlanTab();
  } else {
    renderProfileTab();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderTodayTab() {
  const appDate = state.getAppDate();
  const dateKey = state.getDateKey(appDate);
  const todayData = GYM_DATA.dailyRoutines[String(appDate.getDay())];
  const workoutGroups = extractWorkoutGroups(todayData.workouts);
  const progress = computeDayProgress(todayData, window.localStorage, dateKey);
  const highlights = getDailyHighlights(todayData);
  const visual = getVisualContext(todayData);

  dom.headerTitle.textContent = '今日';
  dom.headerDate.textContent = formatChineseHeaderDate(appDate, state.isDebugMode());

  const timelineHtml = todayData.meals.map((item) => {
    if (isTrainingMeal(item)) {
      const isEvening = item.title.includes('晚训');
      const workouts = isEvening ? workoutGroups.evening : workoutGroups.morning;
      return renderTrainingBlock(item, workouts, todayData.warmup, dateKey);
    }
    return renderMealBlock(item, dateKey);
  }).join('');

  dom.mainContent.innerHTML = `
    <section class="summary-card summary-card--${visual.tone}">
      <div class="summary-backdrop"></div>
      <div class="summary-gridline"></div>
      <div class="summary-row">
        <div class="summary-copyblock">
          <div class="eyebrow-row">
            <span class="summary-pill">${todayData.dayName}</span>
            <span class="summary-pill summary-pill-energy">${visual.badge}</span>
            ${state.isDebugMode() ? '<span class="summary-pill summary-pill-debug">调试模式</span>' : ''}
          </div>
          <div class="summary-kicker-row">
            <p class="summary-label">今日训练主题</p>
            <span class="summary-energy">${visual.energy}</span>
          </div>
          <h2 class="summary-title">${todayData.workoutType}</h2>
          <p class="summary-copy">${progress.completedItems} / ${progress.totalItems} 项完成，继续保持节奏。</p>
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

  bindTodayInteractions(dateKey);
}

function renderMealBlock(item, dateKey) {
  const completed = isTaskCompleted(window.localStorage, dateKey, item.id);

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

function renderTrainingBlock(item, workouts, warmup, dateKey) {
  const statusClass = getTrainingGroupStatus(workouts, window.localStorage, dateKey);
  const warmupHtml = (!item.title.includes('晚训') && warmup !== '无')
    ? `<div class="warmup-note"><span class="warmup-label">热身</span><span>${warmup}</span></div>`
    : '';

  return `
    <section class="timeline-item timeline-training ${statusClass}" id="block-${item.id}">
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
              const completed = isTaskCompleted(window.localStorage, dateKey, workout.id);
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

function bindTodayInteractions(dateKey) {
  dom.mainContent.querySelectorAll('[data-task-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const taskId = button.dataset.taskId;
      const nextState = !isTaskCompleted(window.localStorage, dateKey, taskId);
      setTaskCompleted(window.localStorage, dateKey, taskId, nextState);
      renderCurrentTab();
    });
  });

  dom.mainContent.querySelectorAll('[data-training-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const block = document.getElementById(`block-${button.dataset.trainingId}`);
      if (block) block.classList.toggle('expanded');
    });
  });

  dom.mainContent.querySelectorAll('[data-workout-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const taskId = button.dataset.workoutId;
      const nextState = !isTaskCompleted(window.localStorage, dateKey, taskId);
      setTaskCompleted(window.localStorage, dateKey, taskId, nextState);
      renderCurrentTab();
    });
  });
}

function renderPlanTab() {
  dom.headerTitle.textContent = '总计划';
  dom.headerDate.textContent = '文档为主，网页负责展示与打卡';

  dom.mainContent.innerHTML = `
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
      ${GYM_DATA.weeklyOverview.map((item) => `
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
      ${GYM_DATA.supplements.map((item) => `
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
      ${GYM_DATA.rules.map((rule) => `
        <article class="rule-item">
          <i data-lucide="shield-alert"></i>
          <span>${rule}</span>
        </article>
      `).join('')}
    </section>
  `;
}

function renderProfileTab() {
  dom.headerTitle.textContent = '我的';
  dom.headerDate.textContent = '查看打卡趋势与高级设置';

  const profile = GYM_DATA.profile;
  dom.mainContent.innerHTML = `
    <div class="section-title section-title-inline">
      <span>训练热力图</span>
      <span class="section-meta">最近 12 周完成度</span>
    </div>
    <section class="content-card heatmap-card">
      ${generateHeatmapHTML()}
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

  bindProfileInteractions();
}

function bindProfileInteractions() {
  const overrideSelect = document.getElementById('day-override');
  if (overrideSelect) {
    overrideSelect.value = state.getDayOverride() ?? 'none';
    overrideSelect.addEventListener('change', (event) => {
      state.setDayOverride(event.target.value);
      renderCurrentTab();
    });
  }

  const clearButton = document.getElementById('clear-cache');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const confirmed = window.confirm('确认清理当前设备上的所有本地打卡记录吗？此操作不会影响文档计划内容。');
      if (!confirmed) return;
      clearGymStorage(window.localStorage);
      window.alert('本地打卡进度已清理。');
      renderCurrentTab();
    });
  }

  window.setTimeout(() => {
    const scrollContainer = document.getElementById('heatmap-scroll');
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }
  }, 50);
}

function generateHeatmapHTML() {
  const today = new Date();
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
      const dayData = GYM_DATA.dailyRoutines[String(dateObj.getDay())];
      const heatLevel = getHeatLevel(dayData, window.localStorage, dateKey);
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

window.addEventListener('DOMContentLoaded', init);
