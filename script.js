// Select DOM elements
const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const taskProgress = document.getElementById('task-progress');
const progressFill = document.getElementById('progress-fill');
const filters = document.querySelectorAll('.filter');
const sortSelect = document.getElementById('sort-tasks');
const toggleThemeBtn = document.getElementById('toggle-theme');

// Load from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Form Submission
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const notes = document.getElementById('task-notes').value.trim();
  const start = document.getElementById('task-start').value;
  const due = document.getElementById('task-date').value;
  const priority = document.getElementById('task-priority').value;
  const tags = document.getElementById('task-tags').value.trim();

  if (!title) return;

  const task = {
    id: Date.now(),
    title,
    notes,
    start,
    due,
    priority,
    tags,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  form.reset();
  renderTasks(getActiveFilter());
});

// Render Tasks
function renderTasks(filter = 'all') {
  taskList.innerHTML = '';

  let filtered = [...tasks];
  if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  else if (filter === 'pending') filtered = filtered.filter(t => !t.completed);

  sortTasks(filtered);

  if (filtered.length === 0) {
    taskList.innerHTML = '<p>No tasks to display.</p>';
    updateProgress();
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    li.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-meta">
        <span>Priority: ${task.priority}</span>
        <span>Start: ${task.start || '-'}</span>
        <span>Due: ${task.due || '-'}</span>
        <span>Tags: ${task.tags || 'None'}</span>
      </div>
      ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
      <div class="task-actions">
        <button class="complete-btn">${task.completed ? 'Undo' : 'Done'}</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    li.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  updateProgress();
}

// Toggle Completion
function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks(getActiveFilter());
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks(getActiveFilter());
}

// Update Progress
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : (completed / total) * 100;

  taskProgress.textContent = `${completed} of ${total} tasks completed`;
  progressFill.style.width = `${percent}%`;
}

// Filter Buttons
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(btn.dataset.filter);
  });
});

function getActiveFilter() {
  const active = document.querySelector('.filter.active');
  return active ? active.dataset.filter : 'all';
}

// Sort Tasks
sortSelect.addEventListener('change', () => renderTasks(getActiveFilter()));

function sortTasks(list) {
  const sortBy = sortSelect.value;
  if (sortBy === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    list.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortBy === 'date') {
    list.sort((a, b) => new Date(a.due || '2100-01-01') - new Date(b.due || '2100-01-01'));
  }
}

// Theme Toggle
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load Theme on Start
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  renderTasks(getActiveFilter());
});

