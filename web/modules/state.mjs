import { resolveAppDate, toDateKey } from './date.mjs';
import { getDayOverride, setDayOverride } from './storage.mjs';

export function createAppState(storage = window.localStorage) {
  let currentTab = 'today';
  let dayOverride = getDayOverride(storage);

  return {
    getCurrentTab() {
      return currentTab;
    },
    setCurrentTab(tab) {
      currentTab = tab;
    },
    getDayOverride() {
      return dayOverride;
    },
    setDayOverride(value) {
      dayOverride = setDayOverride(storage, value);
      return dayOverride;
    },
    isDebugMode() {
      return dayOverride !== null && dayOverride !== 'none';
    },
    getAppDate(baseDate = new Date()) {
      return resolveAppDate(baseDate, dayOverride);
    },
    getDateKey(baseDate = new Date()) {
      return toDateKey(this.getAppDate(baseDate));
    },
  };
}
