let currentTasks = [];
let isEditable = false;


function toggleEditable() {
  isEditable = !isEditable;
}


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
    if (dropZone === 'todo' || dropZone === 'doToday' || dropZone === 'inProgress' || dropZone === 'done') {
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
    } else {
      return
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


async function renderTasks(tasksByColumn) {
  for (const column in tasksByColumn) {
    if (tasksByColumn.hasOwnProperty(column)) {
      const tasksInColumn = tasksByColumn[column].sort((a, b) => a.task_index - b.task_index);
      const currentColumn = document.getElementById(column);
      for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const createdBy = await getCreatedBy(id);
        const description = task.description;
        const shortDescription = task.description.length > 10 ? task.description.substring(0, 10) + '...' : task.description;
        const taskIndex = task.task_index;
        const updatedAt = formatUpdatedAt(task.updated_at);
        const createdAt = formatCreatedAt(task.created_at);
        currentColumn.innerHTML += `
                  <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${createdAt}','${createdBy}','${updatedAt}')" draggable="true" ondragstart="drag(event)" id=${id}>
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


function formatUpdatedAt(updatedAt) {
  if (!updatedAt) {
    return "---";
  } else {
    const formatedDateTime = formatCreatedAt(updatedAt);
    return formatedDateTime;
  }
}


function formatCreatedAt(createdAt) {
  const currentDate = new Date(createdAt);
  const formattedTime = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  return formattedTime;
}


function openTaskPopUp(id, title, column, description, createdAt, createdBy, updatedAt) {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
    <img class="closeIcon" onclick="closeTaskPopUp()"  src="img/exit.png" title="exit">
    <img  class="delete-icon" id="delete${id}"  onclick="deleteTaskFrontend(${id})" src="img/delete.png" title="delete task">
     <div class="title-container">
     <span class="font-size">Title:</span>
     <input type="text" id="editTitle" value="${title}" disabled>
     </div>
  
    <div>
    <span class="font-size">Description:</span>
     <textarea id="editDescription"  rows="8" cols="30" disabled>${description}</textarea>
     </div>
    <div class="font-size show-column"><span class="load-text"> ${column}</span></div>
    <div class="font-size"> Created by: <span class="load-text"> ${createdBy}</span></div>
    <div class="font-size"> Created at:<span class="load-text"> ${createdAt}</span></div>
    <div class="font-size"> Updated at:<span class="load-text"> ${updatedAt}</span></div>
    <img title="edit task" class="edit-icon" id="editTask${id}" onclick="enableEditing(${id})" src="img/edit.png">
    <img title="save" class="edit-icon save-btn" id="updateTaskSave${id}" style="display: none" onclick="updateTask(${id})" src="img/save.png">
  `;
}


function enableEditing(id) {
  toggleEditable();
  document.getElementById('editTitle').disabled = false;
  document.getElementById('editDescription').disabled = false;
  document.getElementById('updateTaskSave' + id).style.display = "block";
  document.getElementById('editTask' + id).style.display = "none";
  document.getElementById(id).style.opacity = 0.2;
  document.getElementById('delete' + id).disabled = true;
  document.getElementById('delete' + id).style.filter = "invert(50%)";
  document.getElementById('delete' + id).style.cursor = "not-allowed";
}


function updateTask(id) {
  toggleEditable();
  closeTaskPopUp();
  const newTitle = document.getElementById('editTitle').value;
  const newDescription = document.getElementById('editDescription').value;
  for (let index = 0; index < currentTasks.length; index++) {
    const task = currentTasks[index];
    if (task.id === id) {
      const currentTitle = task.title;
      const currentDescription = task.description;
      if (newTitle !== currentTitle || newDescription !== currentDescription) {
        editToggle(id);
        updateTaskBackend(id);
        currentTasksUpdate(id, newTitle, newDescription);
      } else {
        editToggle(id);
      }
    }
  }
}


function editToggle(id) {
  document.getElementById('updateTaskSave' + id).style.display = "none";
  document.getElementById('editTask' + id).style.display = "block";
  document.getElementById('editTitle').disabled = true;
  document.getElementById('editDescription').disabled = true;
  document.getElementById('delete' + id).disabled = false;
  document.getElementById('delete' + id).style.filter = "invert(0%)";
  document.getElementById('delete' + id).style.cursor = "pointer";
}


function currentTasksUpdate(id, newTitle, newDescription) {
  for (let index = 0; index < currentTasks.length; index++) {
    const task = currentTasks[index];
    const taskIdBackend = task.id;
    if (taskIdBackend === id) {
      task.title = newTitle;
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
  if (!isEditable) {
    const index = currentTasks.findIndex(task => task.id === id);
    if (index !== -1) {
      currentTasks.splice(index, 1);
      deleteTaskBackend(id);
      closeTaskPopUp();
    }
  }
}


function createTask(column) {
  document.getElementById('layOver').style.display = "block";
  document.getElementById('taskPopUpDialog').innerHTML = `
      <img class="closeIcon" onclick="closeTaskPopUp()" id="closeIcon" src="img/exit.png" title="exit">
      <form onsubmit="event.preventDefault(); addTask('${column}')">
          <div class="title-container">
          <span class="font-size show-column">${column}</span>
          <span class="font-size">Title:</span>
          <input placeholder="Title..." name="title" id="title" type="text" required>
          </div>
          <div>
          <span class="font-size">Description:</span>
          <textarea placeholder="Description..." name="description" id="description" rows="12" cols="30" required></textarea>
          </div>
        <button class="button-wrapper">  <img id="createTaskBtn" title="create new task" type="submit" src="img/create.png" alt=""> </button>
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
  closeTaskPopUp();
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
    created_at: timeAndDateFormat(),
    created_by: getUserName()
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






