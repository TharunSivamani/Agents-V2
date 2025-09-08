let tasks = [];

const listEl = document.getElementById('taskList');
const titleInput = document.getElementById('titleInput');
const dueInput = document.getElementById('dueInput');
const saveBtn = document.getElementById('saveBtn');
const addBtn = document.getElementById('addBtn');
const settingsBtn = document.getElementById('settingsBtn');

function render() {
  listEl.innerHTML = '';
  tasks.forEach(t => {
    const el = document.createElement('div');
    el.className = 'task-item ' + classifyDue(t.due);
    el.draggable = true;
    el.innerHTML = `
      <span class="title ${t.done ? 'done' : ''}">
        <span style="${t.done ? 'text-decoration: line-through;' : ''}">${escapeHtml(t.title)}</span> <small>${timeUntil(t.due)}</small>
      </span>
      <div class="button-group">
        <button class="editBtn" title="Edit task" aria-label="Edit">
          <span style="font-size:1.1em;">🖊️</span>
        </button>
        <button class="toggleBtn" title="${t.done ? 'Mark as incomplete' : 'Mark as complete'}" aria-label="${t.done ? 'Mark as incomplete' : 'Mark as complete'}">
          <span style="font-size:1.1em;">${t.done ? '✅' : '⭕'}</span>
        </button>
        <button class="delBtn" title="Delete task" aria-label="Delete">
          <span style="font-size:1.1em;">🗑️</span>
        </button>
      </div>
    `;

    el.querySelector('.delBtn').addEventListener('click', () => removeTask(t.id));
    el.querySelector('.toggleBtn').addEventListener('click', () => toggleDone(t.id));
    el.querySelector('.editBtn').addEventListener('click', () => editTask(t.id));

    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', t.id);
      e.currentTarget.style.opacity = '0.4';
    });
    el.addEventListener('dragend', e => e.currentTarget.style.opacity = '1');
    el.addEventListener('dragover', e => {
      e.preventDefault();
      e.currentTarget.style.transform = 'translateY(6px)';
    });
    el.addEventListener('dragleave', e => e.currentTarget.style.transform = '');
    el.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      reorderTasks(draggedId, t.id);
      e.currentTarget.style.transform = '';
    });

    listEl.appendChild(el);
  });
}

function addTask() {
  const title = titleInput.value.trim();
  if (!title) return;

  const task = {
    id: Date.now().toString(),
    title,
    done: false,
    due: dueInput.value || null
  };
  tasks.push(task);
  saveTasks();
  titleInput.value = '';
  dueInput.value = '';
  
  // Hide Save button and show Add button after adding/editing
  saveBtn.style.display = 'none';
  addBtn.style.display = 'block';
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    saveTasks();
  }
}

function editTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  titleInput.value = t.title;
  dueInput.value = t.due || '';
  removeTask(id);
  
  // Show Save button and hide Add button when editing
  saveBtn.style.display = 'block';
  addBtn.style.display = 'none';
}

function reorderTasks(draggedId, targetId) {
  const draggedIdx = tasks.findIndex(x => x.id === draggedId);
  const targetIdx = tasks.findIndex(x => x.id === targetId);
  if (draggedIdx < 0 || targetIdx < 0) return;
  const [dragged] = tasks.splice(draggedIdx, 1);
  tasks.splice(targetIdx, 0, dragged);
  saveTasks();
}

function saveTasks() {
  chrome.storage.local.set({ tasks }, () => {
    render();
    scheduleAlarms();
  });
}

function loadTasks() {
  chrome.storage.local.get(['tasks'], res => {
    tasks = res.tasks || [];
    render();
    scheduleAlarms();
  });
}

function scheduleAlarms() {
  chrome.alarms.clearAll(() => {
    tasks.forEach(t => {
      if (t.due && !t.done) {
        const when = new Date(t.due).getTime();
        if (when > Date.now()) {
          chrome.alarms.create('task-' + t.id, { when });
        }
      }
    });
  });
}

function timeUntil(iso) {
  if (!iso) return '';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return days + 'd';
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return hours + 'h';
  const mins = Math.floor(diff / 60000);
  return mins + 'm';
}

function classifyDue(iso) {
  if (!iso) return '';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff < 1000 * 60 * 60 * 24) return 'due-soon';
  return '';
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// wire UI
saveBtn.addEventListener('click', addTask);
addBtn.addEventListener('click', addTask);
settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
document.addEventListener('DOMContentLoaded', loadTasks);
