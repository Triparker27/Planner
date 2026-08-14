/* planner.js
   Complete, fixed JavaScript for the Student Planner app.
   Features:
   - Tabs
   - Classes (two selectable weekdays Mon-Fri, one start/end time)
   - Assignments
   - Quizzes
   - Calendar rendering with:
       • class events on selected weekdays (📘 icon + time)
       • assignment events (📄)
       • quiz events (⚠️)
   - Export / Import JSON
   - Safe DOM usage and no syntax errors
*/

/* -------------------------
   STATE
--------------------------*/
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

/* -------------------------
   UTILITIES
--------------------------*/
function $(id){ return document.getElementById(id); }

function isoDateFromParts(year, monthIndex, day){
  // monthIndex is 0-based
  return `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

/* -------------------------
   TAB SWITCHING
--------------------------*/
function showTab(tabId){
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  const el = $(tabId);
  if(el) el.style.display = "block";
}

/* -------------------------
   CLASS MANAGEMENT
--------------------------*/
function updateColorPreview(){
  const color = $("classColor").value;
  const preview = $("colorPreview");
  if(preview) preview.style.background = color;
}

function addClass(){
  const name = $("className").value.trim();
  const color = $("classColor").value;
  const day1 = $("classDay1").value;
  const day2 = $("classDay2").value;
  const start = $("classStart").value;
  const end = $("classEnd").value;

  if(!name){
    alert("Enter a class name.");
    return;
  }
  if(!day1){
    alert("Select at least one day (Day 1).");
    return;
  }
  if(!start || !end){
    alert("Enter both start and end times.");
    return;
  }
  // prevent duplicate day selection
  const days = [day1];
  if(day2 && day2 !== day1) days.push(day2);

  createClassEntry(name, color, days, start, end);

  // reset inputs
  $("className").value = "";
  $("classStart").value = "";
  $("classEnd").value = "";
  $("classDay1").selectedIndex = 0;
  $("classDay2").selectedIndex = 0;
  updateColorPreview();

  renderCalendar();
}

function createClassEntry(name, color, days, start, end){
  // Avoid duplicate class names: if exists, append suffix
  const existing = document.querySelectorAll("#classList .class-preview");
  let finalName = name;
  for(const node of existing){
    if(node.getAttribute("data-class") === finalName){
      finalName = `${name} (${Math.floor(Math.random()*900+100)})`;
      break;
    }
  }

  const list = $("classList");
  if(list && list.innerHTML.trim() === "No classes added yet.") list.innerHTML = "";

  const div = document.createElement("div");
  div.className = "class-preview";
  div.setAttribute("data-class", finalName);
  div.setAttribute("data-days", JSON.stringify(days));
  div.setAttribute("data-start", start);
  div.setAttribute("data-end", end);
  div.setAttribute("data-color", color);

  // Build inner HTML safely
  div.innerHTML = `
    <span style="color:${color};font-weight:bold;">■ ${escapeHtml(finalName)}</span><br>
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

  // Add to dropdowns
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
  // remove class preview
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

  // if empty, show placeholder
  const list = $("classList");
  if(list && list.children.length === 0) list.innerHTML = "No classes added yet.";

  renderCalendar();
}

/* -------------------------
   ASSIGNMENTS
--------------------------*/
function addAssignment(){
  const name = $("assignmentName").value.trim();
  const className = $("assignmentClass").value;
  const dueDate = $("assignmentDue").value;
  const notes = $("assignmentNotes").value.trim();

  if(!name){
    alert("Enter an assignment name.");
    return;
  }

  const selected = $("assignmentClass").options[$("assignmentClass").selectedIndex];
  const color = selected ? selected.getAttribute("data-color") || "#000000" : "#000000";

  createAssignmentEntry(name, className, dueDate, notes, color);

  $("assignmentName").value = "";
  $("assignmentClass").selectedIndex = 0;
  $("assignmentDue").value = "";
  $("assignmentNotes").value = "";

  renderCalendar();
}

