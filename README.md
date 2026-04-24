# SmileCalendar - TimeTree Clone

A collaborative calendar web application with role-based access control and real-time updates.

## 🚀 Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, FullCalendar, Zustand, Socket.io-client

## 🔑 Core Features

- **Auth**: JWT-based login and registration.
- **Calendars**: Create and share multiple calendars.
- **RBAC**: 
  - `Owner`: Full control, manage members.
  - `Editor`: Create, edit, and delete events.
  - `Commentor`: View events and add comments.
  - `Viewer`: Read-only access.
- **Real-time**: Instant sync of events and comments using Socket.io.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a connection string)

### Installation

1. **Install dependencies for both folders**:
   ```bash
   npm run install:all
   ```

2. **Configure Environment**:
   Create a `.env` file in the `backend` directory (one has been created for you):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smilecalendar
   JWT_SECRET=your_secret_key
   ```

3. **Start the application**:
   ```bash
   npm run dev:backend
   # In another terminal
   npm run dev:frontend
   ```
   Or use `npm install -g concurrently` and run `npm run dev` (if configured in root).

## 📖 API Documentation

### Auth
- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Login and get JWT token.
- `GET /api/auth/me`: Get current user info (requires token).

### Calendars
- `GET /api/calendars`: List all calendars you are a member of.
- `POST /api/calendars`: Create a new calendar.
- `GET /api/calendars/:calendarId`: Get calendar details.
- `POST /api/calendars/:calendarId/invite`: Invite a user by email with a role.

### Events
- `GET /api/events/:calendarId`: List events for a calendar.
- `POST /api/events`: Create an event (requires Editor/Owner role).
- `PUT /api/events/:eventId`: Update an event.
- `DELETE /api/events/:eventId`: Delete an event.

### Comments
- `GET /api/comments/:eventId`: Get comments for an event.
- `POST /api/comments`: Add a comment (requires Commentor+ role).

## 📡 Real-time Events (Socket.io)
- `join:calendar`: Client joins a calendar room.
- `event:created`: Emitted to room when an event is added.
- `event:updated`: Emitted when an event is changed.
- `event:deleted`: Emitted when an event is removed.
- `comment:added`: Emitted when a new comment is posted.

## 🧠 Architectural Decisions

1. **Zustand for State**: Chosen for its minimal boilerplate and ease of use with TypeScript compared to Redux.
2. **RBAC Middleware**: Centralized permission checking to ensure security and consistency across all routes.
3. **Socket.io Integration**: Integrated directly into controllers to ensure that every successful DB write also triggers a real-time update.
4. **Vite + TS**: Provides a fast development experience and type safety across the frontend.
5. **Tailwind CSS**: Used for rapid, responsive UI development without leaving the HTML/JSX.

## 📝 Example Request (Login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
```
