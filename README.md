# Todo List starter

A small browser based todo app with a Node.js API and JSON file storage. Requires Node.js 18 or newer and no third-party packages.

Live app: <https://todo-list-production-bd36.up.railway.app>

## Run in VS Code

1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run `npm start`.
4. Open `http://localhost:3000` in your browser.

Tasks are stored in `todos.json`, which the server creates on first change. Set `DATA_DIR` to choose another storage folder; Railway's `RAILWAY_VOLUME_MOUNT_PATH` is used automatically when set. The REST API is documented in [ENDPOINT_TESTS.md](ENDPOINT_TESTS.md), the app flow is in [FLOWGRAPH.md](FLOWGRAPH.md), and deployment details are in [DEPLOY.md](DEPLOY.md).

## API overview

- `GET /api/todos` — list tasks
- `POST /api/todos` — create task, JSON body `{ "title": "..." }`
- `PATCH /api/todos/:id` — change `title` and/or `completed`
- `DELETE /api/todos/:id` — remove task
