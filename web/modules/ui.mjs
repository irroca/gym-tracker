import { isTaskCompleted } from './storage.mjs';

export function isTrainingMeal(item) {
  return item.title.includes('早训') || item.title.includes('晚训');
}

export function isEveningWorkout(workout) {
  return workout.name.includes('【晚训】');
}

export function extractWorkoutGroups(workouts) {
  return {
    morning: workouts.filter((workout) => !isEveningWorkout(workout)),
    evening: workouts.filter((workout) => isEveningWorkout(workout)),
  };
}

export function computeDayProgress(dayData, storage, dateKey) {
  let totalItems = 0;
  let completedItems = 0;

  dayData.meals.forEach((meal) => {
    if (!isTrainingMeal(meal)) {
      totalItems += 1;
      if (isTaskCompleted(storage, dateKey, meal.id)) {
        completedItems += 1;
      }
    }
  });

  dayData.workouts.forEach((workout) => {
    totalItems += 1;
    if (isTaskCompleted(storage, dateKey, workout.id)) {
      completedItems += 1;
    }
  });

  return {
    totalItems,
    completedItems,
    progressPercent: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
  };
}

export function getTrainingGroupStatus(workouts, storage, dateKey) {
  if (workouts.length === 0) return '';

  const completedCount = workouts.filter((workout) => isTaskCompleted(storage, dateKey, workout.id)).length;
  if (completedCount === workouts.length) return 'completed';
  if (completedCount > 0) return 'in-progress';
  return '';
}

export function getHeatLevel(dayData, storage, dateKey) {
  const { totalItems, completedItems } = computeDayProgress(dayData, storage, dateKey);
  if (totalItems === 0) return 0;
  const ratio = completedItems / totalItems;
  if (ratio === 1) return 4;
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.4) return 2;
  if (ratio > 0) return 1;
  return 0;
}


export function getVisualContext(dayData) {
  const groups = extractWorkoutGroups(dayData.workouts || []);

  if (String(dayData.workoutType).includes('休息')) {
    return {
      tone: 'recovery',
      badge: '恢复优先',
      energy: '低压节奏',
      accent: 'slate',
    };
  }

  if (groups.morning.length > 0 && groups.evening.length > 0) {
    return {
      tone: 'hybrid',
      badge: '双训推进',
      energy: '高输出日',
      accent: 'mint-blue',
    };
  }

  if (groups.morning.length > 0) {
    return {
      tone: 'performance',
      badge: '力量主场',
      energy: '稳定输出',
      accent: 'mint',
    };
  }

  return {
    tone: 'flow',
    badge: '节奏维持',
    energy: '轻量推进',
    accent: 'blue',
  };
}

export function getDailyHighlights(dayData) {
  const groups = extractWorkoutGroups(dayData.workouts);
  const highlights = [];

  if (groups.morning.length > 0) {
    highlights.push('早训前记得补充香蕉 + 乳清，避免空腹训练');
  } else {
    highlights.push('今天以恢复和稳态执行为主，优先保证饮食节奏');
  }

  if (groups.evening.length > 0) {
    highlights.push('今天包含晚训，结束后至少预留 90 分钟再睡觉');
  } else {
    highlights.push('晚间以拉伸、补剂和恢复为主，尽量按时收尾');
  }

  if (groups.morning.length > 0 && groups.evening.length > 0) {
    highlights.push('今日双训日，优先完成早餐恢复和晚间补剂');
  } else if (String(dayData.workoutType).includes('休息')) {
    highlights.push('休息日也要完成基础饮食和轻量活动，保持恢复节奏');
  } else {
    highlights.push('完成训练后及时补充蛋白和主食，保持减脂期恢复质量');
  }

  return highlights.slice(0, 3);
}
