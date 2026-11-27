# Focus Desk

Focus Desk is a full-stack productivity web app. It combines a task manager with a Pomodoro-style focus timer, so you can pick one task and work on it in timed sessions.

## Features

- Add, complete, filter (All / Open / Done) and delete tasks
- Select a task to focus on and run 25-minute focus sessions
- 5-minute and 15-minute break modes
- Daily count of completed focus sessions
- Responsive layout for phones and desktops
- Tasks are stored on the server in a JSON file

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Backend:** Node.js, Express
- **Storage:** JSON file (`backend/tasks.json`)

## Project structure

```
focus-desk-fullstack/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
```

## How to run

1. Install [Node.js](https://nodejs.org) (version 18 or newer).
2. Open a terminal in the project folder and run:

```bash
cd backend
npm install
npm start
```

3. Open http://localhost:3000 in your browser.

The Express server serves the frontend and the API from the same address.

## API endpoints

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| GET    | `/api/tasks`     | Get all tasks                   |
| POST   | `/api/tasks`     | Add a task (`{ "text": "..." }`) |
| PATCH  | `/api/tasks/:id` | Update a task (`{ "done": true }`) |
| DELETE | `/api/tasks/:id` | Delete a task                   |

## Author

Your Name
