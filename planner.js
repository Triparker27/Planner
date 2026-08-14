/* -------------------------
   STATE: current calendar month/year
--------------------------*/
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

function createClassEntry(className, classColor){
    let existing = document.querySelectorAll("#classList .class-preview");
    for(let i=0;i<existing.length;i++){
        if(existing[i].getAttribute("data-class") === className){
            return;
        }
    }

    let classList = document.getElementById("classList");
    if(classList.innerHTML.trim() === "No classes added yet."){
        classList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "class-preview";
    div.setAttribute("data-class", className);

    let span = document.createElement("span");
    span.style.color = classColor;
    span.style.fontWeight = "bold";
    span.innerText = "■ " + className;

    let btn = document.createElement("button");
    btn.className = "deleteBtn";
    btn.innerText = "Delete";
    btn.onclick = function(){ deleteClass(className); };

    div.appendChild(span);
    div.appendChild(btn);
    classList.appendChild(div);

    let option1 = document.createElement("option");
    option1.value = className;
    option1.text = className;
    option1.setAttribute("data-color", classColor);
    document.getElementById("assignmentClass").appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = className;
    option2.text = className;
    option2.setAttribute("data-color", classColor);
    document.getElementById("quizClass").appendChild(option2);
}

function addClass(){
    let className = document.getElementById("className").value;
    let classColor = document.getElementById("classColor").value;

    if(className.trim() === ""){
        alert("Enter a class name.");
        return;
    }

    createClassEntry(className, classColor);
    document.getElementById("className").value = "";
}

function deleteClass(className){
    let classList = document.getElementById("classList");
    let items = classList.querySelectorAll(".class-preview");

    items.forEach(item => {
        if(item.getAttribute("data-class") === className){
            item.remove();
        }
    });

    if(classList.children.length === 0){
        classList.innerHTML = "No classes added yet.";
    }

    let dropdown1 = document.getElementById("assignmentClass");
    for(let i = 0; i < dropdown1.options.length; i++){
        if(dropdown1.options[i].value === className){
            dropdown1.remove(i);
            break;
        }
    }

    let dropdown2 = document.getElementById("quizClass");
    for(let i = 0; i < dropdown2.options.length; i++){
        if(dropdown2.options[i].value === className){
            dropdown2.remove(i);
            break;
        }
    }

    renderCalendar();
}

/* -------------------------
   ASSIGNMENTS
--------------------------*/
function createAssignmentEntry(name, className, dueDate, notes, classColor){
    let existing = document.querySelectorAll("#assignmentList .assignment-preview");
    for(let i=0;i<existing.length;i++){
        if(existing[i].getAttribute("data-assignment") === name){
            name = name + " (imported)";
            break;
        }
    }

    let assignmentList = document.getElementById("assignmentList");
    if(assignmentList.innerHTML.trim() === "No assignments yet."){
        assignmentList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "assignment-preview";
    div.setAttribute("data-assignment", name);
    div.setAttribute("data-date", dueDate || "");
    div.setAttribute("data-color", classColor || "white");

    let strong = document.createElement("strong");
    strong.style.color = classColor || "white";
    strong.innerText = "■ " + name;

    div.appendChild(strong);
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createElement("br"));

    let bClass = document.createElement("b");
    bClass.innerText = "Class:";
    div.appendChild(bClass);
    div.appendChild(document.createTextNode(" " + (className || "")));
    div.appendChild(document.createElement("br"));

    let bDue = document.createElement("b");
    bDue.innerText = "Due Date:";
    div.appendChild(bDue);
    div.appendChild(document.createTextNode(" " + (dueDate || "")));
    div.appendChild(document.createElement("br"));

    let bNotes = document.createElement("b");
    bNotes.innerText = "Notes:";
    div.appendChild(bNotes);
    div.appendChild(document.createTextNode(" " + (notes || "")));
    div.appendChild(document.createElement("br"));

    let btn = document.createElement("button");
    btn.className = "deleteBtn";
    btn.innerText = "Delete";
    btn.onclick = function(){ deleteAssignment(name); };

    div.appendChild(btn);
    assignmentList.appendChild(div);
}

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
    let classColor = selectedOption ? selectedOption.getAttribute("data-color") : "white";

    createAssignmentEntry(name, className, dueDate, notes, classColor);

    document.getElementById("assignmentName").value = "";
    document.getElementById("assignmentClass").selectedIndex = 0;
    document.getElementById("assignmentDue").value = "";
    document.getElementById("assignmentNotes").value = "";

    renderCalendar();
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
   QUIZZES / TESTS
--------------------------*/
function createQuizEntry(name, className, date, notes, classColor){
    let existing = document.querySelectorAll("#quizList .quiz-preview");
    for(let i=0;i<existing.length;i++){
        if(existing[i].getAttribute("data-quiz") === name){
            name = name + " (imported)";
            break;
        }
    }

    let quizList = document.getElementById("quizList");
    if(quizList.innerHTML.trim() === "No quizzes or tests yet."){
        quizList.innerHTML = "";
    }

    let div = document.createElement("div");
    div.className = "quiz-preview";
    div.setAttribute("data-quiz", name);
    div.setAttribute("data-date", date || "");
    div.setAttribute("data-color", classColor || "white");

    let strong = document.createElement("strong");
    strong.style.color = classColor || "white";
    strong.innerText = "■ " + name;

    div.appendChild(strong);
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createElement("br"));

    let bClass = document.createElement("b");
    bClass.innerText = "Class:";
    div.appendChild(bClass);
    div.appendChild(document.createTextNode(" " + (className || "")));
    div.appendChild(document.createElement("br"));

    let bDate = document.createElement("b");
    bDate.innerText = "Date:";
    div.appendChild(bDate);
    div.appendChild(document.createTextNode(" " + (date || "")));
    div.appendChild(document.createElement("br"));

    let bNotes = document.createElement("b");
    bNotes.innerText = "Notes:";
    div.appendChild(bNotes);
    div.appendChild(document.createTextNode(" " + (notes || "")));
    div.appendChild(document.createElement("br"));

    let btn = document.createElement("button");
    btn.className = "deleteBtn";
    btn.innerText = "Delete";
    btn.onclick = function(){ deleteQuiz(name); };

    div.appendChild(btn);
    quizList.appendChild(div);
}

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
    let classColor = selectedOption ? selectedOption.getAttribute("data-color") : "white";

    createQuizEntry(name, className, date, notes, classColor);

    document.getElementById("quizName").value = "";
    document.getElementById("quizClass").selectedIndex = 0;
    document.getElementById("quizDate").value = "";
    document.getElementById("quizNotes").value = "";

    renderCalendar();
}

