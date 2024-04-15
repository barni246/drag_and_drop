
let currentTasks = [];


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
    task.column = newColumn;
   
    const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn);
    if (tasksInSameColumn.length === 0) {
      task.task_index = 1;
      afterDropToBackend(ev, task.task_index);
    } else {
      let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.task_index));
      task.task_index = maxTaskIndex + 1;
      afterDropToBackend(ev, task.task_index);
    }
    clearColumn();
    loadAllTasks();
  }
}



function loadAllTasks() {
  document.getElementById('layOver').style.display = "none";
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
      const tasksInColumn = tasksByColumn[column].sort((a, b) => a.task_index - b.task_index);
      const currentColumn = document.getElementById(column);
      for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const description = task.description;
        const taskIndex = task.task_index;
        const createdAt = task.created_at;
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
  <button id="delete${id}" onclick="deleteTaskFrontend(${id})">Delete</button>
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



async function deleteTaskBackend(id) {
  try {
      const csrftoken = getCSRFToken(); 
      const response = await fetch(`http://127.0.0.1:8000/tasks/detail/${id}/`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken  }});
      if (!response.ok) {
          throw new Error('Failed to delete task from backend.');
         }
      console.log('Task deleted successfully.');
  } catch (error) {
      console.error('Error deleting task from backend:', error.message);
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
  return newTask = {
    id: newId,
    title: title,
    description: description,
    column: column,
    task_index: newTaskIndex,
    created_at: timeAndDateFormat()
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





