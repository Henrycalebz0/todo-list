# Deploy on Railway with persistent task storage

Railway is the selected host because it can run this Node.js server and attach a persistent volume for `todos.json`.

1. In Railway, create a project and choose **Deploy from GitHub repo**.
2. Select `Henrycalebz0/todo-list` and deploy the `main` branch. Railway detects the Node app and runs `npm start`.
3. In the service settings, add a volume with mount path `/app/data`.
4. In service networking, generate a public domain.
5. Open the generated domain and add a todo. Redeploy once, then confirm the todo is still listed.

The server automatically stores data under `RAILWAY_VOLUME_MOUNT_PATH` when Railway provides it. Locally, it stores `todos.json` beside `server.js`. Railway mounts volumes at runtime; do not store task data in the deploy's temporary filesystem.

## Deployment check

- Open the public URL and confirm the todo page loads.
- Check `GET /api/todos` returns JSON.
- Add a task, redeploy, and confirm the task remains.
- Complete and delete a task to confirm writes persist.
