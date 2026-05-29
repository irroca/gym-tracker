export const APP_STORAGE_PREFIX = 'gym_';
export const DAY_OVERRIDE_KEY = `${APP_STORAGE_PREFIX}day_override`;

export function getDayOverride(storage = window.localStorage) {
  return storage.getItem(DAY_OVERRIDE_KEY) || null;
}

export function setDayOverride(storage = window.localStorage, value) {
  if (value === null || value === undefined || value === '' || value === 'none') {
    storage.removeItem(DAY_OVERRIDE_KEY);
    return null;
  }

  storage.setItem(DAY_OVERRIDE_KEY, String(value));
  return String(value);
}

export function getTaskKey(dateKey, taskId) {
  return `${APP_STORAGE_PREFIX}${dateKey}_${taskId}`;
}

export function isTaskCompleted(storage = window.localStorage, dateKey, taskId) {
  return storage.getItem(getTaskKey(dateKey, taskId)) === 'true';
}

export function setTaskCompleted(storage = window.localStorage, dateKey, taskId, completed) {
  const key = getTaskKey(dateKey, taskId);
  if (completed) {
    storage.setItem(key, 'true');
  } else {
    storage.removeItem(key);
  }
}

export function clearGymStorage(storage = window.localStorage) {
  const keys = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && key.startsWith(APP_STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((key) => storage.removeItem(key));
}
