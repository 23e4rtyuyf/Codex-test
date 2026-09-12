const STORAGE_KEY = 'relay-handoffs-v1';
const $ = selector => document.querySelector(selector);
let selectedDate = startOfDay(new Date());
let journal = loadJournal();
let selectedPromise = null;
let seconds = 20 * 60;
let paused = true;

function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function keyFor(date = selectedDate) { return date.toISOString().slice(0, 10); }
function blankPage() { return { thread: '', promises: [], loose: [], closing: '' }; }
function sourceName(url) { try { const host = new URL(url).hostname.replace('www.', ''); const names = { 'slack.com': 'Slack', 'linear.app': 'Linear', 'github.com': 'GitHub', 'figma.com': 'Figma', 'docs.google.com': 'Google Docs', 'notion.so': 'Notion' }; return names[host] || host; } catch { return 'Source'; } }
function loadJournal() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function page() { const key = keyFor(); if (!journal[key]) journal[key] = blankPage(); return journal[key]; }
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(journal)); }
function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
function today() { return startOfDay(new Date()); }
function dayDifference() { return Math.round((selectedDate - today()) / 86400000); }
function dateLabel() { const diff = dayDifference(); if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow'; if (diff === -1) return 'Yesterday'; return selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }

function renderPromises() {
  const promises = page().promises;
  $('#promiseGrid').innerHTML = promises.map((promise, index) => `<article class="promise ${promise.done ? 'done' : ''} ${index === selectedPromise ? 'selected' : ''}" data-promise="${index}"><header><span>0${index + 1}</span><button class="promise-menu" data-delete="${index}" aria-label="Remove promise">×</button></header><h3>${escapeHtml(promise.title)}</h3><div class="promise-detail"><p class="label">BEGIN WITH</p><p>${escapeHtml(promise.cue)}</p></div><div class="promise-proof"><span>ENOUGH LOOKS LIKE</span>${escapeHtml(promise.proof)}</div>${promise.source ? `<a class="source-link" href="${escapeHtml(promise.source)}" target="_blank" rel="noopener">Open ${sourceName(promise.source)} <b>↗</b></a>` : ''}<footer><button class="select-promise" data-select="${index}">${index === selectedPromise ? 'In session' : 'Use this next'} <b>→</b></button><label class="done-toggle"><input type="checkbox" data-done="${index}" ${promise.done ? 'checked' : ''}> Done</label></footer></article>`).join('');
  $('#emptyState').hidden = promises.length > 0;
  $('#addPromiseButton').disabled = promises.length >= 3;
  $('#addPromiseButton').textContent = promises.length >= 3 ? 'Three is enough' : '+ New promise';
  document.querySelectorAll('[data-select]').forEach(button => button.onclick = () => { selectedPromise = Number(button.dataset.select); renderPromises(); renderFocus(); });
  document.querySelectorAll('[data-done]').forEach(input => input.onchange = event => { page().promises[Number(event.target.dataset.done)].done = event.target.checked; persist(); renderPromises(); });
  document.querySelectorAll('[data-delete]').forEach(button => button.onclick = event => { event.stopPropagation(); const index = Number(button.dataset.delete); page().promises.splice(index, 1); if (selectedPromise === index) selectedPromise = null; if (selectedPromise > index) selectedPromise--; persist(); renderPromises(); renderFocus(); });
}
function renderFocus() {
  const promise = page().promises[selectedPromise];
  $('#focusName').textContent = promise ? promise.title : 'Choose a promise';
  $('#focusCue').textContent = promise ? promise.cue : 'A focus session begins with a physical first move, not a timer.';
  $('#timerButton').disabled = !promise;
}
function renderLoose() {
  $('#looseList').innerHTML = page().loose.map((item, index) => `<li>${escapeHtml(item)}<button data-loose-delete="${index}" aria-label="Remove ${escapeHtml(item)}">×</button></li>`).join('');
  $('#looseCount').textContent = String(page().loose.length).padStart(2, '0');
  document.querySelectorAll('[data-loose-delete]').forEach(button => button.onclick = () => { page().loose.splice(Number(button.dataset.looseDelete), 1); persist(); renderLoose(); });
}
function render() {
  $('#dateHeading').textContent = dateLabel();
  $('#dateContext').textContent = dayDifference() === 0 ? "TODAY'S HANDOFF" : `HANDOFF · ${keyFor()}`;
  $('#threadInput').value = page().thread;
  renderPromises(); renderFocus(); renderLoose();
}
function updateTimer() { const min = String(Math.floor(seconds / 60)).padStart(2, '0'); const sec = String(seconds % 60).padStart(2, '0'); $('#clock').textContent = `${min}:${sec}`; document.title = `${min}:${sec} · Relay`; }
function openPromiseDialog() { $('#promiseDialog').showModal(); setTimeout(() => $('#promiseTitle').focus(), 30); }
function moveDay(amount) { selectedDate.setDate(selectedDate.getDate() + amount); selectedPromise = null; render(); }
function carryForward() {
  const current = page(); const unfinished = current.promises.filter(promise => !promise.done);
  const tomorrow = new Date(selectedDate); tomorrow.setDate(tomorrow.getDate() + 1); const destinationKey = keyFor(tomorrow); const destination = journal[destinationKey] || blankPage();
  const available = Math.max(0, 3 - destination.promises.length); destination.promises.push(...unfinished.slice(0, available).map(promise => ({ ...promise })));
  if (!destination.thread && current.thread) destination.thread = current.thread;
  journal[destinationKey] = destination; persist();
}

$('#previousDay').onclick = () => moveDay(-1);
$('#nextDay').onclick = () => moveDay(1);
$('#todayButton').onclick = () => { selectedDate = today(); selectedPromise = null; render(); };
$('#threadInput').oninput = event => { page().thread = event.target.value; persist(); };
$('#addPromiseButton').onclick = openPromiseDialog;
$('#promiseForm').onsubmit = event => { if (event.submitter?.value === 'cancel') return; page().promises.push({ title: $('#promiseTitle').value.trim(), cue: $('#promiseCue').value.trim(), proof: $('#promiseProof').value.trim(), source: $('#promiseSource').value.trim(), done: false }); persist(); renderPromises(); $('#promiseForm').reset(); };
$('#looseAdd').onclick = () => { const text = $('#looseInput').value.trim(); if (text) { page().loose.push(text); $('#looseInput').value = ''; persist(); renderLoose(); } };
$('#looseInput').onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); $('#looseAdd').click(); } };
$('#timerButton').onclick = () => { paused = !paused; $('#timerButton').textContent = paused ? 'Resume session' : 'Pause session'; };
$('#resetButton').onclick = () => { seconds = 20 * 60; paused = true; $('#timerButton').textContent = 'Start a session'; updateTimer(); };
$('#themeButton').onclick = () => { document.body.classList.toggle('light'); localStorage.setItem('relay-light', document.body.classList.contains('light')); };
$('#handoffButton').onclick = () => { const unfinished = page().promises.filter(promise => !promise.done); $('#handoffSummary').textContent = unfinished.length ? `${unfinished.length} unfinished promise${unfinished.length === 1 ? '' : 's'} will carry forward with its re-entry cue.` : 'There is nothing unfinished to carry. Leave a note anyway, if it would help.'; $('#handoffNote').value = page().closing; $('#handoffDialog').showModal(); };
$('#handoffForm').onsubmit = event => { if (event.submitter?.value === 'cancel') return; page().closing = $('#handoffNote').value.trim(); carryForward(); persist(); $('#handoffForm').reset(); };
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPromiseDialog(); } });
if (localStorage.getItem('relay-light') === 'true') document.body.classList.add('light');
setInterval(() => { if (!paused && seconds > 0) { seconds--; updateTimer(); } if (seconds === 0) { paused = true; $('#timerButton').textContent = 'Start a session'; } }, 1000);
const capture = new URLSearchParams(location.search);
if (capture.has('capture')) { $('#promiseTitle').value = capture.get('title') || ''; $('#promiseCue').value = capture.get('cue') || ''; $('#promiseProof').value = capture.get('proof') || ''; $('#promiseSource').value = capture.get('capture') || ''; $('#promiseDialog').showModal(); history.replaceState({}, '', location.pathname); }
render(); updateTimer();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
