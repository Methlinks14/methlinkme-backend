const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Chat = require("../models/Chat");

// CREATE OR GET CHAT
router.post("/create/:userId", protect, async (req, res) => {
  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, req.params.userId] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, req.params.userId],
        messages: []
      });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SEND MESSAGE
router.post("/message/:chatId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    chat.messages.push({
      sender: req.user.id,
      text: req.body.text
    });

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET USER CHATS
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    }).populate("participants", "fullName email");

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;