const STORAGE_KEY = 'daybook-pages-v2';
const defaults = [
  { title: 'Write the launch narrative', project: 'Work', done: false },
  { title: 'Review prototype feedback', project: 'Work', done: false },
  { title: 'Take a walk without audio', project: 'Personal', done: false },
];
const $ = selector => document.querySelector(selector);
let selectedDate = startOfDay(new Date());
let pages = readPages();
let seconds = 25 * 60;
let paused = true;

function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function dateKey(date = selectedDate) { return date.toISOString().slice(0, 10); }
function cloneDefaults() { return defaults.map(task => ({ ...task })); }
function freshPage() { return { intention: '', tasks: cloneDefaults(), parking: [], closing: '' }; }
function readPages() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function page() { const key = dateKey(); if (!pages[key]) pages[key] = freshPage(); return pages[key]; }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)); }
function escapeHtml(value) { const element = document.createElement('div'); element.textContent = value; return element.innerHTML; }
function relativeDate() { const today = startOfDay(new Date()); const difference = Math.round((selectedDate - today) / 86400000); if (difference === 0) return 'Today'; if (difference === -1) return 'Yesterday'; if (difference === 1) return 'Tomorrow'; return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }

function renderTasks() {
  const { tasks } = page();
  $('#taskList').innerHTML = tasks.map((task, index) => `<li class="task ${task.done ? 'done' : ''}"><input class="check" type="checkbox" data-index="${index}" aria-label="Mark ${escapeHtml(task.title)} complete" ${task.done ? 'checked' : ''}><div class="task-main"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.project).toUpperCase()}</small></div><button class="remove-task" data-remove="${index}" aria-label="Remove ${escapeHtml(task.title)}">×</button></li>`).join('');
  const complete = tasks.filter(task => task.done).length;
  const percentage = tasks.length ? Math.round(complete / tasks.length * 100) : 0;
  $('#progressText').textContent = tasks.length ? `${complete} of ${tasks.length} checked` : 'Nothing on the list';
  $('#progressPercent').textContent = `${percentage}%`;
  $('#progressFill').style.width = `${percentage}%`;
  document.querySelectorAll('.check').forEach(input => input.addEventListener('change', event => { page().tasks[event.target.dataset.index].done = event.target.checked; save(); renderTasks(); }));
  document.querySelectorAll('.remove-task').forEach(button => button.addEventListener('click', () => { page().tasks.splice(button.dataset.remove, 1); save(); renderTasks(); }));
}
function renderParking() {
  $('#parkingList').innerHTML = page().parking.map((item, index) => `<li><span>${escapeHtml(item)}</span><button data-parking-remove="${index}" aria-label="Remove ${escapeHtml(item)}">×</button></li>`).join('');
  document.querySelectorAll('[data-parking-remove]').forEach(button => button.addEventListener('click', () => { page().parking.splice(button.dataset.parkingRemove, 1); save(); renderParking(); }));
}
function renderPage() {
  const currentPage = page();
  $('#dateHeading').textContent = relativeDate();
  $('#intentionInput').value = currentPage.intention;
  $('#closingText').textContent = currentPage.closing || 'A small record is better than a perfect plan.';
  $('#closeDayButton').textContent = currentPage.closing ? 'Edit closing note' : 'Write a closing note';
  renderTasks(); renderParking();
}
function updateTimer() {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  $('#focusMinutes').textContent = `${minutes}:${remainder}`;
  document.title = `${minutes}:${remainder} · Daybook`;
}
function openTaskDialog() { $('#taskDialog').showModal(); setTimeout(() => $('#taskInput').focus(), 30); }
function moveDay(amount) { selectedDate.setDate(selectedDate.getDate() + amount); renderPage(); }

$('#previousDay').onclick = () => moveDay(-1);
$('#nextDay').onclick = () => moveDay(1);
$('#todayButton').onclick = () => { selectedDate = startOfDay(new Date()); renderPage(); };
$('#newTaskButton').onclick = openTaskDialog;
$('#addTaskButton').onclick = openTaskDialog;
$('#intentionInput').addEventListener('input', event => { page().intention = event.target.value; save(); });
$('#taskForm').addEventListener('submit', event => { if (event.submitter?.value === 'cancel') return; const title = $('#taskInput').value.trim(); if (title) { page().tasks.push({ title, project: $('#projectInput').value, done: false }); save(); renderTasks(); } $('#taskInput').value = ''; });
$('#clearDone').onclick = () => { page().tasks = page().tasks.filter(task => !task.done); save(); renderTasks(); };
$('#parkingAdd').onclick = () => { const text = $('#parkingInput').value.trim(); if (text) { page().parking.push(text); $('#parkingInput').value = ''; save(); renderParking(); } };
$('#parkingInput').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('#parkingAdd').click(); } });
$('#timerButton').onclick = () => { paused = !paused; $('#timerButton').textContent = paused ? 'Start' : 'Pause'; };
$('#resetButton').onclick = () => { seconds = 25 * 60; paused = true; $('#timerButton').textContent = 'Start'; updateTimer(); };
$('#themeButton').onclick = () => { document.body.classList.toggle('dark'); localStorage.setItem('daybook-dark', document.body.classList.contains('dark')); };
$('#closeDayButton').onclick = () => { $('#closingInput').value = page().closing; $('#closeDialog').showModal(); };
$('#closeForm').addEventListener('submit', event => { if (event.submitter?.value === 'cancel') return; page().closing = $('#closingInput').value.trim(); save(); renderPage(); });
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openTaskDialog(); } });
if (localStorage.getItem('daybook-dark') === 'true') document.body.classList.add('dark');
setInterval(() => { if (!paused && seconds > 0) { seconds--; updateTimer(); } if (seconds === 0) { paused = true; $('#timerButton').textContent = 'Start'; } }, 1000);
renderPage(); updateTimer();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
