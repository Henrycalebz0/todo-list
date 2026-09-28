# Railway deployment with persistent task storage

Live app: <https://todo-list-production-bd36.up.railway.app>

The `todo-list` service is deployed from the CLI, and a persistent volume is mounted at `/app/data`. The server automatically stores `todos.json` under `RAILWAY_VOLUME_MOUNT_PATH`. Locally, it stores `todos.json` beside `server.js`.

The deployed service currently uses the source uploaded from this folder. To enable automatic deployments from GitHub pushes, connect the Railway GitHub integration to `Henrycalebz0/todo-list` and select the `main` branch. Railway did not have repository integration access when this service was created.

Railway mounts volumes at runtime; do not store task data in the deploy's temporary filesystem. See [Railway's volume guide](https://docs.railway.com/volumes).

## Deployment check

- Open the public URL and confirm the todo page loads.
- Check `GET /api/todos` returns JSON.
- Add a task, redeploy, and confirm the task remains.
- Complete and delete a task to confirm writes persist.
