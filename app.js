const defaults = [
  { title: 'Write the launch narrative', project: 'Work', done: false },
  { title: 'Review prototype feedback', project: 'Studio', done: false },
  { title: '30 minute walk without podcasts', project: 'Personal', done: true },
  { title: 'Send notes to Marcus', project: 'Work', done: true },
  { title: 'Outline next week\'s priorities', project: 'Work', done: false },
];
const defaultAgenda = [
  ['10:30', 'Design critique', 'Studio · 45 min'],
  ['13:00', 'Lunch walk', 'Personal · 30 min'],
  ['15:30', 'Writing block', 'Work · 90 min'],
];
let tasks = JSON.parse(localStorage.getItem('daybook-tasks') || 'null') || defaults;
let agenda = JSON.parse(localStorage.getItem('daybook-agenda') || 'null') || defaultAgenda;
let seconds = 25 * 60, paused = false, timer;
const $ = s => document.querySelector(s);
function save(){ localStorage.setItem('daybook-tasks', JSON.stringify(tasks)); }
function tagClass(project){ return project.toLowerCase(); }
function renderTasks(){
  $('#taskList').innerHTML = tasks.map((task,i) => `<li class="task ${task.done ? 'done' : ''}"><input class="check" type="checkbox" data-index="${i}" ${task.done ? 'checked' : ''}><div class="task-main"><strong>${escapeHtml(task.title)}</strong><small>${task.project.toUpperCase()} · TODAY</small></div><span class="tag ${tagClass(task.project)}">${task.project}</span></li>`).join('');
  const complete=tasks.filter(t=>t.done).length, total=tasks.length, pct=total?Math.round(complete/total*100):0;
  $('#progressText').textContent=`${complete} of ${total} complete`; $('#progressPercent').textContent=`${pct}%`; $('#progressFill').style.width=`${pct}%`; $('#openLoops').textContent=String(total-complete).padStart(2,'0');
  document.querySelectorAll('.check').forEach(el=>el.addEventListener('change',e=>{tasks[e.target.dataset.index].done=e.target.checked;save();renderTasks();}));
}
function escapeHtml(value){const d=document.createElement('div');d.textContent=value;return d.innerHTML;}
function renderAgenda(){ $('#agendaList').innerHTML=agenda.map(([time,title,detail])=>`<div class="agenda-item"><span class="agenda-time">${time}</span><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div></div>`).join(''); localStorage.setItem('daybook-agenda',JSON.stringify(agenda)); }
function updateTimer(){ const min=String(Math.floor(seconds/60)).padStart(2,'0'), sec=String(seconds%60).padStart(2,'0'); $('#focusMinutes').textContent=seconds>=60?min:`00:${sec}`; document.title=`${min}:${sec} · Daybook`; }
function tick(){if(!paused&&seconds>0){seconds--;updateTimer();}else if(seconds===0){paused=true;$('#timerButton').textContent='Start';}}
function openDialog(){ $('#taskDialog').showModal(); setTimeout(()=>$('#taskInput').focus(),50); }
$('#newTaskButton').onclick=openDialog; $('#addTaskButton').onclick=openDialog;
$('#taskForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return; const title=$('#taskInput').value.trim();if(title){tasks.unshift({title,project:$('#projectInput').value,done:false});save();renderTasks();} $('#taskInput').value='';});
$('#clearDone').onclick=()=>{tasks=tasks.filter(t=>!t.done);save();renderTasks();};
$('#timerButton').onclick=()=>{paused=!paused;$('#timerButton').textContent=paused?'Start':'Pause';};
$('#resetButton').onclick=()=>{seconds=25*60;paused=true;$('#timerButton').textContent='Start';updateTimer();};
$('#themeButton').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('daybook-dark',document.body.classList.contains('dark'));};
$('#addEventButton').onclick=()=>{const title=prompt('Name this event');if(title){agenda.push(['16:30',title,'Added today']);renderAgenda();}};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openDialog();} if(e.key==='Escape'&&$('#taskDialog').open)$('#taskDialog').close();});
const date=new Date(); $('#todayLabel').textContent=date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}).toUpperCase(); $('#greeting').textContent=`Good ${date.getHours()<12?'morning':date.getHours()<18?'afternoon':'evening'}, Alex.`; $('#dateHeading').textContent=date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
if(localStorage.getItem('daybook-dark')==='true')document.body.classList.add('dark'); renderTasks();renderAgenda();updateTimer();timer=setInterval(tick,1000);
