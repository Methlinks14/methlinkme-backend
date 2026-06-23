const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

// ==========================
// APP INIT
// ==========================
const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/chat", require("./routes/chat"));

// ==========================
// CREATE HTTP SERVER
// ==========================
const server = http.createServer(app);

// ==========================
// SOCKET.IO SETUP
// ==========================
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("📥 Joined room:", roomId);
  });

  // SEND MESSAGE
  socket.on("sendMessage", (data) => {
    const { roomId } = data;

    io.to(roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ==========================
// START SERVER (IMPORTANT FOR RENDER)
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});