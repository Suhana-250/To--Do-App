const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Drag & Drop
let draggedIndex = null;

// Render tasks
function renderTasks(filter = 'all') {
  todoList.innerHTML = '';
  tasks
    .filter(task => filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed))
    .forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between bg-purple-50 p-3 rounded-xl shadow-sm hover:bg-purple-100 transition task-item';
      li.draggable = true;
      li.dataset.index = index;

      li.innerHTML = `
        <div class="flex items-center space-x-3">
          <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="task-checkbox w-5 h-5 accent-purple-500">
          <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}">${task.text}</span>
        </div>
        <div class="flex items-center space-x-2">
          <button data-index="${index}" class="text-yellow-500 hover:text-yellow-700 edit-btn text-lg font-bold">&check;</button>
          <button data-index="${index}" class="text-red-500 hover:text-red-700 delete-btn text-xl font-bold">&times;</button>
        </div>
      `;

      // Drag events
      li.addEventListener('dragstart', () => {
        draggedIndex = index;
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', () => {
        draggedIndex = null;
        li.classList.remove('dragging');
      });
      li.addEventListener('dragover', e => e.preventDefault());
      li.addEventListener('drop', () => {
        if (draggedIndex !== null && draggedIndex !== index) {
          const [draggedTask] = tasks.splice(draggedIndex, 1);
          tasks.splice(index, 0, draggedTask);
          saveTasks();
          renderTasks(filter);
        }
      });

      todoList.appendChild(li);
    });
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add Task
addBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
  }
});

// Enter key to add task
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

// Toggle complete / delete / edit
todoList.addEventListener('click', (e) => {
  const index = e.target.dataset.index;
  if (e.target.classList.contains('task-checkbox')) {
    tasks[index].completed = e.target.checked;
    saveTasks();
    renderTasks();
  }
  if (e.target.classList.contains('delete-btn')) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
  if (e.target.classList.contains('edit-btn')) {
    const newText = prompt('Edit your task:', tasks[index].text);
    if (newText) {
      tasks[index].text = newText;
      saveTasks();
      renderTasks();
    }
  }
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('font-bold', 'text-purple-500'));
    btn.classList.add('font-bold', 'text-purple-500');
    renderTasks(btn.dataset.filter);
  });
});

// Clear completed tasks
clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// Initial render
renderTasks();