function deleteQuiz(name){
    let list = document.getElementById("quizList");
    let items = list.querySelectorAll(".quiz-preview");

    items.forEach(item => {
        if(item.getAttribute("data-quiz") === name){
            item.remove();
        }
    });

    if(list.children.length === 0){
        list.innerHTML = "No quizzes or tests yet.";
    }

    renderCalendar();
}

/* -------------------------
   EXPORT / IMPORT SYSTEM
--------------------------*/
function exportData(){
    let classes = [];
    let classNodes = document.querySelectorAll("#classList .class-preview");
    classNodes.forEach(node => {
        let name = node.getAttribute("data-class");
        let color = "white";

        let opts = document.getElementById("assignmentClass").options;
        for(let i=0;i<opts.length;i++){
            if(opts[i].value === name){
                color = opts[i].getAttribute("data-color") || color;
                break;
            }
        }

        classes.push({ name: name, color: color });
    });

    let assignments = [];
    let aNodes = document.querySelectorAll("#assignmentList .assignment-preview");
    aNodes.forEach(node => {
        assignments.push({
            name: node.getAttribute("data-assignment") || "",
            class: node.querySelector("b").nextSibling.nodeValue.trim(),
            date: node.getAttribute("data-date") || "",
            notes: extractNotes(node.innerText),
            color: node.getAttribute("data-color") || ""
        });
    });

    let quizzes = [];
    let qNodes = document.querySelectorAll("#quizList .quiz-preview");
    qNodes.forEach(node => {
        quizzes.push({
            name: node.getAttribute("data-quiz") || "",
            class: node.querySelector("b").nextSibling.nodeValue.trim(),
            date: node.getAttribute("data-date") || "",
            notes: extractNotes(node.innerText),
            color: node.getAttribute("data-color") || ""
        });
    });

    let payload = {
        exportedAt: new Date().toISOString(),
        classes: classes,
        assignments: assignments,
        quizzes: quizzes
    };

    let blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "student_planner_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function extractNotes(text){
    let idx = text.indexOf("Notes:");
    if(idx >= 0) return text.substring(idx + 6).trim();
    return "";
}

