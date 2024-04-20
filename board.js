
let currentTasks = [];


function init() {
  loadAllTasksFromBackend();
  const username = localStorage.getItem('username');
  document.getElementById('loggedInUser').innerText += ` ${username}`;
}

function allowDrop(ev) {
  ev.preventDefault();
}


function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}



function drop(ev) {

  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const dropZone = ev.target.id;
  const dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id);
  const taskId = data;
  const indexOfCurrentTask = currentTasks.findIndex(task => task.id === parseInt(taskId));
  if (dropZone !== data && !dragElements.includes(dropZone)) {
    const task = currentTasks[indexOfCurrentTask];
    const newColumn = dropZone;
    if(dropZone === 'todo' || dropZone === 'doToday' || dropZone === 'inProgress' || dropZone === 'done'){
    task.column = newColumn;

    const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn);
    if (tasksInSameColumn.length === 0) {
      task.task_index = 1;
      afterDropToBackend(ev, task.task_index);
    } else {
      let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.task_index));
      task.task_index = maxTaskIndex + 1;
      afterDropToBackend(ev, task.task_index);
    }}
    clearColumn();
    loadAllTasks();
  }
}



function loadAllTasks() {
  document.getElementById('layOver').style.display = "none";
  const tasksByColumn = {};
  console.log('vorher', tasksByColumn);
  for (const task of currentTasks) {
    if (!tasksByColumn[task.column]) {
      tasksByColumn[task.column] = [];
      console.log('if', tasksByColumn);
    }
    tasksByColumn[task.column].push(task);
    console.log('nachher', tasksByColumn);
  }
  renderTasks(tasksByColumn);
}

 function renderTasks(tasksByColumn) {
  for (const column in tasksByColumn) {
    if (tasksByColumn.hasOwnProperty(column)) {
      const tasksInColumn = tasksByColumn[column].sort((a, b) => a.task_index - b.task_index);
      const currentColumn = document.getElementById(column);
      for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        //const description = task.description ? task.description : '';
        //const shortDescription = task.description && task.description.length > 10 ? task.description.substring(0, 10) + '...' : '';

        const description = task.description;
        const shortDescription = task.description.length > 10 ? task.description.substring(0, 10) + '...' : task.description;
       //console.log('description',description);
        const taskIndex = task.task_index;
        const createdAt = formatCreatedAt(task.created_at);
        currentColumn.innerHTML += `
                  <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>
                     <div class="task-container">
                       <span class="title-text">${title}</span>
                       <span class="description-text">${shortDescription}</span>
                       <span class="created-time">${createdAt}</span>
                     </div> 
                  </div>
              `;
      }
    }
  }
}


function formatCreatedAt(createdAt) {
  const currentDate = new Date(createdAt);
  const formattedTime = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  return formattedTime;
}


// function openTaskPopUp(id,title,column,description,taskIndex,createdAt) {
//   console.log('taskPopUp',currentTasks);
//   document.getElementById('layOver').style.display = "block";
//   document.getElementById('taskPopUpDialog').innerHTML = `
//   <button id="closeIcon" onclick="closeTaskPopUp()">X</button>
//   <button id="delete${id}" onclick="deleteTaskFrontend(${id})">Delete</button>
//   <div>ID: ${id}</div>
//   <div>Title: <input type="text" id="editTitle" value="${title}"></div>
//   <div>Column: ${column}</div>
//   <div>Description: <textarea id="editDescription">${description}</textarea></div>
//   <div>Task Index: ${taskIndex}</div>
//   <div> createdAt: ${createdAt}</div>
//   <button onclick="updateTask(${id}))">Save</button>
//   `;
// }


// function updateTask(id) {
//   const newTitle = document.getElementById('editTitle').value;
//   const newDescription = document.getElementById('editDescription').value;
// }


