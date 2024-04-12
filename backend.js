function loadAllTasksFromBackend() {
    document.getElementById('layOver').style.display = "none";
    fetch('http://127.0.0.1:8000/tasks/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            currentTasks = data;
            console.log('data', data)
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
                        const taskIndex = task.task_index;
                        const createdAt = task.created_at; // Anpassen Sie den Schlüssel entsprechend Ihrer Datenbank

                        columnElement.innerHTML += `
                <div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
              `;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fehlerbehandlung hier einfügen, z.B. eine Fehlermeldung anzeigen
        });
}


async function afterDropToBackend(ev) {
    const data = ev.dataTransfer.getData("text");
    const task = currentTasks.find(task => task.id === parseInt(data)); 
    const dropZone = ev.target.id;
    const newColumn = dropZone;
    const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn); 
    let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.taskIndex));
    maxTaskIndex++;
   
    const updateData = {
        id: task.id,
        column: newColumn,
        task_index: maxTaskIndex
    };

    console.log('JSON.stringify(updateData)',JSON.stringify(updateData));
    try {
        const response = await fetch(`http://127.0.0.1:8000/tasks/${task.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        }).then(function(response) {
            console.log('response',response);
            return response.text()});
    } catch (error) {
        console.error('Error barni:', error);
    }
}



//   async function drop(ev) {
//     ev.preventDefault();
//     const data = ev.dataTransfer.getData("text"); // ID des verschobenen Tasks
//     const dropZone = ev.target.id; // ID der Spalte, in die der Task verschoben wird

//     // Überprüft, ob der Task nicht auf sich selbst gezogen wurde
//     if (dropZone !== data) {
//       const task = currentTasks.find(task => task.id === parseInt(data)); // Der verschobene Task
//       const newColumn = dropZone; // Die Spalte, in die der Task verschoben wird
//       const tasksInSameColumn = currentTasks.filter(task => task.column === newColumn); // Alle Tasks in der Ziel-Spalte
//       let maxTaskIndex = Math.max(...tasksInSameColumn.map(task => task.task_index)); // Findet den höchsten taskIndex-Wert in der Ziel-Spalte
//       maxTaskIndex++; // Inkrementiert den höchsten taskIndex-Wert um 1, um den neuen taskIndex für den verschobenen Task zu bestimmen

//       // Daten für die Aktualisierung des Tasks
//       const updateData = {
//         id: task.id,
//         column: newColumn,
//         task_index: maxTaskIndex
//       };
//       task.column = newColumn;
//       task.taskIndex = maxTaskIndex;
//       try {
//         // AJAX-Anfrage zum Backend, um den Task zu aktualisieren
//         const response = await fetch(`http://127.0.0.1:8000/tasks/${task.id}/`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(updateData)
//         });
//         // if (!response.ok) {
//         //   throw new Error('Network response was not ok');
//         // }

//         // Aktualisierung erfolgreich, Tasks neu rendern
//         clearColumn();
//         loadAllTasksFrontend();
//       } catch (error) {
//         console.error('Error:', error);
//         // Fehlerbehandlung hier einfügen, z.B. eine Fehlermeldung anzeigen
//       }
//     }
//   }


function createTaskBackend(taskData) {
    fetch('http://127.0.0.1:8000/tasks/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task created:', data);
            // Hier können Sie weitere Aktionen ausführen, z.B. die Benutzeroberfläche aktualisieren
        })
        .catch(error => {
            console.error('Error:', error);
            // Hier können Sie Fehlerbehandlung durchführen, z.B. Benachrichtigungen anzeigen
        });
    clearColumn();
    loadAllTasks();
}

//await createTaskBackend(taskDataBackend);

// const taskDataBackend = {
//   title: title,
//   description: description,
//   column: column,
//   task_index: newTaskIndex,
//   created_by: 'barni'
// };
