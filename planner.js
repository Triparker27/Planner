let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

/* -------------------------
   TAB SWITCHING
--------------------------*/
function showTab(tabId){
    document.getElementById("assignments").style.display = "none";
    document.getElementById("classes").style.display = "none";
    document.getElementById("tests").style.display = "none";
    document.getElementById("calendar").style.display = "none";
    document.getElementById(tabId).style.display = "block";
}

/* -------------------------
   CLASS MANAGEMENT
--------------------------*/
function updateColorPreview(){
    let color = document.getElementById("classColor").value;
    document.getElementById("colorPreview").style.background = color;
}

function addClass(){
    let name = document.getElementById("className").value;
    let color = document.getElementById("classColor").value;

    let days = [];
    document.querySelectorAll(".classDay:checked").forEach(d => days.push(d.value));

    let start = document.getElementById("classStart").value;
    let end = document.getElementById("classEnd").value;

    if(name.trim() === ""){
        alert("Enter a class name.");
        return;
    }

    if(days.length === 0){
        alert("Select at least one day.");
        return;
    }

    if(!start || !end){
        alert("Enter class start and end time.");
        return;
    }

    createClassEntry(name, color, days, start, end);

    document.getElementById("className").value = "";
    document.getElementById("classStart").value = "";
    document.getElementById("classEnd").value = "";
    document.querySelectorAll(".classDay").forEach(d => d.checked = false);

    renderCalendar();
}

function createClassEntry(name, color, days, start, end){
    let classList = document.getElementById("classList");

    if(classList.innerHTML.trim() === "No classes added yet."){
        classList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "class-preview";
    div.setAttribute("data-class", name);
    div.setAttribute("data-days", JSON.stringify(days));
    div.setAttribute("data-start", start);
    div.setAttribute("data-end", end);
    div.setAttribute("data-color", color);

    div.innerHTML = `
        <span style="color:${color};font-weight:bold;">■ ${name}</span><br>
        <b>Days:</b> ${days.join(", ")}<br>
        <b>Time:</b> ${start} - ${end}
        <button class="deleteBtn" onclick="deleteClass('${name}')">Delete</button>
    `;

    classList.appendChild(div);

    let option1 = document.createElement("option");
    option1.value = name;
    option1.text = name;
    option1.setAttribute("data-color", color);
    document.getElementById("assignmentClass").appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = name;
    option2.text = name;
    option2.setAttribute("data-color", color);
    document.getElementById("quizClass").appendChild(option2);
}

function deleteClass(name){
    let classList = document.getElementById("classList");
    let items = classList.querySelectorAll(".class-preview");

    items.forEach(item => {
        if(item.getAttribute("data-class") === name){
            item.remove();
        }
    });

    if(classList.children.length === 0){
        classList.innerHTML = "No classes added yet.";
    }

    let dropdown1 = document.getElementById("assignmentClass");
    for(let i=0;i<dropdown1.options.length;i++){
        if(dropdown1.options[i].value === name){
            dropdown1.remove(i);
            break;
        }
    }

    let dropdown2 = document.getElementById("quizClass");
    for(let i=0;i<dropdown2.options.length;i++){
        if(dropdown2.options[i].value === name){
            dropdown2.remove(i);
            break;
        }
    }

    renderCalendar();
}

/* -------------------------
   ASSIGNMENTS
--------------------------*/
function addAssignment(){
    let name = document.getElementById("assignmentName").value;
    let classDropdown = document.getElementById("assignmentClass");
    let className = classDropdown.value;
    let dueDate = document.getElementById("assignmentDue").value;
    let notes = document.getElementById("assignmentNotes").value;

    if(name.trim() === ""){
        alert("Enter an assignment name.");
        return;
    }

    let selectedOption = classDropdown.options[classDropdown.selectedIndex];
    let color = selectedOption ? selectedOption.getAttribute("data-color") : "white";

    createAssignmentEntry(name, className, dueDate, notes, color);

    document.getElementById("assignmentName").value = "";
    document.getElementById("assignmentClass").selectedIndex = 0;
    document.getElementById("assignmentDue").value = "";
    document.getElementById("assignmentNotes").value = "";

    renderCalendar();
}

function createAssignmentEntry(name, className, dueDate, notes, color){
    let assignmentList = document.getElementById("assignmentList");

    if(assignmentList.innerHTML.trim() === "No assignments yet."){
        assignmentList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "assignment-preview";
    div.setAttribute("data-assignment", name);
    div.setAttribute("data-date", dueDate);
    div.setAttribute("data-color", color);

    div.innerHTML = `
        <strong style="color:${color};">■ ${name}</strong><br><br>
        <b>Class:</b> ${className}<br>
        <b>Due Date:</b> ${dueDate}<br>
        <b>Notes:</b> ${notes}<br>
        <button class="deleteBtn" onclick="deleteAssignment('${name}')">Delete</button>
    `;

    assignmentList.appendChild(div);
}

function deleteAssignment(name){
    let list = document.getElementById("assignmentList");
    let items = list.querySelectorAll(".assignment-preview");

    items.forEach(item => {
        if(item.getAttribute("data-assignment") === name){
            item.remove();
        }
    });

    if(list.children.length === 0){
        list.innerHTML = "No assignments yet.";
    }

    renderCalendar();
}

/* -------------------------
   QUIZZES
--------------------------*/
function addQuiz(){
    let name = document.getElementById("quizName").value;
    let classDropdown = document.getElementById("quizClass");
    let className = classDropdown.value;
    let date = document.getElementById("quizDate").value;
    let notes = document.getElementById("quizNotes").value;

    if(name.trim() === ""){
        alert("Enter a quiz/test name.");
        return;
    }

    let selectedOption = classDropdown.options[classDropdown.selectedIndex];
    let color = selectedOption ? selectedOption.getAttribute("data-color") : "white";

    createQuizEntry(name, className, date, notes, color);

    document.getElementById("quizName").value = "";
    document.getElementById("quizClass").selectedIndex = 0;
    document.getElementById("quizDate").value = "";
    document.getElementById("quizNotes").value = "";

    renderCalendar();
}

function createQuizEntry(name, className, date, notes, color){
    let quizList = document.getElementById("quizList");

    if(quizList.innerHTML.trim() === "No quizzes or tests yet."){
        quizList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "quiz-preview";
    div.setAttribute("data-quiz", name);
    div.setAttribute("data-date", date);
    div.setAttribute("data
