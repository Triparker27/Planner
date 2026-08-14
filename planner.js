/* planner.js
   - Assignments, Classes, Tests & Quizzes tabs
   - Calendar shows only class icons (no full event blocks)
   - Clicking a day opens a modal listing classes for that weekday (shows start time)
   - Class list shows start and end times in details
   - "Online" day option exists but is not shown on the calendar
*/

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function $(id){ return document.getElementById(id); }

/* TAB SWITCHING */
function showTab(tabId){
  document.querySelectorAll(".tab").forEach(t => t.style.display = (t.id === tabId ? "block" : "none"));
}
window.showTab = showTab;

/* COLOR PREVIEW */
function updateColorPreview(){
  const sel = $("classColor");
  const preview = $("colorPreview");
  if(sel && preview) preview.style.background = sel.value;
}
window.updateColorPreview = updateColorPreview;

/* CLASS MANAGEMENT */
function addClass(){
  const name = $("className").value.trim();
  const color = $("classColor").value;
  const day1 = $("classDay1").value;
  const day2 = $("classDay2").value;
  const start = $("classStart").value;
  const end = $("classEnd").value;

  if(!name){ alert("Enter a class name."); return; }
  if(!day1){ alert("Select at least Day 1."); return; }
  if(!start || !end){ alert("Enter start and end times."); return; }

  const days = [day1];
  if(day2 && day2 !== day1) days.push(day2);

  createClassEntry(name, color, days, start, end);
  clearClassForm();
  renderCalendar();
}
window.addClass = addClass;

function createClassEntry(name, color, days, start, end){
  const list = $("classList");
  if(!list) return;
  if(list.innerHTML.trim() === "No classes added yet.") list.innerHTML = "";

  // ensure unique name
  let finalName = name;
  const existing = Array.from(document.querySelectorAll("#classList .class-preview")).map(n => n.getAttribute("data-class"));
  if(existing.includes(finalName)){
    let i = 2;
    while(existing.includes(`${name} (${i})`)) i++;
    finalName = `${name} (${i})`;
  }

  const div = document.createElement("div");
  div.className = "class-preview";
  div.setAttribute("data-class", finalName);
  div.setAttribute("data-days", JSON.stringify(days));
  div.setAttribute("data-start", start);
  div.setAttribute("data-end", end);
  div.setAttribute("data-color", color);

  div.innerHTML = `
    <div class="class-info">
      <div class="swatch" style="background:${color}"></div>
      <div>
        <div class="class-meta"><strong>${escapeHtml(finalName)}</strong></div>
        <div class="class-meta">${escapeHtml(days.join(", "))} • ${escapeHtml(start)} - ${escapeHtml(end)}</div>
      </div>
    </div>
    <div>
      <button class="addBtn" onclick="deleteClass('${escapeJs(finalName)}')">Delete</button>
    </div>
  `;

  list.appendChild(div);
  addClassToDropdowns(finalName, color);
}

function addClassToDropdowns(name, color){
  ["assignmentClass","quizClass"].forEach(id=>{
    const sel = $(id);
    if(!sel) return;
    const opt = document.createElement("option");
    opt.value = name;
    opt.text = name;
    opt.setAttribute("data-color", color);
    sel.appendChild(opt);
  });
}

function deleteClass(name){
  document.querySelectorAll("#classList .class-preview").forEach(node=>{
    if(node.getAttribute("data-class") === name) node.remove();
  });

  ["assignmentClass","quizClass"].forEach(id=>{
    const sel = $(id);
    if(!sel) return;
    for(let i = sel.options.length - 1; i >= 0; i--){
      if(sel.options[i].value === name) sel.remove(i);
    }
  });

  const list = $("classList");
  if(list && list.children.length === 0) list.innerHTML = "No classes added yet.";
  renderCalendar();
}
window.deleteClass = deleteClass;

function clearClassForm(){
  if($("className")) $("className").value = "";
  if($("classStart")) $("classStart").value = "";
  if($("classEnd")) $("classEnd").value = "";
  if($("classDay1")) $("classDay1").selectedIndex = 0;
  if($("classDay2")) $("classDay2").selectedIndex = 0;
  updateColorPreview();
}

