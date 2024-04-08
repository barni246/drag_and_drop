let currentTasks = [];


function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  //console.log('dragging elemennt id:', ev.target.id)
}

// function drop(ev) {
//     ev.preventDefault();
//     const data = ev.dataTransfer.getData("text");
//     const draggedElement = document.getElementById(data);
//     console.log('data', data);
//     const dropZone = ev.target.id;
//     console.log('dropzone id: ',dropZone);
//     const dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id);
//     const taskId = data;
//     const task = tasks.find(task => task.id === parseInt(taskId));
//     console.log('task',task);
//     console.log('task column: ',task.column);
//     console.log('task',task);
//     if (dropZone !== data && !dragElements.includes(dropZone)) {
//         ev.target.appendChild(draggedElement);
//     }
//     console.log(currentTasks);
// }



// function drop(ev) {  //ez jo!!
//   ev.preventDefault();
//   const data = ev.dataTransfer.getData("text");
//   const draggedElement = document.getElementById(data);
//   const dropZone = ev.target.id;
//   const dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id);
//   const taskId = data;
//   const taskIndex = currentTasks.findIndex(task => task.id === parseInt(taskId));
  
//   if (dropZone !== data && !dragElements.includes(dropZone)) {
//       // Ändere die Spalte des Tasks
//       const task = currentTasks[taskIndex];
//       const newColumn = dropZone;
//       task.column = newColumn;

//       // Aktualisiere die DOM-Ansicht
//       const destinationColumn = document.getElementById(newColumn);
//       destinationColumn.appendChild(draggedElement);

//       // Entferne den Task aus der vorherigen Spalte, wenn vorhanden
//       const previousColumn = document.getElementById(task.column);
//       if (previousColumn) {
//           previousColumn.removeChild(draggedElement);
//       }
//   }

//   clearColumn();
//   loadAllTasks();
// }


function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);
  const dropZone = ev.target.id;
  const dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id);
  const taskId = data;
  const taskIndex = currentTasks.findIndex(task => task.id === parseInt(taskId));
  
  if (dropZone !== data && !dragElements.includes(dropZone)) {
      // Update the column of the task
      const task = currentTasks[taskIndex];
      const newColumn = dropZone;
      
      // Find the highest taskIndex among tasks in the same column
      const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn);
      let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.taskIndex));
      
      // Increment maxTaskIndex by one to set the new taskIndex for the moved task
      maxTaskIndex++;
      
      // Update the column and taskIndex of the task
      task.column = newColumn;
      task.taskIndex = maxTaskIndex;
      clearColumn();
      // Render the tasks
      loadAllTasks();
  }
}


//  function loadAllTasks() {   // ez jo!!!
  
//    document.getElementById('layOver').style.display = "none";
//     currentTasks = tasks;
//    for (let i = 0; i < currentTasks.length; i++) {
//      const task = currentTasks[i];
//      const column = task.column;
//      const title = task.title;
//      const id = task.id;
//      const description = task.description;
//      const taskIndex = task.taskIndex;
//      const createdAt = task.createdAt;

//      document.getElementById(column).innerHTML += `
//      <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
//      ` 
//     }
//  }

// function loadAllTasks() {
//   document.getElementById('layOver').style.display = "none";
//   currentTasks = tasks;
  
//   // Gruppiere Tasks nach Spalten
//   const tasksByColumn = {};
//   for (const task of currentTasks) {
//       if (!tasksByColumn[task.column]) {
//           tasksByColumn[task.column] = [];
//       }
//       tasksByColumn[task.column].push(task);
//   }
  
//   // Rendere Tasks für jede Spalte
//   for (const column in tasksByColumn) {
//       if (tasksByColumn.hasOwnProperty(column)) {
//           // Sortiere Tasks in der aktuellen Spalte nach ihrem taskIndex
//           const tasksInColumn = tasksByColumn[column].sort((a, b) => a.taskIndex - b.taskIndex);
          
//           // Rendere Tasks in der aktuellen Spalte
//           const columnElement = document.getElementById(column);
//           columnElement.innerHTML = ''; // Leere Spalte vor dem Rendern
//           for (const task of tasksInColumn) {
//               const title = task.title;
//               const id = task.id;
//               const description = task.description;
//               const taskIndex = task.taskIndex;
//               const createdAt = task.createdAt;

//               columnElement.innerHTML += `
//                   <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
//               `;
//           }
//       }
//   }
// }



function loadAllTasks() {
  document.getElementById('layOver').style.display = "none";
  currentTasks = tasks;
  
  // Gruppiere Tasks nach Spalten
  const tasksByColumn = {};
  for (const task of currentTasks) {
      if (!tasksByColumn[task.column]) {
          tasksByColumn[task.column] = [];
      }
      tasksByColumn[task.column].push(task);
  }
  
  // Rendere Tasks für jede Spalte
  for (const column in tasksByColumn) {
      if (tasksByColumn.hasOwnProperty(column)) {
          // Sortiere Tasks in der aktuellen Spalte nach ihrem taskIndex
          const tasksInColumn = tasksByColumn[column].sort((a, b) => a.taskIndex - b.taskIndex);
          
          // Setze den taskIndex des einzigen Tasks in der Spalte auf 0, wenn er alleine ist
          if (tasksInColumn.length === 1) {
              tasksInColumn[0].taskIndex = 0;
          }
          
          // Rendere Tasks in der aktuellen Spalte
          const columnElement = document.getElementById(column);
          columnElement.innerHTML = ''; // Leere Spalte vor dem Rendern
          for (const task of tasksInColumn) {
              const title = task.title;
              const id = task.id;
              const description = task.description;
              const taskIndex = task.taskIndex;
              const createdAt = task.createdAt;

              columnElement.innerHTML += `
                  <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
              `;
          }
      }
  }
}



function openTaskPopUp(id,title,column,description,taskIndex,createdAt) {
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

function addTask() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const column = document.getElementById('column').value;
  
  let maxId = 0;
  let maxTaskIndex = 0;
  currentTasks.forEach(task => {
      if (task.id > maxId) {
          maxId = task.id;
      }
      if (task.column === column && task.taskIndex > maxTaskIndex) {
          maxTaskIndex = task.taskIndex;
      }
  });

  const newId = maxId + 1;
  const newTaskIndex = maxTaskIndex + 1;

  const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    const creationDateTime = `${formattedDate} ${formattedTime}`;

  const newTask = {
      id: newId,
      title: title,
      description: description,
      column: column,
      taskIndex: newTaskIndex,
      createdAt: creationDateTime
  };

  currentTasks.push(newTask);
  clearColumn();
  loadAllTasks();
  closeTaskPopUp();
}


function clearColumn() {
  const containers = ['todo', 'doToday', 'inProgress', 'done'];
  containers.forEach(containerId => {
      document.getElementById(containerId).innerHTML = '';
  });
}

