// varzz
const tasksContainer = document.getElementById('tasks');
const addTaskButton = document.getElementById('add-task');
const taskTitleInput = document.getElementById('task-title');
const dueDateInput = document.getElementById('due-date');
const dueTimeInput = document.getElementById('due-time');
const priorityInput = document.getElementById('priority');

let tasks = [];

if (Notification.permission === "default") {
  Notification.requestPermission().then((permission) => {
    if (permission !== "granted") {
      alert("Please enable notifications for reminders!");
    }
  });
}


if (Notification.permission === "denied") {
  document.getElementById("notification-warning").style.display = "block";
}


function loadTasks() {
  const savedTasks = document.cookie
    .split('; ')
    .find((row) => row.startsWith('tasks='));
  if (savedTasks) {
    tasks = JSON.parse(decodeURIComponent(savedTasks.split('=')[1]));
  }
  renderTasks();
}

function saveTasks() {
  document.cookie = `tasks=${encodeURIComponent(
    JSON.stringify(tasks)
  )}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
}

// new taskk
addTaskButton.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  const dueDate = dueDateInput.value;
  const dueTime = dueTimeInput.value;
  const priority = parseInt(priorityInput.value);

  if (!title || !dueDate || !dueTime) {
    alert('Please fill in all fields.');
    return;
  }

  const task = {
    title,
    dueDate: new Date(`${dueDate}T${dueTime}`),
    priority,
    status: 'Pending',
    notified: { twoDays: false, oneDay: false, minutes30: false, minutes5: false }, // Notification flags
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskTitleInput.value = '';
  dueDateInput.value = '';
  dueTimeInput.value = '';
  priorityInput.value = '1';
});


function renderTasks() {
  tasksContainer.innerHTML = '';
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  tasks.forEach((task) => {
    const taskElement = document.createElement('li');
    taskElement.className = `task-item ${
      task.status === 'Completed' ? 'completed' : ''
    }`;

    const details = document.createElement('div');
    details.innerHTML = `
      <strong>${task.title}</strong> <br>
      Due: ${new Date(task.dueDate).toLocaleString()} | Priority: ${task.priority} <br>
      Status: ${task.status}
    `;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.addEventListener('click', () => {
      task.status = 'Completed';
      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((t) => t !== task);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(completeButton);
    actions.appendChild(deleteButton);
    taskElement.appendChild(details);
    taskElement.appendChild(actions);
    tasksContainer.appendChild(taskElement);
  });
}


function checkNotifications() {
  const now = new Date();

  tasks.forEach((task) => {
    if (task.status === 'Completed') return;

    const dueDate = new Date(task.dueDate);
    const timeUntilDue = (dueDate - now) / (1000 * 60); 

    console.log(`Checking task: ${task.title}`);
    console.log(`Time until due (minutes): ${timeUntilDue}`);

    
    if (timeUntilDue <= 2880 && timeUntilDue > 1440 && !task.notified.twoDays) {
      console.log(`Notifying: ${task.title} - 2 days remaining.`);
      sendNotification(task.title, "is 2 days away from your reminder!");
      task.notified.twoDays = true;
    }

   
    if (timeUntilDue <= 1440 && timeUntilDue > 30 && !task.notified.oneDay) {
      console.log(`Notifying: ${task.title} - 1 day remaining.`);
      sendNotification(task.title, "is 1 day away from your reminder!");
      task.notified.oneDay = true;
    }

    if (timeUntilDue <= 30 && timeUntilDue > 5 && !task.notified.minutes30) {
      console.log(`Notifying: ${task.title} - 30 minutes remaining.`);
      sendNotification(task.title, "is 30 minutes away from your reminder!");
      task.notified.minutes30 = true;
    }

   
    if (timeUntilDue <= 5 && timeUntilDue > 0 && !task.notified.minutes5) {
      console.log(`Notifying: ${task.title} - 5 minutes remaining.`);
      sendNotification(task.title, "is 5 minutes away from your reminder!");
      task.notified.minutes5 = true;
    }
  });

  saveTasks(); // save noti gang
}

// send noti fr
function sendNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message, icon: "icon.png" });
  }
}

// Periodic notification checker
setInterval(checkNotifications, 60 * 1000); // check for debug samrath

// LOAAAAAAAAAAAAD
loadTasks();
