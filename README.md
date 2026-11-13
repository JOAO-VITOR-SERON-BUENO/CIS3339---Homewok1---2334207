# CIS 3339 Homework 1: Student Management System

A full-stack student, course, and enrollment manager built with **Vue 3 (Composition API)**, **Vue Router**, **Pinia**, **Express**, and **MongoDB**.

> The original assignment instructions are in [ASSIGNMENT.md](ASSIGNMENT.md).

## Features

- **Students:** add (name, student ID, phone, ZIP), search by name or student ID, view, and delete
- **Courses:** add (course ID, course name), list with enrollment counts, and delete
- **Enrollments:** enroll an existing student in an existing course, and view any course's roster
- Validation on both the client and the server, with duplicate students, courses, and enrollments rejected
- Deleting a student or course also deletes its enrollments
- Loading, success, error, and empty states; responsive and keyboard/screen-reader accessible

## Required Software

| Software | Version |
| --- | --- |
| [Node.js](https://nodejs.org/) (includes npm) | 20.19 or newer (tested with Node 24) |
| [MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/) | 7.0 or newer, running locally |
| A modern web browser | Chrome, Edge, Firefox, or Safari |

## Environment Variables

The real configuration file is committed at [`backend/.env`](backend/.env):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGODB_URI` | Local MongoDB connection string (no credentials) | `mongodb://127.0.0.1:27017/cis3339_homework1` |
| `PORT` | Port for the Express server (API + built Vue app) | `3000` |

No other setup is needed. The database, collections, and unique indexes are created automatically the first time the server starts, so there's no seed, migration, or import step.

## 1. Start MongoDB Community Edition

**macOS (Homebrew):**

```bash
brew services start mongodb-community
```

**Windows:** MongoDB runs as the `MongoDB` Windows service after installation. If it's stopped, start it from *Services* or run, as Administrator:

```powershell
net start MongoDB
```

**Linux (systemd):**

```bash
sudo systemctl start mongod
```

To verify it's running: `mongosh --eval "db.runCommand({ ping: 1 })"` should print `{ ok: 1 }`.

## 2. Install, Build, and Run (Production)

Run these from the **project root**:

```bash
npm install      # installs root, backend, and frontend dependencies
npm run build    # builds the Vue app into frontend/dist
npm start        # starts Express, which serves the API and the built app
```

Then open **<http://localhost:3000>** in your browser.

You should see this in the terminal:

```text
Server is running on http://localhost:3000
Connected to MongoDB (database: cis3339_homework1)
```

If MongoDB isn't running yet, the server keeps retrying every 5 seconds and connects as soon as MongoDB is available. Data persists in MongoDB across server restarts.

## Development Mode (optional)

Hot-reloading frontend with the API proxied to Express. Use two terminals:

```bash
npm run dev:backend    # Express API on http://localhost:3000
npm run dev:frontend   # Vite dev server on http://localhost:5173
```

## REST API

All endpoints are under `/api` and return JSON. Errors have the form `{ "error": "message" }`.

| Method | Endpoint | Description | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/students?search=term` | List students, optionally filtered by name (partial) or student ID | 200 | |
| GET | `/api/students/:id` | Get one student | 200 | 400, 404 |
| POST | `/api/students` | Add a student `{ name, studentId, phone, zip }` | 201 | 400, 409 |
| DELETE | `/api/students/:id` | Delete a student **and their enrollments** | 200 | 400, 404 |
| GET | `/api/courses` | List courses with `enrollmentCount` | 200 | |
| POST | `/api/courses` | Add a course `{ courseId, name }` | 201 | 400, 409 |
| DELETE | `/api/courses/:id` | Delete a course **and its enrollments** | 200 | 400, 404 |
| GET | `/api/enrollments?courseId=:id` | Get a course and its enrolled students | 200 | 400, 404 |
| POST | `/api/enrollments` | Enroll `{ studentId, courseId }` (MongoDB `_id`s) | 201 | 400, 404, 409 |
| DELETE | `/api/enrollments/:id` | Remove one enrollment | 200 | 400, 404 |

`503` is returned if MongoDB is unavailable.

## Data Model (MongoDB)

| Collection | Fields | Constraints |
| --- | --- | --- |
| `students` | `studentId`, `name`, `phone`, `zip` | `studentId` unique, 1–10 digits; ZIP is `12345` or `12345-6789` |
| `courses` | `courseId`, `name` | `courseId` unique (stored uppercase, e.g. `CIS 3339`) |
| `enrollments` | `student` → students, `course` → courses | unique on (`student`, `course`) |

## Project Structure

```text
├── package.json            # root scripts: install / build / start
├── backend/
│   ├── .env                # MongoDB connection (committed)
│   ├── server.js           # Express app: API + serves frontend/dist
│   ├── config.js, db.js    # env loading, MongoDB connection + auto-initialization
│   ├── models/             # Mongoose schemas: Student, Course, Enrollment
│   ├── routes/             # REST endpoints
│   └── middleware/         # error handling and validation helpers
└── frontend/
    ├── vite.config.js
    └── src/
        ├── main.js, App.vue
        ├── router/         # Vue Router routes
        ├── stores/         # Pinia stores: students, courses, enrollments, notifications
        ├── api/            # fetch wrapper for the REST API
        ├── views/          # Students, Courses, Enrollments, NotFound pages
        └── components/     # reusable forms, tables, fields, and status messages
```

## Troubleshooting

- **"Could not connect to MongoDB… Retrying"**: start MongoDB (step 1). The server connects automatically once it's up.
- **"Port 3000 is already in use"**: stop the other process, or change `PORT` in `backend/.env`.
- **Page says the frontend has not been built**: run `npm run build`, then refresh.
