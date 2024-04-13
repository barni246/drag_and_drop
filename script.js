
let currentTasks = [];


function allowDrop(ev) {
  ev.preventDefault();
}


function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  //console.log('dragging elemennt id:', ev.target.id)
}


function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text"); // ID des verschobenen Tasks
  const dropZone = ev.target.id; // ID der Spalte, in die der Task verschoben wird
  const dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id); // Array mit den IDs aller Tasks
  const taskId = data; // Speichert die ID des verschobenen Tasks in der Variable taskId
  const indexOfCurrentTask = currentTasks.findIndex(task => task.id === parseInt(taskId)); // Findet den Index des verschobenen Tasks in der aktuellen Taskliste

  // Überprüft, ob der Task nicht auf sich selbst gezogen wurde und die Ziel-Spalte keine anderen Tasks enthält
  if (dropZone !== data && !dragElements.includes(dropZone)) {
    const task = currentTasks[indexOfCurrentTask]; // Der verschobene Task
    const newColumn = dropZone; // Die Spalte, in die der Task verschoben wird
    const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn); // Alle Tasks in der Ziel-Spalte
    let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.taskIndex)); // Findet den höchsten taskIndex-Wert in der Ziel-Spalte
    maxTaskIndex++; // Inkrementiert den höchsten taskIndex-Wert um 1, um den neuen taskIndex für den verschobenen Task zu bestimmen
    task.column = newColumn; // Aktualisiert die Spalte des verschobenen Tasks
    task.taskIndex = maxTaskIndex; // Aktualisiert den taskIndex des verschobenen Tasks
    const newTaskIndex = maxTaskIndex; // Neue Task-Index berechnen
    afterDropToBackend(ev,newTaskIndex); //
    clearColumn(); // Leert alle Spalten, um die Tasks neu zu rendern
    loadAllTasks(); // Rendert alle Tasks basierend auf den aktualisierten Daten
  }
}


function loadAllTasks() {
  document.getElementById('layOver').style.display = "none";
  //currentTasks = tasks;
  const tasksByColumn = {};
  for (const task of currentTasks) {
    if (!tasksByColumn[task.column]) {
      tasksByColumn[task.column] = [];
    }
    tasksByColumn[task.column].push(task);
    
  }
  renderTasks(tasksByColumn);
}


function renderTasks(tasksByColumn) {
  for (const column in tasksByColumn) {
    if (tasksByColumn.hasOwnProperty(column)) {
      const tasksInColumn = tasksByColumn[column].sort((a, b) => a.taskIndex - b.taskIndex);
      if (tasksInColumn.length === 1) {
        tasksInColumn[0].taskIndex = 0;
      }
      const currentColumn = document.getElementById(column);
      for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const description = task.description;
        const taskIndex = task.taskIndex;
        const createdAt = task.createdAt;
        currentColumn.innerHTML += `
                  <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
              `;
      }
    }
  }
}


function openTaskPopUp(id, title, column, description, taskIndex, createdAt) {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
  <button id="closeIcon" onclick="closeTaskPopUp()">X</button>
  <div>ID: ${id}</div>
  <div>Title: ${title}</div>
  <div>Column: ${column}</div>
  <div>Description: ${description}</div>
  <div>Task Index: ${taskIndex}</div>
  <div> createdAt: ${createdAt}</div>
  `;
}


function closeTaskPopUp() {
  document.getElementById('layOver').style.display = "none";
}


function createTask() {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
      <button id="closeIcon" onclick="closeTaskPopUp()">X</button>
      <form onsubmit="event.preventDefault(); addTask()">
          <input placeholder="Title..." name="title" id="title" type="text" required>
          <input placeholder="Description..." name="description" id="description" type="text" required>
          <input placeholder="Column..." name="column" id="column" type="text" required>
          <button type="submit">Create Task</button>
      </form>
  `;
}


// function addTask() {
//   let maxId = 0;
//   let maxTaskIndex = 0;
//   currentTasks.forEach(task => {
//     if (task.id > maxId) {
//       maxId = task.id;
//     }
//     if (task.column === column && task.taskIndex > maxTaskIndex) {
//       maxTaskIndex = task.taskIndex;
//     }
//   });
  
//   const newTaskIndex = maxTaskIndex + 1;
//   let newTaskObjToBackend = newTaskObjForBackend(newTaskIndex);
//   createTaskBackend(newTaskObjToBackend);
  
//   //const newId = maxId + 1;
//   const newId = newIdFromBackend();
//   let newTaskObjToFrontend = newTaskObj(newId,newTaskIndex); 
//    currentTasks.push(newTaskObjToFrontend);
  
//   clearColumn();
//   loadAllTasks();
//   closeTaskPopUp();
//   console.log('currentTasks: ', currentTasks)
// }




async function addTask() {
  let maxTaskIndex = 0;
  currentTasks.forEach(task => {
    if (task.column === column && task.task_index > maxTaskIndex) {
      maxTaskIndex = task.task_index;
    }
  });

  const newTaskIndex = maxTaskIndex + 1;
  let newTaskObjToBackend = newTaskObjForBackend(newTaskIndex);
  
  // Task im Backend erstellen und ID abrufen
  const newId = await createTaskBackendAndGetId(newTaskObjToBackend);
  
  // Neuen Task mit der erhaltenen ID im Frontend erstellen
  let newTaskObjToFrontend = newTaskObj(newId, newTaskIndex);
  currentTasks.push(newTaskObjToFrontend);
  
  clearColumn();
  loadAllTasks();
  closeTaskPopUp();
  console.log('currentTasks: ', currentTasks)
}

async function createTaskBackendAndGetId(taskData) {
  try {
    const response = await fetch('http://127.0.0.1:8000/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      throw new Error('Failed to create task in backend');
    }
    const responseData = await response.json();
    return responseData.id; // ID des neu erstellten Tasks aus der Backend-Antwort abrufen
  } catch (error) {
    console.error('Error creating task in backend:', error);
    // Fehlerbehandlung hier einfügen, falls das Erstellen des Tasks im Backend fehlschlägt
    return null;
  }
}








function newTaskObj(newId,newTaskIndex) {
const title = document.getElementById('title').value;
const description = document.getElementById('description').value;
const column = document.getElementById('column').value;
  return newTask = {
    id: newId,
    title: title,
    description: description,
    column: column,
    task_index: newTaskIndex,
    createdAt: timeAndDateFormat()
  };
}


function timeAndDateFormat() {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
  const creationDateTime = `${formattedDate} ${formattedTime}`;
  return creationDateTime;
}


function clearColumn() {
  const containers = ['todo', 'doToday', 'inProgress', 'done'];
  containers.forEach(containerId => {
    document.getElementById(containerId).innerHTML = '';
  });
}





