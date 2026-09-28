# Todo API endpoints to test

Base URL: `http://localhost:3000`

| Method | Endpoint | Expected checks |
| --- | --- | --- |
| GET | `/api/todos` | Returns `200` and a JSON array (empty initially). |
| POST | `/api/todos` | Valid `{ "title": "Buy milk" }` returns `201` and a todo with `id`, `completed: false`, and `createdAt`. |
| POST | `/api/todos` | Missing, blank, or whitespace-only title returns `400`. |
| PATCH | `/api/todos/:id` | `{ "completed": true }` returns `200` with updated todo. |
| PATCH | `/api/todos/:id` | `{ "title": "Updated task" }` returns `200` with trimmed title. |
| PATCH | `/api/todos/:id` | Invalid title or non-boolean `completed` returns `400`. |
| PATCH | `/api/todos/:id` | Unknown ID returns `404`. |
| DELETE | `/api/todos/:id` | Existing todo returns `200` with deleted todo; subsequent GET no longer includes it. |
| DELETE | `/api/todos/:id` | Unknown ID returns `404`. |
| Any | Unknown `/api/...` route | Returns `404` JSON error. |
| Any | Wrong method on a recognized collection/resource route | Returns `405` and an `Allow` header. |

## Quick manual run

Start the app with `npm start`, then try:

```sh
curl http://localhost:3000/api/todos
curl -X POST http://localhost:3000/api/todos -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
```

The created todo's ID can then be used for PATCH and DELETE checks.