function openTaskPopUp(id, title, column, description, taskIndex, createdAt) {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
    <button id="closeIcon" onclick="closeTaskPopUp()">X</button>
    <button id="delete${id}" onclick="deleteTaskFrontend(${id})">Delete</button>
    <div>ID: ${id}</div>
    <div>Title: <input type="text" id="editTitle" value="${title}" disabled></div>
    <div>Column: ${column}</div>
    <div>Description: <textarea id="editDescription" disabled>${description}</textarea></div>
    <div>Task Index: ${taskIndex}</div>
    <div> Created At: ${createdAt}</div>
    <button id="editTask${id}" onclick="enableEditing(${id})">Edit</button>
    <button id="updateTaskSave${id}" style="display: none" onclick="updateTask(${id})">Save</button>
  `;
}

function enableEditing(id) {
  document.getElementById('editTitle').disabled = false;
  document.getElementById('editDescription').disabled = false;
  document.getElementById('updateTaskSave'+id).style.display="block";
  document.getElementById('editTask'+id).style.display="none";
  document.getElementById(id).style.opacity = 0.1;
}

function updateTask(id) {
  const newTitle = document.getElementById('editTitle').value;
  const newDescription = document.getElementById('editDescription').value;
  document.getElementById('updateTaskSave'+id).style.display="none";
  document.getElementById('editTask'+id).style.display="block";
  document.getElementById('editTitle').disabled = true;
  document.getElementById('editDescription').disabled = true;
  currentTasksUpdate(id,newTitle,newDescription);
  updateTaskBackend(id);
}


function currentTasksUpdate(id,newTitle,newDescription) {
for (let index = 0; index < currentTasks.length; index++) {
  const task = currentTasks[index];
  const taskIdBackend = task.id;
  if(taskIdBackend === id) {
    task.title =  newTitle;
    task.description = newDescription;
  }
}
}




function closeTaskPopUp() {
  document.getElementById('layOver').style.display = "none";
  clearColumn();
  loadAllTasks();
}


function deleteTaskFrontend(id) {
  const index = currentTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    currentTasks.splice(index, 1);
    deleteTaskBackend(id);
    clearColumn();
    loadAllTasks();
    closeTaskPopUp();
  }
}


function createTask(column) {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
      <button id="closeIcon" onclick="closeTaskPopUp()">X</button>
      <form onsubmit="event.preventDefault(); addTask('${column}')">
          <input placeholder="Title..." name="title" id="title" type="text" required>
          <input placeholder="Description..." name="description" id="description" type="text" required>
          <button type="submit">Create Task</button>
      </form>
  `;
}


async function addTask(column) {
  let maxTaskIndex = currentTasks.reduce((maxIndex, task) => {
    if (task.column === column && task.task_index > maxIndex) {
      return task.task_index;
    } else {
      return maxIndex;
    }
  }, 0);
  const newTaskIndex = maxTaskIndex + 1;
  let newTaskObjToBackend = newTaskObjForBackend(newTaskIndex, column);
  const newId = await createTaskBackendAndGetId(newTaskObjToBackend);
  let newTaskObjToFrontend = newTaskObj(newId, newTaskIndex, column);
  currentTasks.push(newTaskObjToFrontend);
  clearColumn();
  loadAllTasks();
  closeTaskPopUp();
  console.log('currentTasks addTask: ', currentTasks);
}


function newTaskObj(newId, newTaskIndex, column) {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const Formatdescription = description.length > 10 ? description.substring(0, 10) + '...' : description;

  return newTask = {
    id: newId,
    title: title,
    description: Formatdescription,
    column: column,
    task_index: newTaskIndex,
    created_at: timeAndDateFormat()
  };
}


function timeAndDateFormat() {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

  const creationDateTime = `${formattedDate} ${formattedTime}`;
  return creationDateTime;
}





function clearColumn() {
  const containers = ['todo', 'doToday', 'inProgress', 'done'];
  containers.forEach(containerId => {
    document.getElementById(containerId).innerHTML = '';
  });
}






