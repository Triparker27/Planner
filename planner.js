/* planner.js
   Fixed, self-contained JavaScript for Student Planner.
   - Exposes global functions used by inline onclick attributes
   - Robust DOMContentLoaded initialization
   - Classes (two selectable weekdays Mon-Fri, one start/end time)
   - Assignments and Quizzes
   - Calendar rendering with class events (📘), assignments (📄), quizzes (⚠️)
   - Export / Import JSON
   - Defensive checks so nothing breaks if an element is missing
*/

/* -------------------------
   STATE
--------------------------*/
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

/* -------------------------
   SMALL HELPERS
--------------------------*/
function $(id){ return document.getElementById(id); }

function isoDateFromParts(year, monthIndex, day){
  return `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function escapeHtml(str){
  if(str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* -------------------------
   TAB SWITCHING (global)
--------------------------*/
function showTab(tabId){
  document.querySelectorAll(".tab").forEach(t => {
    t.style.display = (t.id === tabId) ? "block" : "none";
  });
}
window.showTab = showTab;

/* -------------------------
   CLASS MANAGEMENT
--------------------------*/
function updateColorPreview(){
  const preview = $("colorPreview");
  const sel = $("classColor");
  if(preview && sel) preview.style.background = sel.value;
}
window.updateColorPreview = updateColorPreview;

function addClass(){
  const nameEl = $("className");
  const colorEl = $("classColor");
  const day1El = $("classDay1");
  const day2El = $("classDay2");
  const startEl = $("classStart");
  const endEl = $("classEnd");

  if(!nameEl || !colorEl || !day1El || !startEl || !endEl) return;

  const name = nameEl.value.trim();
  const color = colorEl.value;
  const day1 = day1El.value;
  const day2 = day2El ? day2El.value : "";
  const start = startEl.value;
  const end = endEl.value;

  if(!name){ alert("Enter a class name."); return; }
  if(!day1){ alert("Select at least one day (Day 1)."); return; }
  if(!start || !end){ alert("Enter both start and end times."); return; }

  const days = [day1];
  if(day2 && day2 !== day1) days.push(day2);

  createClassEntry(name, color, days, start, end);

  // reset inputs
  nameEl.value = "";
  startEl.value = "";
  endEl.value = "";
  day1El.selectedIndex = 0;
  if(day2El) day2El.selectedIndex = 0;
  updateColorPreview();

  renderCalendar();
}
window.addClass = addClass;

function createClassEntry(name, color, days, start, end){
  const list = $("classList");
  if(!list) return;

  if(list.innerHTML.trim() === "No classes added yet.") list.innerHTML = "";

  // ensure unique class id/name
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
    <span style="color:${escapeHtml(color)};font-weight:bold;">■ ${escapeHtml(finalName)}</span><br>
    <b>Days:</b> ${escapeHtml(days.join(", "))}<br>
    <b>Time:</b> ${escapeHtml(start)} - ${escapeHtml(end)}
  `;

  const btn = document.createElement("button");
  btn.className = "deleteBtn";
  btn.type = "button";
  btn.textContent = "Delete";
  btn.onclick = () => deleteClass(finalName);

  div.appendChild(btn);
  list.appendChild(div);

  addClassToDropdowns(finalName, color);
}

function addClassToDropdowns(name, color){
  const ac = $("assignmentClass");
  const qc = $("quizClass");
  if(ac){
    const opt = document.createElement("option");
    opt.value = name;
    opt.text = name;
    opt.setAttribute("data-color", color);
    ac.appendChild(opt);
  }
  if(qc){
    const opt2 = document.createElement("option");
    opt2.value = name;
    opt2.text = name;
    opt2.setAttribute("data-color", color);
    qc.appendChild(opt2);
  }
}

