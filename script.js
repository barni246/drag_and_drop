
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  console.log('dragging elemennt id:', ev.target.id)
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    var dropZone = ev.target.id;
    console.log('drop-zone id: ',dropZone)
    var dragElements = Array.from(document.querySelectorAll('.drag')).map(element => element.id);

    if (dropZone !== data && !dragElements.includes(dropZone)) {
        ev.target.appendChild(draggedElement);
    }
}

function loadAllTasks() {
  document.getElementById('layOver').style.display = "none";
    let currentTasks = [];
    currentTasks = tasks;
   for (let i = 0; i < currentTasks.length; i++) {
    const task = currentTasks[i];
    const column = task.column;
    const title = task.title;
    const id = task.id;

    document.getElementById(column).innerHTML += `
    <div class="drag" onclick="taskPopUp(${id})" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
    ` 
   }
}


function taskPopUp(TaskId) {
  document.getElementById('layOver').style.display = "block";
}