/* ASSIGNMENTS */
function addAssignment(){
  const name = $("assignmentName").value.trim();
  const cls = $("assignmentClass").value;
  const due = $("assignmentDue").value;
  const time = $("assignmentTime") ? $("assignmentTime").value : "";
  const notes = $("assignmentNotes") ? $("assignmentNotes").value.trim() : "";

  if(!name){ alert("Enter assignment name."); return; }

  const list = $("assignmentList");
  if(list && list.innerHTML.trim() === "No assignments yet.") list.innerHTML = "";

  const div = document.createElement("div");
  div.className = "assignment-preview";
  div.innerHTML = `
    <div>
      <div><strong>${escapeHtml(name)}</strong></div>
      <div class="class-meta">${escapeHtml(cls)} • ${escapeHtml(due)} ${time ? '• ' + escapeHtml(time) : ''}</div>
      <div class="class-meta">${escapeHtml(notes)}</div>
    </div>
  `;
  list.appendChild(div);

  // clear
  $("assignmentName").value = "";
  if($("assignmentClass")) $("assignmentClass").selectedIndex = 0;
  if($("assignmentDue")) $("assignmentDue").value = "";
  if($("assignmentTime")) $("assignmentTime").value = "";
  if($("assignmentNotes")) $("assignmentNotes").value = "";
}
window.addAssignment = addAssignment;

/* QUIZZES / TESTS */
function addQuiz(){
  const name = $("quizName").value.trim();
  const cls = $("quizClass").value;
  const date = $("quizDate").value;
  const time = $("quizTime").value;
  const notes = $("quizNotes").value.trim();

  if(!name){ alert("Enter quiz/test name."); return; }
  if(!date){ alert("Select a date."); return; }

  createQuizEntry(name, cls, date, time, notes);

  $("quizName").value = "";
  if($("quizClass")) $("quizClass").selectedIndex = 0;
  if($("quizDate")) $("quizDate").value = "";
  if($("quizTime")) $("quizTime").value = "";
  if($("quizNotes")) $("quizNotes").value = "";

  renderCalendar();
}
window.addQuiz = addQuiz;

function createQuizEntry(name, cls, date, time, notes){
  const list = $("quizList");
  if(!list) return;
  if(list.innerHTML.trim() === "No quizzes or tests yet.") list.innerHTML = "";

  let finalName = name;
  const existing = Array.from(document.querySelectorAll("#quizList .quiz-preview")).map(n => n.getAttribute("data-quiz"));
  if(existing.includes(finalName)){
    let i = 2;
    while(existing.includes(`${name} (${i})`)) i++;
    finalName = `${name} (${i})`;
  }

  const div = document.createElement("div");
  div.className = "quiz-preview";
  div.setAttribute("data-quiz", finalName);
  div.setAttribute("data-date", date);
  div.setAttribute("data-time", time);
  div.setAttribute("data-class", cls);

  div.innerHTML = `
    <div>
      <div><strong>${escapeHtml(finalName)}</strong></div>
      <div class="class-meta">${escapeHtml(cls)} • ${escapeHtml(date)} ${time ? '• ' + escapeHtml(time) : ''}</div>
      <div class="class-meta">${escapeHtml(notes)}</div>
    </div>
  `;
  list.appendChild(div);
}
window.createQuizEntry = createQuizEntry;

