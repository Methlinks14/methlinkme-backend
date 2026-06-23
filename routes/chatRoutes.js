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

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET SINGLE CHAT
router.get("/:roomId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.roomId)
      .populate("participants", "fullName email");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// SEND MESSAGE
router.post("/message", protect, async (req, res) => {
  try {
    const { roomId, content } = req.body;

    const chat = await Chat.findById(roomId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    chat.messages.push({
      sender: req.user.id,
      content,
      createdAt: new Date()
    });

    await chat.save();

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET USER CHATS
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    }).populate("participants", "fullName email");

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;