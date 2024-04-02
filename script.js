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