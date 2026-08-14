let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

/* -------------------------
   TAB SWITCHING
--------------------------*/
function showTab(tabId){
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(tabId).style.display = "block";
}

/* -------------------------
   CLASS MANAGEMENT
--------------------------*/
function updateColorPreview(){
    document.getElementById("colorPreview").style.background =
        document.getElementById("classColor").value;
}

function addClass(){
    let name = document.getElementById("className").value;
    let color = document.getElementById("classColor").value;

    let day1 = document.getElementById("classDay1").value;
    let day2 = document.getElementById("classDay2").value;

    let start = document.getElementById("classStart").value;
    let end = document.getElementById("classEnd").value;

    if(!name){ alert("Enter class name."); return; }
    if(!day1){ alert("Select at least one day."); return; }
    if(!start || !end){ alert("Enter class time."); return; }

    let days = [day1];
    if(day2) days.push(day2);

    createClassEntry(name, color, days, start, end);
    renderCalendar();
}

function createClassEntry(name, color, days, start, end){
    let list = document.getElementById("classList");

    if(list.innerHTML.trim() === "No classes added yet.") list.innerHTML = "";

    let div = document.createElement("div");
    div.className = "class-preview";
    div.setAttribute("data-class", name);
    div.setAttribute("data-days", JSON.stringify(days));
    div.setAttribute("data-start", start);
    div.setAttribute("data-end", end);
    div.setAttribute("data-color", color);

    div.innerHTML = `
        <strong style="color:${color};">■ ${name}</strong><br>
        <b>Days:</b> ${days.join(", ")}<br>
        <b>Time:</b> ${start} - ${end}
        <button class="deleteBtn" onclick="deleteClass('${name}')">Delete</button>
    `;

    list.appendChild(div);

    let opt1 = document.createElement("option");
    opt1.value = name;
    opt1.text = name;
    opt1.setAttribute("data-color", color);
    document.getElementById("assignmentClass").appendChild(opt1);

    let opt2 = document.createElement("option");
    opt2.value = name;
    opt2.text = name;
    opt2.setAttribute("data-color", color);
    document.getElementById("quizClass").appendChild(opt2);
}

function deleteClass(name){
    document.querySelectorAll(".class-preview").forEach(c=>{
        if(c.getAttribute("data-class")===name) c.remove();
    });

    renderCalendar();
}

/* -------------------------
   ASSIGNMENTS
--------------------------*/
function addAssignment(){
    let name = assignmentName.value;
    let className = assignmentClass.value;
    let due = assignmentDue.value;
    let notes = assignmentNotes.value;

    if(!name){ alert("Enter assignment name."); return; }

    let color = assignmentClass.options[assignmentClass.selectedIndex].getAttribute("data-color");

    let list = assignmentList;
    if(list.innerHTML.trim()==="No assignments yet.") list.innerHTML="";

    let div = document.createElement("div");
    div.className="assignment-preview";
    div.setAttribute("data-assignment",name);
    div.setAttribute("data-date",due);
    div.setAttribute("data-color",color);

    div.innerHTML=`
        <strong style="color:${color};">■ ${name}</strong><br>
        <b>Class:</b> ${className}<br>
        <b>Due:</b> ${due}<br>
        <b>Notes:</b> ${notes}
    `;

    list.appendChild(div);
    renderCalendar();
}

/* -------------------------
   QUIZZES
--------------------------*/
function addQuiz(){
    let name = quizName.value;
    let className = quizClass.value;
    let date = quizDate.value;
    let notes = quizNotes.value;

    if(!name){ alert("Enter quiz name."); return; }

    let color = quizClass.options[quizClass.selectedIndex].getAttribute("data-color");

    let list = quizList;
    if(list.innerHTML.trim()==="No quizzes or tests yet.") list.innerHTML="";

    let div = document.createElement("div");
    div.className="quiz-preview";
    div.setAttribute("data-quiz",name);
    div.setAttribute("data-date",date);
    div.setAttribute("data-color",color);

    div.innerHTML=`
        <strong style="color:${color};">■ ${name}</strong><br>
        <b>Class:</b> ${className}<br>
        <b>Date:</b> ${date}<br>
        <b>Notes:</b> ${notes}
    `;

    list.appendChild(div);
    renderCalendar();
}

/* -------------------------
   CALENDAR SYSTEM
--------------------------*/
function renderCalendar(){
    let grid = document.getElementById("calendarGrid");
    grid.innerHTML="";

    let monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
    monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    let firstDay = new Date(currentYear,currentMonth,1).getDay();
    let daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();

    for(let i=0;i<firstDay;i++){
        grid.innerHTML += `<div class="calendar-day"></div>`;
    }

    for(let day=1;day<=daysInMonth;day++){
        let cell = document.createElement("div");
        cell.className="calendar-day";

        cell.innerHTML = `<div class="day-number">${day}</div>`;

        let dateObj = new Date(currentYear,currentMonth,day);
        let weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dateObj.getDay()];

        /* CLASS EVENTS */
        document.querySelectorAll(".class-preview").forEach(c=>{
            let days = JSON.parse(c.getAttribute("data-days"));
            if(days.includes(weekday)){
                let event = document.createElement("div");
                event.className="event";
                event.innerHTML = `
                    <span class="icon">📘</span>
                    ${c.getAttribute("data-class")} 
                    (${c.getAttribute("data-start")} - ${c.getAttribute("data-end")})
                `;
                cell.appendChild(event);
            }
        });

        /* ASSIGNMENTS */
        document.querySelectorAll(".assignment-preview").forEach(a=>{
            if(a.getAttribute("data-date")===`${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`){
                let event=document.createElement("div");
                event.className="event";
                event.innerHTML=`📄 ${a.getAttribute("data-assignment")}`;
                cell.appendChild(event);
            }
        });

        /* QUIZZES */
        document.querySelectorAll(".quiz-preview").forEach(q=>{
            if(q.getAttribute("data-date")===`${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`){
                let event=document.createElement("div");
                event.className="event";
                event.innerHTML=`⚠️ ${q.getAttribute("data-quiz")}`;
                cell.appendChild(event);
            }
        });

        grid.appendChild(cell);
    }
}

function prevMonth(){
    currentMonth--;
    if(currentMonth<0){ currentMonth=11; currentYear--; }
    renderCalendar();
}

function nextMonth(){
    currentMonth++;
    if(currentMonth>11){ currentMonth=0; currentYear++; }
    renderCalendar();
}

renderCalendar();
showTab("assignments");
