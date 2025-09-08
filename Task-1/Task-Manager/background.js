chrome.alarms.onAlarm.addListener(alarm => {
  if (!alarm || !alarm.name.startsWith('task-')) return;
  const id = alarm.name.replace('task-', '');
  chrome.storage.local.get(['tasks','settings'], res => {
    const tasks = res.tasks || [];
    const settings = res.settings || { notifications: true };
    if (!settings.notifications) return;
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    chrome.notifications.create('notif-' + id, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Task due: ' + (t.title.length > 40 ? t.title.slice(0,40)+'…' : t.title),
      message: t.due ? 'Due at '+new Date(t.due).toLocaleString() : 'Task is due',
      priority: 2
    });
  });
});

chrome.notifications.onClicked.addListener(notifId => {
  if (notifId.startsWith('notif-')) chrome.runtime.openOptionsPage();
});
