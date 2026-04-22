# 📞 Twilio Voice Calling App

<div align="center">

![Voice Calling](https://img.shields.io/badge/Twilio-Voice%20Calling-F22F46?style=for-the-badge&logo=twilio&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![MongoDB](https://img.shields.io/badge/DB-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### 🚀 Real-time browser-to-browser voice calling — no phone needed!

[🐛 Report Bug](https://github.com/KrishModh/Calling_app_Demo/issues) &nbsp;·&nbsp; [💼 Connect with Me](https://www.linkedin.com/in/krish-modh-b38447300/)

</div>

## 🎬 Features

| Feature | Status |
|---------|--------|
| 🔐 JWT Login (2 pre-configured users) | ✅ |
| 📞 Outgoing calls (browser-to-browser) | ✅ |
| 📲 Incoming call with Accept / Reject | ✅ |
| 🔇 Mute / Unmute during call | ✅ |
| 📴 End Call | ✅ |
| 📝 Call log storage (MongoDB) | ✅ Optional |

---

## 🧱 Tech Stack

```
Frontend  →  React (Vite) + Twilio Voice JS SDK
Backend   →  Node.js + Express + JWT Auth
Calling   →  Twilio Programmable Voice
Database  →  MongoDB Atlas (optional, for call logs)
Deploy    →  Vercel (frontend) + Render (backend)
```

---

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── voiceController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── Call.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── voiceRoutes.js
│   ├── utils/
│   │   ├── db.js
│   │   └── twilio.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

---

## ⚙️ Local Setup

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/KrishModh/Calling_app_Demo.git
cd Calling_app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=                         # optional

JWT_SECRET=your_strong_jwt_secret

USER1_EMAIL=user1@example.com
USER1_PASSWORD=pass1234
USER2_EMAIL=user2@example.com
USER2_PASSWORD=pass5678

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

```bash
npm run dev   # runs on http://localhost:5000
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev   # runs on http://localhost:5173
```

---

## 🔧 Twilio Configuration

### Step 1 — Get Credentials
| Credential | Where to Find |
|-----------|---------------|
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) → Dashboard |
| `TWILIO_API_KEY` + `TWILIO_API_SECRET` | Console → API Keys → Create new |
| `TWILIO_TWIML_APP_SID` | Console → Voice → TwiML Apps → Create |

### Step 2 — Set TwiML App Voice URL

In your TwiML App settings, set the **Voice Request URL** to:

```
POST https://<your-backend-url>/api/voice/twiml/voice
```

> For local dev, use [ngrok](https://ngrok.com): `ngrok http 5000`

---

## 🌐 API Endpoints

```
POST   /api/auth/login              → Login, returns JWT
GET    /api/voice/token             → Generate Twilio token (JWT required)
POST   /api/voice/twiml/voice       → Twilio webhook (handles call routing)
POST   /api/voice/calls/log         → Save call log (JWT required, optional)
GET    /api/health                  → Health check
```

---

## 🧪 How to Test Calls

```
1. Open app in two tabs (or two browsers)
2. Tab A  →  Login as USER1
3. Tab B  →  Login as USER2
4. Tab A  →  Click "Call"
5. Tab B  →  Click "Accept"
6. Talk!  →  Test Mute / End Call
```

---

## 🚀 Deployment

| Service | Purpose | Config |
|---------|---------|--------|
| **Vercel** | Frontend hosting | Auto-deploy from GitHub |
| **Render** | Backend hosting | Start command: `node server.js` |
| **MongoDB Atlas** | Call logs DB | Optional |

---

## 🔒 Security Notes

- Never commit real secrets to GitHub
- All sensitive values go in `.env` only
- Frontend never receives Twilio API secret

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| `401 on /api/voice/token` | Token expired — login again |
| `Application Error` on call | Check TwiML App Voice URL is correct |
| Incoming call not ringing | TwiML App URL must be public (not localhost) |
| No call logs saved | Check `MONGO_URI` — MongoDB is optional |
| `Cannot GET /voice/...` | URL is wrong — must use `/api/voice/...` |

---

## 👨‍💻 Built By

<div align="center">

**Krish Modh**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/krish-modh-b38447300/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/KrishModh)

*If this helped you, drop a ⭐ on the repo!*

</div>