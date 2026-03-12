import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";
import cors from "cors";
import fs from "fs/promises";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
async function runCodeLocally(language, code) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "coderspace-"));
  let srcFile;
  let compileCmd;
  let runCmd;

  if (language === "cpp") {
    srcFile = path.join(tempDir, "Main.cpp");
    const exeFile = path.join(tempDir, process.platform === "win32" ? "Main.exe" : "Main");
    compileCmd = `g++ -std=c++17 -O2 -o "${exeFile}" "${srcFile}"`;
    runCmd = `"${exeFile}"`;
  } else if (language === "python") {
    srcFile = path.join(tempDir, "Main.py");
    // Support both python and python3 installs.
    runCmd = `python "${srcFile}"`;
  } else if (language === "javascript") {
    srcFile = path.join(tempDir, "Main.js");
    runCmd = `node "${srcFile}"`;
  } else if (language === "java") {
    srcFile = path.join(tempDir, "Main.java");
    compileCmd = `javac "${srcFile}"`;
    runCmd = `java -cp "${tempDir}" Main`;
  } else {
    throw new Error("Unsupported local language");
  }

  try {
    await fs.writeFile(srcFile, code, "utf8");

    if (compileCmd) {
      await execAsync(compileCmd, { timeout: 15000 });
    }

    const { stdout, stderr } = await execAsync(runCmd, { timeout: 15000 });
    return (stderr || stdout || "(no output)").toString();
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Failed to clean up temp files:", cleanupErr.message);
    }
  }
}

app.post("/run-code", async (req, res) => {
  const { code, language } = req.body;

  const localLanguages = new Set(["cpp", "python", "javascript", "java"]);

  if (localLanguages.has(language)) {
    try {
      const output = await runCodeLocally(language, code);
      return res.json({ output });
    } catch (error) {
      console.warn("Local execution failed, falling back to remote Piston if available:", error.message);
      // Continue to fallback to remote execution.
    }
  }

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language,
      version: "*",
      files: [
        {
          name: "Main",
          content: code,
        },
      ],
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    const output = response.data.run.output || response.data.run.stderr || "No output";
    res.json({ output });
  } catch (error) {
    console.error("Error running code:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to run code",
      details: error?.response?.data || error.message,
    });
  }
});

const port = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log("server is currently working on port 5000");
});
