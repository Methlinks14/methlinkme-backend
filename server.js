const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", require("./routes/chat"));

// HTTP SERVER
const server = http.createServer(app);

// SOCKET SETUP
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN CHAT ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  // SEND MESSAGE
  socket.on("sendMessage", (data) => {
    const { roomId } = data;

    io.to(roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});