function triggerImport(){
    document.getElementById("importFile").value = "";
    document.getElementById("importFile").click();
}

function importData(event){
    let file = event.target.files[0];
    if(!file) return;

    let reader = new FileReader();
    reader.onload = function(e){
        try{
            let data = JSON.parse(e.target.result);

            clearAllData();

            if(Array.isArray(data.classes)){
                data.classes.forEach(c => {
                    createClassEntry(c.name, c.color || "#1E90FF");
                });
            }

            if(Array.isArray(data.assignments)){
                data.assignments.forEach(a => {
                    let color = findColorForClass(a.class) || a.color || "#1E90FF";
                    createAssignmentEntry(a.name, a.class, a.date, a.notes, color);
                });
            }

            if(Array.isArray(data.quizzes)){
                data.quizzes.forEach(q => {
                    let color = findColorForClass(q.class) || q.color || "#1E90FF";
                    createQuizEntry(q.name, q.class, q.date, q.notes, color);
                });
            }

            renderCalendar();
            alert("Import successful.");
        } catch(err){
            alert("Import failed. Invalid file.");
        }
    };
    reader.readAsText(file);
}

function clearAllData(){
    document.getElementById("classList").innerHTML = "No classes added yet.";
    document.getElementById("assignmentClass").innerHTML = "<option value=''>Select Class</option>";
    document.getElementById("quizClass").innerHTML = "<option value=''>Select Class</option>";
    document.getElementById("assignmentList").innerHTML = "No assignments yet.";
    document.getElementById("quizList").innerHTML = "No quizzes or tests yet.";
}

function findColorForClass(className){
    let opts = document.getElementById("assignmentClass").options;
    for(let i=0;i<opts.length;i++){
        if(opts[i].value === className){
            return opts[i].getAttribute("data-color");
        }
    }
    return null;
}

/* -------------------------
   CALENDAR SYSTEM
--------------------------*/
function renderCalendar(){

    let grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    let monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    document.getElementById("monthLabel").innerText =
        `${monthNames[currentMonth]} ${currentYear}`;

    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for(let i = 0; i < firstDay; i++){
        grid.innerHTML += "<div class='calendar-day'></div>";
    }

    for(let day = 1; day <= daysInMonth; day++){
        let dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        let cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.innerHTML = `<div class='day-number'>${day}</div>`;

        let assignments = document.querySelectorAll(".assignment-preview");
        assignments.forEach(a => {
            if(a.getAttribute("data-date") === dateStr){
                let color = a.getAttribute("data-color");
                let name = a.getAttribute("data-assignment");

                let event = document.createElement("div");
                event.className = "event";
                event.style.background = color;
                event.innerText = name;

                cell.appendChild(event);
            }
        });

        let quizzes = document.querySelectorAll(".quiz-preview");
        quizzes.forEach(q => {
            if(q.getAttribute("data-date") === dateStr){
                let color = q.getAttribute("data-color");
                let name = q.getAttribute("data-quiz");

                let event = document.createElement("div");
                event.className = "event";
                event.style.background = color;

                let icon = document.createElement("span");
                icon.className = "icon";
                icon.innerText = "⚠️";

                let text = document.createElement("span");
                text.innerText = name;

                event.appendChild(icon);
                event.appendChild(text);

                cell.appendChild(event);
            }
        });

        grid.appendChild(cell);
    }
}

function prevMonth(){
    currentMonth--;
    if(currentMonth < 0){
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth(){
    currentMonth++;
    if(currentMonth > 11){
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

/* -------------------------
   INITIALIZE
--------------------------*/
renderCalendar();
showTab("assignments");