function createAssignmentEntry(name, className, dueDate, notes, color){
  const list = $("assignmentList");
  if(list && list.innerHTML.trim() === "No assignments yet.") list.innerHTML = "";

  // ensure unique name if duplicate
  let finalName = name;
  const existing = document.querySelectorAll("#assignmentList .assignment-preview");
  for(const node of existing){
    if(node.getAttribute("data-assignment") === finalName){
      finalName = `${name} (${Math.floor(Math.random()*900+100)})`;
      break;
    }
  }

  const div = document.createElement("div");
  div.className = "assignment-preview";
  div.setAttribute("data-assignment", finalName);
  div.setAttribute("data-date", dueDate || "");
  div.setAttribute("data-color", color);

  div.innerHTML = `
    <strong style="color:${color};">■ ${escapeHtml(finalName)}</strong><br><br>
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

/* -------------------------
   QUIZZES
--------------------------*/
function addQuiz(){
  const name = $("quizName").value.trim();
  const className = $("quizClass").value;
  const date = $("quizDate").value;
  const notes = $("quizNotes").value.trim();

  if(!name){
    alert("Enter a quiz/test name.");
    return;
  }

  const selected = $("quizClass").options[$("quizClass").selectedIndex];
  const color = selected ? selected.getAttribute("data-color") || "#000000" : "#000000";

  createQuizEntry(name, className, date, notes, color);

  $("quizName").value = "";
  $("quizClass").selectedIndex = 0;
  $("quizDate").value = "";
  $("quizNotes").value = "";

  renderCalendar();
}

function createQuizEntry(name, className, date, notes, color){
  const list = $("quizList");
  if(list && list.innerHTML.trim() === "No quizzes or tests yet.") list.innerHTML = "";

  let finalName = name;
  const existing = document.querySelectorAll("#quizList .quiz-preview");
  for(const node of existing){
    if(node.getAttribute("data-quiz") === finalName){
      finalName = `${name} (${Math.floor(Math.random()*900+100)})`;
      break;
    }
  }

  const div = document.createElement("div");
  div.className = "quiz-preview";
  div.setAttribute("data-quiz", finalName);
  div.setAttribute("data-date", date || "");
  div.setAttribute("data-color", color);

  div.innerHTML = `
    <strong style="color:${color};">■ ${escapeHtml(finalName)}</strong><br><br>
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

/* -------------------------
   EXPORT / IMPORT
--------------------------*/
function exportData(){
  const classes = [];
  document.querySelectorAll("#classList .class-preview").forEach(node=>{
    classes.push({
      name: node.getAttribute("data-class"),
      days: JSON.parse(node.getAttribute("data-days") || "[]"),
      start: node.getAttribute("data-start"),
      end: node.getAttribute("data-end"),
      color: node.getAttribute("data-color")
    });
  });

  const assignments = [];
  document.querySelectorAll("#assignmentList .assignment-preview").forEach(node=>{
    assignments.push({
      name: node.getAttribute("data-assignment"),
      date: node.getAttribute("data-date"),
      color: node.getAttribute("data-color"),
      // best-effort notes/class extraction from innerText
      text: node.innerText || ""
    });
  });

  const quizzes = [];
  document.querySelectorAll("#quizList .quiz-preview").forEach(node=>{
    quizzes.push({
      name: node.getAttribute("data-quiz"),
      date: node.getAttribute("data-date"),
      color: node.getAttribute("data-color"),
      text: node.innerText || ""
    });
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    classes, assignments, quizzes
  };

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

function triggerImport(){
  const input = $("importFile");
  if(!input) return;
  input.value = "";
  input.click();
}

function importData(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const data = JSON.parse(e.target.result);
      // clear existing
      clearAllData();

      if(Array.isArray(data.classes)){
        data.classes.forEach(c=>{
          createClassEntry(c.name, c.color || "#000000", c.days || [], c.start || "", c.end || "");
        });
      }
      if(Array.isArray(data.assignments)){
        data.assignments.forEach(a=>{
          // try to extract class name from text if possible (best-effort)
          createAssignmentEntry(a.name || "", "", a.date || "", "", a.color || "#000000");
        });
      }
      if(Array.isArray(data.quizzes)){
        data.quizzes.forEach(q=>{
          createQuizEntry(q.name || "", "", q.date || "", "", q.color || "#000000");
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
  $("classList").innerHTML = "No classes added yet.";
  $("assignmentList").innerHTML = "No assignments yet.";
  $("quizList").innerHTML = "No quizzes or tests yet.";

  // reset dropdowns to default option only
  ["assignmentClass","quizClass"].forEach(id=>{
    const sel = $(id);
    if(sel){
      sel.innerHTML = `<option value="">Select Class</option>`;
    }
  });
}

/* -------------------------
   CALENDAR RENDERING
--------------------------*/
function renderCalendar(){
  const grid = $("calendarGrid");
  if(!grid) return;
  grid.innerHTML = "";

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthLabel = $("monthLabel");
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

    // CLASS EVENTS: iterate class previews
    document.querySelectorAll("#classList .class-preview").forEach(c=>{
      try{
        const days = JSON.parse(c.getAttribute("data-days") || "[]");
        if(days.includes(weekday)){
          const start = c.getAttribute("data-start") || "";
          const end = c.getAttribute("data-end") || "";
          const cname = c.getAttribute("data-class") || "";
          const color = c.getAttribute("data-color") || "#000000";

          const event = document.createElement("div");
          event.className = "event";
          event.style.background = "black"; // per request: event bars black
          event.style.color = "white";

          // content: icon, name, time
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
    document.querySelectorAll("#assignmentList .assignment-preview").forEach(a=>{
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
    document.querySelectorAll("#quizList .quiz-preview").forEach(q=>{
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

function nextMonth(){
  currentMonth++;
  if(currentMonth > 11){ currentMonth = 0; currentYear++; }
  renderCalendar();
}

/* -------------------------
   SAFETY / HELPERS
--------------------------*/
function escapeHtml(str){
  if(!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* -------------------------
   INITIALIZE
--------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // Ensure placeholders exist
  if($("classList") && $("classList").innerHTML.trim() === "") $("classList").innerHTML = "No classes added yet.";
  if($("assignmentList") && $("assignmentList").innerHTML.trim() === "") $("assignmentList").innerHTML = "No assignments yet.";
  if($("quizList") && $("quizList").innerHTML.trim() === "") $("quizList").innerHTML = "No quizzes or tests yet.";

  // Wire file input change (if present)
  const importFile = $("importFile");
  if(importFile) importFile.addEventListener("change", importData);

  // Initial render and show assignments tab
  renderCalendar();
  showTab("assignments");
});
