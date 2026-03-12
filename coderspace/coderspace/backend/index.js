import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import axios from "axios";
import cors from "cors";

const execFileAsync = promisify(execFile);
const app = express();
app.use(cors({ origin: "*" }));


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("user Disconnected");
  });
});

app.use(express.json());

// Run Code Endpoint
app.post("/run-code", async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: "Missing code or language" });
  }

  try {
    if (language === "cpp") {
      const tmp = os.tmpdir();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const srcPath = path.join(tmp, `code-${id}.cpp`);
      const exePath = path.join(tmp, `code-${id}.exe`);

      await fs.writeFile(srcPath, code, "utf8");
      await execFileAsync("g++", ["-std=c++17", srcPath, "-o", exePath], { timeout: 10000 });
      const runResult = await execFileAsync(exePath, { timeout: 5000, maxBuffer: 1024 * 1024 });

      const output = (runResult.stdout || "") + (runResult.stderr || "");

      await fs.unlink(srcPath).catch(() => {});
      await fs.unlink(exePath).catch(() => {});

      return res.json({ output: output || "No output" });
    }

    // Fallback to Piston for other languages (if configured in env)
    const pistonUrl = process.env.PISTON_URL || "https://emkc.org/api/v2/piston/execute";
    const response = await axios.post(pistonUrl, {
      language,
      version: "*",
      files: [{ name: "Main", content: code }],
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const output = response.data.run?.output || response.data.run?.stderr || response.data.output || "No output";
    return res.json({ output });
  } catch (error) {
    const details = error?.response?.data || error?.stderr || error?.message || "Unknown error";
    console.error("Error running code:", details);
    return res.status(500).json({ error: "Failed to run code", details });
  }
});

const defaultPort = process.env.PORT || 5000;
const port = Number(defaultPort) || 5000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log(`server is currently working on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Please stop the other process or set PORT to a free port.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