function deleteClass(name){
  // remove preview
  document.querySelectorAll("#classList .class-preview").forEach(node=>{
    if(node.getAttribute("data-class") === name) node.remove();
  });

  // remove from dropdowns
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

/* -------------------------
   ASSIGNMENTS
--------------------------*/
function addAssignment(){
  const nameEl = $("assignmentName");
  const classSel = $("assignmentClass");
  const dueEl = $("assignmentDue");
  const notesEl = $("assignmentNotes");

  if(!nameEl || !classSel || !dueEl) return;

  const name = nameEl.value.trim();
  const className = classSel.value;
  const dueDate = dueEl.value;
  const notes = notesEl ? notesEl.value.trim() : "";

  if(!name){ alert("Enter an assignment name."); return; }

  const selected = classSel.options[classSel.selectedIndex];
  const color = selected ? selected.getAttribute("data-color") || "#000000" : "#000000";

  createAssignmentEntry(name, className, dueDate, notes, color);

  nameEl.value = "";
  classSel.selectedIndex = 0;
  dueEl.value = "";
  if(notesEl) notesEl.value = "";

  renderCalendar();
}
window.addAssignment = addAssignment;

function createAssignmentEntry(name, className, dueDate, notes, color){
  const list = $("assignmentList");
  if(!list) return;
  if(list.innerHTML.trim() === "No assignments yet.") list.innerHTML = "";

  let finalName = name;
  const existing = Array.from(document.querySelectorAll("#assignmentList .assignment-preview"))
    .map(n => n.getAttribute("data-assignment"));
  if(existing.includes(finalName)){
    let i = 2;
    while(existing.includes(`${name} (${i})`)) i++;
    finalName = `${name} (${i})`;
  }

  const div = document.createElement("div");
  div.className = "assignment-preview";
  div.setAttribute("data-assignment", finalName);
  div.setAttribute("data-date", dueDate || "");
  div.setAttribute("data-color", color);

  div.innerHTML = `
    <strong style="color:${escapeHtml(color)};">■ ${escapeHtml(finalName)}</strong><br><br>
    <b>Class:</b> ${escapeHtml(className)}<br>
    <b>Due Date:</b> ${escapeHtml(dueDate)}<br>
    <b>Notes:</b> ${escapeHtml(notes)}
  `;

  const btn = document.createElement("button");
  btn.className = "deleteBtn";
  btn.type = "button";
  btn.textContent = "Delete";
  btn.onclick = () => deleteAssignment(finalName);

  div.appendChild(btn);
  list.appendChild(div);
}

function deleteAssignment(name){
  document.querySelectorAll("#assignmentList .assignment-preview").forEach(node=>{
    if(node.getAttribute("data-assignment") === name) node.remove();
  });
  const list = $("assignmentList");
  if(list && list.children.length === 0) list.innerHTML = "No assignments yet.";
  renderCalendar();
}
window.deleteAssignment = deleteAssignment;

/* -------------------------
   QUIZZES
--------------------------*/
function addQuiz(){
  const nameEl = $("quizName");
  const classSel = $("quizClass");
  const dateEl = $("quizDate");
  const notesEl = $("quizNotes");

  if(!nameEl || !classSel || !dateEl) return;

  const name = nameEl.value.trim();
  const className = classSel.value;
  const date = dateEl.value;
  const notes = notesEl ? notesEl.value.trim() : "";

  if(!name){ alert("Enter a quiz/test name."); return; }

  const selected = classSel.options[classSel.selectedIndex];
  const color = selected ? selected.getAttribute("data-color") || "#000000" : "#000000";

  createQuizEntry(name, className, date, notes, color);

  nameEl.value = "";
  classSel.selectedIndex = 0;
  dateEl.value = "";
  if(notesEl) notesEl.value = "";

  renderCalendar();
}
window.addQuiz = addQuiz;

function createQuizEntry(name, className, date, notes, color){
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
  div.setAttribute("data-date", date || "");
  div.setAttribute("data-color", color);

  div.innerHTML = `
    <strong style="color:${escapeHtml(color)};">■ ${escapeHtml(finalName)}</strong><br><br>
    <b>Class:</b> ${escapeHtml(className)}<br>
    <b>Date:</b> ${escapeHtml(date)}<br>
    <b>Notes:</b> ${escapeHtml(notes)}
  `;

  const btn = document.createElement("button");
  btn.className = "deleteBtn";
  btn.type = "button";
  btn.textContent = "Delete";
  btn.onclick = () => deleteQuiz(finalName);

  div.appendChild(btn);
  list.appendChild(div);
}

function deleteQuiz(name){
  document.querySelectorAll("#quizList .quiz-preview").forEach(node=>{
    if(node.getAttribute("data-quiz") === name) node.remove();
  });
  const list = $("quizList");
  if(list && list.children.length === 0) list.innerHTML = "No quizzes or tests yet.";
  renderCalendar();
}
window.deleteQuiz = deleteQuiz;

/* -------------------------
   EXPORT / IMPORT
--------------------------*/
function exportData(){
  const classes = Array.from(document.querySelectorAll("#classList .class-preview")).map(node => ({
    name: node.getAttribute("data-class"),
    days: JSON.parse(node.getAttribute("data-days") || "[]"),
    start: node.getAttribute("data-start"),
    end: node.getAttribute("data-end"),
    color: node.getAttribute("data-color")
  }));

  const assignments = Array.from(document.querySelectorAll("#assignmentList .assignment-preview")).map(node => ({
    name: node.getAttribute("data-assignment"),
    date: node.getAttribute("data-date"),
    color: node.getAttribute("data-color"),
    text: node.innerText || ""
  }));

  const quizzes = Array.from(document.querySelectorAll("#quizList .quiz-preview")).map(node => ({
    name: node.getAttribute("data-quiz"),
    date: node.getAttribute("data-date"),
    color: node.getAttribute("data-color"),
    text: node.innerText || ""
  }));

  const payload = { exportedAt: new Date().toISOString(), classes, assignments, quizzes };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student_planner_export_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
window.exportData = exportData;

function triggerImport(){
  const input = $("importFile");
  if(!input) return;
  input.value = "";
  input.click();
}
window.triggerImport = triggerImport;

function importDataFromInput(event){
  const file = event && event.target && event.target.files && event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const data = JSON.parse(e.target.result);
      clearAllData();

      if(Array.isArray(data.classes)){
        data.classes.forEach(c => {
          createClassEntry(c.name || "Imported Class", c.color || "#000000", c.days || [], c.start || "", c.end || "");
        });
      }
      if(Array.isArray(data.assignments)){
        data.assignments.forEach(a => {
          createAssignmentEntry(a.name || "Imported Assignment", "", a.date || "", "", a.color || "#000000");
        });
      }
      if(Array.isArray(data.quizzes)){
        data.quizzes.forEach(q => {
          createQuizEntry(q.name || "Imported Quiz", "", q.date || "", "", q.color || "#000000");
        });
      }

      renderCalendar();
      alert("Import successful.");
    } catch(err){
      console.error(err);
      alert("Failed to import. Make sure the file is a valid export JSON.");
    }
  };
  reader.readAsText(file);
}

