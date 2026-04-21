# Voice Calling Test App (WebRTC)

Minimal 1-to-1 voice calling test app with:

- Frontend: React (Vite), WebRTC, Socket.IO client
- Backend: Node.js, Express, Socket.IO, MongoDB Atlas (Mongoose), JWT auth

Audio is peer-to-peer via WebRTC only. Backend is signaling/auth only.

## Project Structure

```txt
backend/
frontend/
```

## Backend Setup

1. Go to backend:

```bash
cd backend
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill in:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `USER1_EMAIL`, `USER1_PASSWORD`
- `USER2_EMAIL`, `USER2_PASSWORD`

4. Install and run:

```bash
npm install
npm run dev
```

## Frontend Setup

1. Go to frontend:

```bash
cd frontend
```

2. Create env file:

```bash
cp .env.example .env
```

3. Set:

- `VITE_API_URL=http://localhost:5000`
- `VITE_SOCKET_URL=http://localhost:5000`

4. Install and run:

```bash
npm install
npm run dev
```

## Two-User Test Flow

1. Open frontend URL in two tabs.
2. Tab 1 login as `USER1_EMAIL` / `USER1_PASSWORD`.
3. Tab 2 login as `USER2_EMAIL` / `USER2_PASSWORD`.
4. Click `Call` from one tab.
5. On other tab click `Accept` (or `Reject`).
6. Verify:
- status transitions: `Calling...`, `Incoming Call...`, `Connected`, `Call Ended`
- mute/unmute toggles microphone
- end button disconnects both sides
- debug logs show offer/answer/ICE + connection state

## Notes

- No signup.
- Credentials are only read from backend `.env`.
- Backend never handles/stores audio streams.
- Only optional `socketId` is tracked per user in MongoDB.
