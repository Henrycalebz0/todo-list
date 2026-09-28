const form = document.querySelector('#todo-form');
const titleInput = document.querySelector('#todo-title');
const list = document.querySelector('#todo-list');
const status = document.querySelector('#status');
const remaining = document.querySelector('#remaining');

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Something went wrong');
  return data;
}

function render(todos) {
  list.replaceChildren();
  todos.forEach(todo => {
    const item = document.createElement('li');
    if (todo.completed) item.classList.add('done');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark ${todo.title} ${todo.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', async () => {
      try {
        await request(`/api/todos/${todo.id}`, { method: 'PATCH', body: JSON.stringify({ completed: checkbox.checked }) });
        await load();
      }
      catch (error) { showError(error); }
    });
    const label = document.createElement('span'); label.textContent = todo.title;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${todo.title}`);
    remove.addEventListener('click', async () => {
      try { await request(`/api/todos/${todo.id}`, { method: 'DELETE' }); await load(); }
      catch (error) { showError(error); }
    });
    item.append(checkbox, label, remove); list.append(item);
  });
  const count = todos.filter(todo => !todo.completed).length;
  remaining.textContent = `${count} ${count === 1 ? 'task' : 'tasks'} left`;
}

function showError(error) { status.textContent = error.message; }
async function load() {
  try { render(await request('/api/todos')); status.textContent = ''; }
  catch (error) { showError(error); }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  try {
    await request('/api/todos', { method: 'POST', body: JSON.stringify({ title }) });
    titleInput.value = ''; status.textContent = ''; await load(); titleInput.focus();
  } catch (error) { showError(error); }
});

document.querySelector('#clear-completed').addEventListener('click', async () => {
  try {
    const todos = await request('/api/todos');
    await Promise.all(todos.filter(todo => todo.completed).map(todo => request(`/api/todos/${todo.id}`, { method: 'DELETE' })));
    await load();
  } catch (error) { showError(error); }
});

load();
