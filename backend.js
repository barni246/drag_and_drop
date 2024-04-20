
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



function renderTasksFromBackend(tasksInColumn, column) {
    const columnElement = document.getElementById(column);
    columnElement.innerHTML = '';
    for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const description = task.description;
        const shortDescription = task.description.length > 10 ? task.description.substring(0, 10) + '...' : task.description;
        const taskIndex = task.task_index;
        const createdAt = formatCreatedAt(task.created_at); // Formatieren Sie das erstellte Datum

        columnElement.innerHTML += `
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


async function afterDropToBackend(ev, newTaskIndex) {
    const data = ev.dataTransfer.getData("text");
    const task = currentTasks.find(task => task.id === parseInt(data));
    const dropZone = ev.target.id;
    console.log('dropZone',dropZone);
    const newColumn = dropZone;
    const updateData = {
        id: task.id,
        column: newColumn,
        task_index: newTaskIndex
    };
    console.log('newTaskIndex after drop', newTaskIndex)
    console.log('JSON.stringify(updateData)', JSON.stringify(updateData));
    try {
        const csrftoken = getCSRFToken();
        const response = await fetch(`http://127.0.0.1:8000/tasks/drop/${task.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
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
        const userId = await getUserIdByUsername(username);
        const csrftoken = getCSRFToken();
        taskData.created_by = userId;

        const response = await fetch('http://127.0.0.1:8000/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to create task in backend');
        }
        const responseData = await response.json();
        return responseData.id;
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


async function deleteTaskBackend(id) {
    try {
        const csrftoken = getCSRFToken();
        const response = await fetch(`http://127.0.0.1:8000/tasks/detail/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete task from backend.');
        }
        console.log('Task deleted successfully.');
    } catch (error) {
        console.error('Error deleting task from backend:', error.message);
    }
}
