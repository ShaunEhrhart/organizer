const TASKS_KEY = 'organizer_tasks_offline';
const NOTES_KEY = 'organizer_notes_offline';

export function getCachedTasks() {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function cacheTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getCachedNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function cacheNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
