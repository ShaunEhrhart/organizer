export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleTaskNotification(task) {
  if (Notification.permission !== 'granted' || !task.due_date) return;

  const dueDate = new Date(task.due_date + 'T09:00:00');
  const now = new Date();
  const delay = dueDate.getTime() - now.getTime();

  if (delay > 0 && delay < 86400000 * 7) {
    setTimeout(() => {
      new Notification('Task Due', {
        body: `"${task.title}" is due today`,
        icon: '/icons/icon-192.png',
        tag: `task-${task.id}`,
      });
    }, delay);
  }
}

export function scheduleDueNotifications(tasks) {
  tasks.filter((t) => !t.completed).forEach(scheduleTaskNotification);
}
