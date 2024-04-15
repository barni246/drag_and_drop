
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
            const tasksByColumn = {};
            for (const task of currentTasks) {
                if (!tasksByColumn[task.column]) {
                    tasksByColumn[task.column] = [];
                }
                tasksByColumn[task.column].push(task);
            }
            for (const column in tasksByColumn) {
                if (tasksByColumn.hasOwnProperty(column)) {
                    const tasksInColumn = tasksByColumn[column].sort((a, b) => a.task_index - b.task_index);
                    renderTasksFromBackend(tasksInColumn, column);     
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}



function renderTasksFromBackend(tasksInColumn,column) {
    const columnElement = document.getElementById(column);
    columnElement.innerHTML = '';
    for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const description = task.description;
        const taskIndex = task.task_index;
        const createdAt = task.created_at;

        columnElement.innerHTML += `
<div class="drag" onclick="openTaskPopUp('${id}','${title}','${column}','${description}','${taskIndex}','${createdAt}')" draggable="true" ondragstart="drag(event)" id=${id}>${title}</div>
`;
    }
}



async function afterDropToBackend(ev, newTaskIndex) {
    const data = ev.dataTransfer.getData("text");
    const task = currentTasks.find(task => task.id === parseInt(data));
    const dropZone = ev.target.id;
    const newColumn = dropZone;
    const updateData = {
        id: task.id,
        column: newColumn,
        task_index: newTaskIndex
    };
    console.log('newTaskIndex after drop', newTaskIndex)
    console.log('JSON.stringify(updateData)', JSON.stringify(updateData));
    try {
        const csrftoken = getCSRFToken(); // Hole das CSRF-Token aus dem Local Storage
        const response = await fetch(`http://127.0.0.1:8000/tasks/drop/${task.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Füge das CSRF-Token zum Header hinzu
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}


async function getUserIdByUsername(username) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/user_id_by_username/${username}/`);
        if (!response.ok) {
            throw new Error('Failed to get user ID by username');
        }
        const responseData = await response.json();
        return responseData.user_id;
    } catch (error) {
        console.error('Error getting user ID by username:', error);
        return null;
    }
}


async function createTaskBackendAndGetId(taskData) {
    try {
        const username = taskData.created_by;
        const userId = await getUserIdByUsername(username); // Benutzerprimärschlüssel abrufen

        const csrftoken = getCSRFToken(); // CSRF-Token aus dem Local Storage abrufen

        // Ersetzen Sie den Benutzernamen durch den Benutzerprimärschlüssel
        taskData.created_by = userId;

        const response = await fetch('http://127.0.0.1:8000/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // CSRF-Token zum Header hinzufügen
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
        return null;
    }
}


function newTaskObjForBackend(newTaskIndex, column) {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    return newTask = {
        title: title,
        description: description,
        column: column,
        task_index: newTaskIndex,
        created_by: getUserName()
    };
}


function getUserName() {
 return localStorage.getItem('username');
}
