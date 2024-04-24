
function loadAllTasksFromBackend() {
    document.getElementById('layOver').style.display = "none";

    fetch('http://127.0.0.1:8000/tasks/', {
        headers: {
            'Authorization': `Token ${getToken()}`
        }
    })
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


async function renderTasksFromBackend(tasksInColumn, column) {
    const columnElement = document.getElementById(column);
    columnElement.innerHTML = '';
    for (const task of tasksInColumn) {
        const title = task.title;
        const id = task.id;
        const description = task.description;
        const shortDescription = task.description.length > 10 ? task.description.substring(0, 10) + '...' : task.description;
        const taskIndex = task.task_index;
        const updatedAt = formatUpdatedAt(task.updated_at);
        const createdBy = await getCreatedBy(id);
        const createdAt = formatCreatedAt(task.created_at);
        columnElement.innerHTML += `
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
    try {
        const response = await fetch(`http://127.0.0.1:8000/tasks/crud/${task.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${getToken()}`,
                'X-CSRFToken': `${getCSRFToken()}`
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
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


function getCSRFToken() {
    const cookies = document.cookie.split(';');
     for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         if (cookie.startsWith('csrftoken=')) {
             return  cookie.substring('csrftoken='.length, cookie.length);
         }
     }
     return null;
 }

 
function getToken() {
    const token = localStorage.getItem('token');
    if(token) {
        return token;
    }else {
        console.log("Token ist nicht vorhanden in Local Storage!")
    }
}


async function createTaskBackendAndGetId(taskData) {
    try {
        const username = taskData.created_by;
        const userId = await getUserIdByUsername(username);
        taskData.created_by = userId;

        const response = await fetch('http://127.0.0.1:8000/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${getToken()}`,
                'X-CSRFToken': `${getCSRFToken()}`
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
        const response = await fetch(`http://127.0.0.1:8000/tasks/crud/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${getToken()}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': `${getCSRFToken()}`
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


async function updateTaskBackend(id) {
    const newTitle = document.getElementById('editTitle').value;
    const newDescription = document.getElementById('editDescription').value;
    await fetch(`http://127.0.0.1:8000/tasks/crud/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${getToken()}`,
            'X-CSRFToken': `${getCSRFToken()}`
        },
        body: JSON.stringify({ title: newTitle, description: newDescription })
    })
        .then(response => {
            if (response.ok) {
                console.log('Task updated successfully');
            } else {
                console.error('Failed to update task');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


async function getCreatedBy(taskId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}/`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const username = data.created_by;
        return username;
    } catch (error) {
        console.error('Error fetching task username:', error);
        throw error;
    }
}