/* CALENDAR RENDERING
   - show only class icons on days (exclude 'Online')
   - clicking a day opens modal listing classes for that weekday
*/
function renderCalendar(){
  const grid = $("calendarGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const monthLabel = $("monthLabel");
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  if(monthLabel) monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for(let i=0;i<firstDay;i++){
    const blank = document.createElement("div");
    blank.className = "calendar-day";
    grid.appendChild(blank);
  }

  for(let day=1; day<=daysInMonth; day++){
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.setAttribute("data-day", day);

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const dateObj = new Date(currentYear, currentMonth, day);
    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dateObj.getDay()];
    const isoDate = isoDateFromParts(currentYear, currentMonth, day);

    // classes for this weekday (exclude Online)
    const classes = Array.from(document.querySelectorAll("#classList .class-preview")).map(n => ({
      name: n.getAttribute("data-class"),
      days: JSON.parse(n.getAttribute("data-days") || "[]"),
      start: n.getAttribute("data-start"),
      end: n.getAttribute("data-end"),
      color: n.getAttribute("data-color")
    })).filter(c => c.days.includes(weekday) && !c.days.includes("Online"));

    if(classes.length > 0){
      // show up to 2 icons
      classes.slice(0,2).forEach(c => {
        const icon = document.createElement("div");
        icon.className = "class-icon";
        icon.title = `${c.name} • ${c.start}`;
        icon.style.background = "#000";
        icon.textContent = "📘";
        cell.appendChild(icon);
      });
      if(classes.length > 2){
        const more = document.createElement("div");
        more.className = "class-icon";
        more.style.background = "#444";
        more.textContent = `+${classes.length - 2}`;
        cell.appendChild(more);
      }
    }

    // quizzes on this date (show small icon)
    Array.from(document.querySelectorAll("#quizList .quiz-preview")).forEach(q => {
      const qDate = q.getAttribute("data-date") || "";
      if(qDate === isoDate){
        const icon = document.createElement("div");
        icon.className = "class-icon";
        icon.style.width = "30px";
        icon.style.height = "30px";
        icon.style.fontSize = "14px";
        icon.textContent = "⚠️";
        cell.appendChild(icon);
      }
    });

    // assignments on this date (small icon)
    Array.from(document.querySelectorAll("#assignmentList .assignment-preview")).forEach(a => {
      const meta = a.querySelector(".class-meta");
      const aDate = meta ? extractDateFromMeta(meta.textContent || "") : "";
      if(aDate === isoDate){
        const ev = document.createElement("div");
        ev.className = "class-icon";
        ev.style.width = "30px";
        ev.style.height = "30px";
        ev.style.fontSize = "14px";
        ev.textContent = "📄";
        cell.appendChild(ev);
      }
    });

    // click opens modal showing classes for that weekday (only name + start time)
    cell.addEventListener("click", () => openDayModal(currentYear, currentMonth, day, weekday));

    grid.appendChild(cell);
  }
}

/* DAY MODAL: show classes (name + start time) for clicked weekday */
function openDayModal(year, monthIndex, day, weekday){
  const modal = $("dayModal");
  const body = $("modalBody");
  const title = $("modalTitle");
  if(!modal || !body || !title) return;

  title.textContent = `Events for ${weekday} ${monthIndex+1}/${day}/${year}`;
  body.innerHTML = "";

  const classes = Array.from(document.querySelectorAll("#classList .class-preview")).map(n => ({
    name: n.getAttribute("data-class"),
    days: JSON.parse(n.getAttribute("data-days") || "[]"),
    start: n.getAttribute("data-start"),
    end: n.getAttribute("data-end"),
    color: n.getAttribute("data-color")
  })).filter(c => c.days.includes(weekday) && !c.days.includes("Online"));

  if(classes.length === 0){
    body.innerHTML = '<div class="modal-item">No classes scheduled for this day.</div>';
  } else {
    classes.forEach(c => {
      const item = document.createElement("div");
      item.className = "modal-item";
      item.innerHTML = `
        <div class="sw" style="background:${c.color}">📘</div>
        <div class="info">
          <div><strong>${escapeHtml(c.name)}</strong></div>
          <div class="time">Starts at ${escapeHtml(c.start)}</div>
        </div>
      `;
      body.appendChild(item);
    });
  }

  modal.setAttribute("aria-hidden","false");
}
window.openDayModal = openDayModal;

function closeDayModal(){
  const modal = $("dayModal");
  if(modal) modal.setAttribute("aria-hidden","true");
}
window.closeDayModal = closeDayModal;

/* NAVIGATION */
function prevMonth(){
  currentMonth--;
  if(currentMonth < 0){ currentMonth = 11; currentYear--; }
  renderCalendar();
}
window.prevMonth = prevMonth;

function nextMonth(){
  currentMonth++;
  if(currentMonth > 11){ currentMonth = 0; currentYear++; }
  renderCalendar();
}
window.nextMonth = nextMonth;

/* HELPERS */
function isoDateFromParts(year, monthIndex, day){
  return `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
function escapeHtml(s){ if(s === null || s === undefined) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escapeJs(s){ return String(s).replace(/'/g,"\\'").replace(/"/g,'\\"'); }

/* Extract date from assignment meta text (best-effort) */
function extractDateFromMeta(text){
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  if($("classList") && $("classList").innerHTML.trim() === "") $("classList").innerHTML = "No classes added yet.";
  if($("assignmentList") && $("assignmentList").innerHTML.trim() === "") $("assignmentList").innerHTML = "No assignments yet.";
  if($("quizList") && $("quizList").innerHTML.trim() === "") $("quizList").innerHTML = "No quizzes or tests yet.";

  const modal = $("dayModal");
  if(modal) modal.addEventListener("click", (e) => { if(e.target === modal) closeDayModal(); });

  renderCalendar();
  showTab("assignments");
});
