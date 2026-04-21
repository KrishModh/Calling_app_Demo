import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import authRoutes, { getPeerEmail } from "./routes/auth.js";
import { authMiddleware, verifySocketToken } from "./middleware/auth.js";
import { User } from "./models/User.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = new Map();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);

app.get("/api/users/peer", authMiddleware, (req, res) => {
  const peerEmail = getPeerEmail(req.user.email);
  if (!peerEmail) {
    return res.status(404).json({ message: "Peer user not configured" });
  }
  return res.json({ peerEmail });
});

async function findSocketIdByEmail(email) {
  if (userSocketMap.has(email)) {
    return userSocketMap.get(email);
  }
  try {
    const user = await User.findOne({ email }).lean();
    return user?.socketId || null;
  } catch {
    return null;
  }
}

function relayEvent(socket, eventName, payload = {}) {
  return async () => {
    const { to, ...rest } = payload;
    if (!to) return;
    const targetSocketId = await findSocketIdByEmail(to);
    if (!targetSocketId) return;
    io.to(targetSocketId).emit(eventName, {
      from: socket.data.email,
      ...rest
    });
  };
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const email = verifySocketToken(token);
  if (!email) {
    return next(new Error("Unauthorized socket"));
  }
  socket.data.email = email;
  return next();
});

io.on("connection", async (socket) => {
  const email = socket.data.email;
  userSocketMap.set(email, socket.id);

  try {
    await User.updateOne({ email }, { $set: { email, socketId: socket.id } }, { upsert: true });
  } catch (error) {
    console.error("Failed to update socketId in DB:", error.message);
  }

  console.log(`Socket connected: ${email} -> ${socket.id}`);

  socket.on("call:offer", async (payload) => relayEvent(socket, "call:offer", payload)());
  socket.on("call:answer", async (payload) => relayEvent(socket, "call:answer", payload)());
  socket.on("ice:candidate", async (payload) => relayEvent(socket, "ice:candidate", payload)());
  socket.on("call:reject", async (payload) => relayEvent(socket, "call:reject", payload)());
  socket.on("call:end", async (payload) => relayEvent(socket, "call:end", payload)());

  socket.on("disconnect", async () => {
    userSocketMap.delete(email);
    try {
      await User.updateOne({ email }, { $set: { socketId: null } });
    } catch (error) {
      console.error("Failed to clear socketId in DB:", error.message);
    }
    console.log(`Socket disconnected: ${email}`);
  });
});

async function seedEnvUsers() {
  const users = [process.env.USER1_EMAIL, process.env.USER2_EMAIL].filter(Boolean);
  if (!users.length) return;
  await Promise.all(
    users.map((email) =>
      User.updateOne({ email }, { $setOnInsert: { email, socketId: null } }, { upsert: true })
    )
  );
}

async function start() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");

  await mongoose.connect(process.env.MONGO_URI);
  await seedEnvUsers();
  console.log("MongoDB connected");

  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});