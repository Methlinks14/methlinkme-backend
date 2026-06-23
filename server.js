const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();

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
// ROUTES (KEEP YOUR EXISTING STRUCTURE)
// ==========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));

// ==========================
// CREATE HTTP SERVER (CRITICAL FIX)
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

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ==========================
// START SERVER (RENDER SAFE)
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});