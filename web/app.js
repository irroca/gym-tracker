import { GYM_DATA } from './data.js';
import { createAppState } from './modules/state.mjs';
import { clearGymStorage, isTaskCompleted, setTaskCompleted } from './modules/storage.mjs';
import {
  renderPlanView,
  renderProfileView,
  renderTodayView,
} from './modules/render.mjs';

const state = createAppState(window.localStorage);

const dom = {
  headerTitle: document.getElementById('header-title'),
  headerDate: document.getElementById('header-date'),
  mainContent: document.getElementById('main-content'),
  navItems: Array.from(document.querySelectorAll('.nav-item')),
};

const expandedTrainingBlocks = new Set();

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

function applyView(view) {
  dom.headerTitle.textContent = view.title;
  dom.headerDate.textContent = view.subtitle;
  dom.mainContent.innerHTML = view.html;
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

  applyView(renderTodayView(todayData, dateKey, window.localStorage, {
    appDate,
    debug: state.isDebugMode(),
    expandedIds: expandedTrainingBlocks,
  }));

  bindTodayInteractions(dateKey);
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
      const trainingId = button.dataset.trainingId;
      const block = document.getElementById(`block-${trainingId}`);
      if (block) {
        const isExpanded = block.classList.toggle('expanded');
        if (isExpanded) {
          expandedTrainingBlocks.add(String(trainingId));
        } else {
          expandedTrainingBlocks.delete(String(trainingId));
        }
      }
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
  applyView(renderPlanView(GYM_DATA));
}

function renderProfileTab() {
  applyView(renderProfileView(GYM_DATA, window.localStorage, new Date()));
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

window.addEventListener('DOMContentLoaded', init);
