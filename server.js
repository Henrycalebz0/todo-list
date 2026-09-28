const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname;
fs.mkdirSync(DATA_DIR, { recursive: true });
const DATA_FILE = path.join(DATA_DIR, 'todos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function saveTodos(todos) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(todos, null, 2)}\n`);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Request body must be valid JSON')); }
    });
    req.on('error', reject);
  });
}

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || parts[1] !== 'todos' || parts.length > 3) {
    return sendJson(res, 404, { error: 'Endpoint not found' });
  }

  let todos;
  try { todos = readTodos(); }
  catch { return sendJson(res, 500, { error: 'Could not read todo data' }); }

  if (parts.length === 2 && req.method === 'GET') {
    return sendJson(res, 200, todos);
  }

  if (parts.length === 2 && req.method === 'POST') {
    let body;
    try { body = await readBody(req); }
    catch (error) { return sendJson(res, 400, { error: error.message }); }
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return sendJson(res, 400, { error: 'Title is required' });
    const todo = { id: randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
    todos.push(todo);
    saveTodos(todos);
    return sendJson(res, 201, todo);
  }

  if (parts.length === 2) {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const id = parts[2];
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) return sendJson(res, 404, { error: 'Todo not found' });

  if (req.method === 'PATCH') {
    let body;
    try { body = await readBody(req); }
    catch (error) { return sendJson(res, 400, { error: error.message }); }
    if (Object.hasOwn(body, 'title')) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return sendJson(res, 400, { error: 'Title must be a non-empty string' });
      }
      todos[index].title = body.title.trim();
    }
    if (Object.hasOwn(body, 'completed')) {
      if (typeof body.completed !== 'boolean') return sendJson(res, 400, { error: 'Completed must be a boolean' });
      todos[index].completed = body.completed;
    }
    saveTodos(todos);
    return sendJson(res, 200, todos[index]);
  }

  if (req.method === 'DELETE') {
    const [deleted] = todos.splice(index, 1);
    saveTodos(todos);
    return sendJson(res, 200, deleted);
  }

  res.setHeader('Allow', parts.length === 2 ? 'GET, POST' : 'PATCH, DELETE');
  return sendJson(res, 405, { error: 'Method not allowed' });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(PUBLIC_DIR, requested);
  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (error, content) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon'
    };
    const type = types[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url).catch(() => sendJson(res, 500, { error: 'Internal server error' }));
  if (req.method !== 'GET') { res.writeHead(405); return res.end('Method not allowed'); }
  serveStatic(req, res, url);
});

server.listen(PORT, () => console.log(`Todo app running at http://localhost:${PORT}`));
