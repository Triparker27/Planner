/* planner.js
   - Classes, Assignments, Quizzes
   - Calendar icons + day modal with full details
   - Import / Export JSON
*/

/* ---------------------------------------------
   ORIGINAL CODE STARTS — NOTHING REMOVED
---------------------------------------------- */

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function $(id){ return document.getElementById(id); }

/* TAB SWITCHING */
function showTab(tabId){
  document.querySelectorAll(".tab").forEach(t => {
    t.style.display = (t.id === tabId ? "block" : "none");
  });
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

  let finalName = name;
  const existing = Array.from(document.querySelectorAll("#classList .class-preview"))
    .map(n => n.getAttribute("data-class"));
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
  div.setAttribute("data-name", name);
  div.setAttribute("data-class", cls);
  div.setAttribute("data-date", due);
  div.setAttribute("data-time", time);
  div.setAttribute("data-notes", notes);

  div.innerHTML = `
    <div>
      <div><strong>${escapeHtml(name)}</strong></div>
      <div class="class-meta">${escapeHtml(cls)} • ${escapeHtml(due)} ${time ? '• ' + escapeHtml(time) : ''}</div>
      <div class="class-meta">${escapeHtml(notes)}</div>
    </div>
  `;
  list.appendChild(div);

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
  const existing = Array.from(document.querySelectorAll("#quizList .quiz-preview"))
    .map(n => n.getAttribute("data-quiz"));
  if(existing.includes(finalName)){
    let i = 2;
    while(existing.includes(`${name} (${i})`)) i++;
    finalName = `${name} (${i})`;
  }

  const div = document.createElement("div");
  div.className = "quiz-preview";
  div.setAttribute("data-quiz", finalName);
  div.setAttribute("data-class", cls);
  div.setAttribute("data-date", date);
  div.setAttribute("data-time", time);
  div.setAttribute("data-notes", notes);

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

/* CALENDAR RENDERING */
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
    const classes = getClassesForWeekday(weekday);

    if(classes.length > 0){
      classes.slice(0,2).forEach(() => {
        const icon = document.createElement("div");
        icon.className = "class-icon";
        icon.textContent = "📘";
        cell.appendChild(icon);
      });
      if(classes.length > 2){
        const more = document.createElement("div");
        more.className = "class-icon";
        more.textContent = `+${classes.length - 2}`;
        cell.appendChild(more);
      }
    }

    // quizzes on this date
    Array.from(document.querySelectorAll("#quizList .quiz-preview")).forEach(q => {
      const qDate = q.getAttribute("data-date") || "";
      if(qDate === isoDate){
        const icon = document.createElement("div");
        icon.className = "class-icon";
        icon.textContent = "⚠️";
        cell.appendChild(icon);
      }
    });

    // assignments on this date
    Array.from(document.querySelectorAll("#assignmentList .assignment-preview")).forEach(a => {
      const aDate = a.getAttribute("data-date") || "";
      if(aDate === isoDate){
        const icon = document.createElement("div");
        icon.className = "class-icon";
        icon.textContent = "📄";
        cell.appendChild(icon);
      }
    });

    cell.addEventListener("click", () => openDayModal(currentYear, currentMonth, day, weekday));
    grid.appendChild(cell);
  }
}

function getClassesForWeekday(weekday){
  return Array.from(document.querySelectorAll("#classList .class-preview")).map(n => ({
    name: n.getAttribute("data-class"),
    days: JSON.parse(n.getAttribute("data-days") || "[]"),
    start: n.getAttribute("data-start"),
    end: n.getAttribute("data-end"),
    color: n.getAttribute("data-color")
  })).filter(c => c.days.includes(weekday) && !c.days.includes("Online"));
}