function clearAllData(){
  const classList = $("classList");
  const assignmentList = $("assignmentList");
  const quizList = $("quizList");
  if(classList) classList.innerHTML = "No classes added yet.";
  if(assignmentList) assignmentList.innerHTML = "No assignments yet.";
  if(quizList) quizList.innerHTML = "No quizzes or tests yet.";

  ["assignmentClass","quizClass"].forEach(id=>{
    const sel = $(id);
    if(sel) sel.innerHTML = `<option value="">Select Class</option>`;
  });
}

/* -------------------------
   CALENDAR RENDERING
--------------------------*/
function renderCalendar(){
  const grid = $("calendarGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const monthLabel = $("monthLabel");
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  if(monthLabel) monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // leading blanks
  for(let i=0;i<firstDay;i++){
    const blank = document.createElement("div");
    blank.className = "calendar-day";
    grid.appendChild(blank);
  }

  for(let day=1; day<=daysInMonth; day++){
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const dateObj = new Date(currentYear, currentMonth, day);
    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dateObj.getDay()];
    const isoDate = isoDateFromParts(currentYear, currentMonth, day);

    // CLASS EVENTS
    document.querySelectorAll("#classList .class-preview").forEach(c => {
      try{
        const days = JSON.parse(c.getAttribute("data-days") || "[]");
        if(days.includes(weekday)){
          const start = c.getAttribute("data-start") || "";
          const end = c.getAttribute("data-end") || "";
          const cname = c.getAttribute("data-class") || "";
          const event = document.createElement("div");
          event.className = "event";
          event.style.background = "black";
          event.style.color = "white";

          const icon = document.createElement("span");
          icon.className = "icon";
          icon.textContent = "📘";

          const text = document.createElement("span");
          text.textContent = `${cname} (${start} - ${end})`;

          event.appendChild(icon);
          event.appendChild(text);
          cell.appendChild(event);
        }
      } catch(e){
        // ignore malformed data-days
      }
    });

    // ASSIGNMENTS
    document.querySelectorAll("#assignmentList .assignment-preview").forEach(a => {
      const aDate = a.getAttribute("data-date") || "";
      if(aDate === isoDate){
        const name = a.getAttribute("data-assignment") || "";
        const event = document.createElement("div");
        event.className = "event";
        event.style.background = "black";
        event.style.color = "white";
        event.innerHTML = `<span class="icon">📄</span> ${escapeHtml(name)}`;
        cell.appendChild(event);
      }
    });

    // QUIZZES
    document.querySelectorAll("#quizList .quiz-preview").forEach(q => {
      const qDate = q.getAttribute("data-date") || "";
      if(qDate === isoDate){
        const name = q.getAttribute("data-quiz") || "";
        const event = document.createElement("div");
        event.className = "event";
        event.style.background = "black";
        event.style.color = "white";
        event.innerHTML = `<span class="icon">⚠️</span> ${escapeHtml(name)}`;
        cell.appendChild(event);
      }
    });

    grid.appendChild(cell);
  }
}

/* -------------------------
   NAVIGATION
--------------------------*/
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

/* -------------------------
   INITIALIZE ON DOM READY
--------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // Ensure placeholders exist
  if($("classList") && $("classList").innerHTML.trim() === "") $("classList").innerHTML = "No classes added yet.";
  if($("assignmentList") && $("assignmentList").innerHTML.trim() === "") $("assignmentList").innerHTML = "No assignments yet.";
  if($("quizList") && $("quizList").innerHTML.trim() === "") $("quizList").innerHTML = "No quizzes or tests yet.";

  // Wire import file input
  const importFile = $("importFile");
  if(importFile){
    importFile.addEventListener("change", importDataFromInput);
  }

  // Expose functions used by inline attributes (already attached to window above)
  window.updateColorPreview = updateColorPreview;
  window.addClass = addClass;
  window.addAssignment = addAssignment;
  window.addQuiz = addQuiz;
  window.exportData = exportData;
  window.triggerImport = triggerImport;

  // Initial render and show assignments tab
  renderCalendar();
  showTab("assignments");
});
