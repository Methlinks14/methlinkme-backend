const Chat = require('../models/Chat');
const { v4: uuidv4 } = require('uuid');

// @desc    Start or get existing chat room
// @route   POST /api/chat/start
exports.startChat = async (req, res) => {
  try {
    const { providerId } = req.body;
    const userId = req.user.id;

    let chat = await Chat.findOne({
      user: userId,
      provider: providerId
    });

    if (!chat) {
      chat = await Chat.create({
        roomId: uuidv4(),
        user: userId,
        provider: providerId,
        messages: []
      });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/message
exports.sendMessage = async (req, res) => {
  try {
    const { roomId, content } = req.body;

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    chat.messages.push({ sender: req.user.id, content });
    chat.lastMessage = content;
    chat.lastMessageDate = Date.now();
    await chat.save();

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/:roomId
exports.getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ roomId: req.params.roomId })
      .populate('user', 'fullName avatar')
      .populate('provider', 'businessName profilePicture');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all my chats
// @route   GET /api/chat/my-chats
exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ user: req.user.id }, { provider: req.user.id }]
    })
      .populate('user', 'fullName avatar')
      .populate('provider', 'businessName profilePicture')
      .sort({ lastMessageDate: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};