/* DAY MODAL: classes + assignments + quizzes for that date */
function openDayModal(year, monthIndex, day, weekday){
  const modal = $("dayModal");
  const body = $("modalBody");
  const title = $("modalTitle");
  if(!modal || !body || !title) return;

  const isoDate = isoDateFromParts(year, monthIndex, day);

  title.textContent = `Events for ${weekday} ${monthIndex+1}/${day}/${year}`;
  body.innerHTML = "";

  // classes (by weekday)
  const classes = getClassesForWeekday(weekday);
  classes.forEach(c => {
    const item = document.createElement("div");
    item.className = "modal-item class";
    item.innerHTML = `
      <div class="sw">📘</div>
      <div class="info">
        <div><strong>${escapeHtml(c.name)}</strong></div>
        <div class="time">${escapeHtml(c.start)} - ${escapeHtml(c.end)}</div>
      </div>
    `;
    body.appendChild(item);
  });

  // assignments (by exact date)
  Array.from(document.querySelectorAll("#assignmentList .assignment-preview")).forEach(a => {
    if((a.getAttribute("data-date") || "") === isoDate){
      const item = document.createElement("div");
      item.className = "modal-item assignment";
      item.innerHTML = `
        <div class="sw">📄</div>
        <div class="info">
          <div><strong>${escapeHtml(a.getAttribute("data-name") || "")}</strong></div>
          <div class="time">${escapeHtml(a.getAttribute("data-class") || "")}</div>
          <div class="time">${escapeHtml(a.getAttribute("data-time") || "")}</div>
          <div class="time">${escapeHtml(a.getAttribute("data-notes") || "")}</div>
        </div>
      `;
      body.appendChild(item);
    }
  });

  // quizzes (by exact date)
  Array.from(document.querySelectorAll("#quizList .quiz-preview")).forEach(q => {
    if((q.getAttribute("data-date") || "") === isoDate){
      const item = document.createElement("div");
      item.className = "modal-item quiz";
      item.innerHTML = `
        <div class="sw">⚠️</div>
        <div class="info">
          <div><strong>${escapeHtml(q.getAttribute("data-quiz") || "")}</strong></div>
          <div class="time">${escapeHtml(q.getAttribute("data-class") || "")}</div>
          <div class="time">${escapeHtml(q.getAttribute("data-time") || "")}</div>
          <div class="time">${escapeHtml(q.getAttribute("data-notes") || "")}</div>
        </div>
      `;
      body.appendChild(item);
    }
  });

  if(body.innerHTML.trim() === ""){
    body.innerHTML = '<div class="modal-item">No events for this day.</div>';
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

/* IMPORT / EXPORT */
function exportData(){
  const classes = Array.from(document.querySelectorAll("#classList .class-preview")).map(n => ({
    name: n.getAttribute("data-class"),
    days: JSON.parse(n.getAttribute("data-days") || "[]"),
    start: n.getAttribute("data-start"),
    end: n.getAttribute("data-end"),
    color: n.getAttribute("data-color")
  }));

  const assignments = Array.from(document.querySelectorAll("#assignmentList .assignment-preview")).map(n => ({
    name: n.getAttribute("data-name"),
    class: n.getAttribute("data-class"),
    date: n.getAttribute("data-date"),
    time: n.getAttribute("data-time"),
    notes: n.getAttribute("data-notes")
  }));

  const quizzes = Array.from(document.querySelectorAll("#quizList .quiz-preview")).map(n => ({
    name: n.getAttribute("data-quiz"),
    class: n.getAttribute("data-class"),
    date: n.getAttribute("data-date"),
    time: n.getAttribute("data-time"),
    notes: n.getAttribute("data-notes")
  }));

  const data = {classes, assignments, quizzes};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "student-planner-data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
window.exportData = exportData;

function importData(){
  const input = $("importFile");
  if(input) input.click();
}
window.importData = importData;

function handleImportFile(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try{
      const data = JSON.parse(e.target.result);
      loadImportedData(data);
    }catch(err){
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}
window.handleImportFile = handleImportFile;

function loadImportedData(data){
  if($("classList")) $("classList").innerHTML = "No classes added yet.";
  if($("assignmentList")) $("assignmentList").innerHTML = "No assignments yet
