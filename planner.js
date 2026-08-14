/* FULL UPDATED planner.js WITH ASSIGNMENT + QUIZ ICONS + MODAL EVENTS */

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
  if(list.innerHTML.trim() === "No classes added yet.") list.innerHTML = "";

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
    for(let i = sel.options.length - 1; i >= 0; i--){
      if(sel.options[i].value === name) sel.remove(i);
    }
  });

  const list = $("classList");
  if(list.children.length === 0) list.innerHTML = "No classes added yet.";
  renderCalendar();
}
window.deleteClass = deleteClass;

function clearClassForm(){
  $("className").value = "";
  $("classStart").value = "";
  $("classEnd").value = "";
  $("classDay1").selectedIndex = 0;
  $("classDay2").selectedIndex = 0;
  updateColorPreview();
}

/* ASSIGNMENTS */
function addAssignment(){
  const name = $("assignmentName").value.trim();
  const cls = $("assignmentClass").value;
  const due = $("assignmentDue").value;
  const time = $("assignmentTime").value;
  const notes = $("assignmentNotes").value.trim();

  if(!name){ alert("Enter assignment name."); return; }

  const list = $("assignmentList");
  if(list.innerHTML.trim() === "No assignments yet.") list.innerHTML = "";

  const div = document.createElement("div");
  div.className = "assignment-preview";
  div.setAttribute("data-class", cls);
  div.setAttribute("data-date", due);

  div.innerHTML = `
    <div>
      <div><strong>${escape
