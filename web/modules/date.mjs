const WEEKDAY_LONG = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

export function resolveAppDate(baseDate = new Date(), dayOverride = null) {
  const target = new Date(baseDate);

  if (dayOverride !== null && dayOverride !== 'none' && dayOverride !== '') {
    const overrideDay = Number.parseInt(dayOverride, 10);
    if (!Number.isNaN(overrideDay)) {
      let diff = target.getDay() - overrideDay;
      if (diff < 0) diff += 7;
      target.setDate(target.getDate() - diff);
    }
  }

  return target;
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function formatChineseHeaderDate(date, isDebugMode = false) {
  const text = `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY_LONG[date.getDay()]}`;
  return isDebugMode ? `调试日期 · ${text}` : text;
}

export function formatHeatmapMonth(date) {
  return `${date.getMonth() + 1}月`;
}

export function formatShortWeekday(index) {
  return WEEKDAY_SHORT[index] ?? '';
}
