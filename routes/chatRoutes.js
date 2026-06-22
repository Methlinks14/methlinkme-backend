const express = require('express');
const router = express.Router();
const {
  startChat,
  sendMessage,
  getChatHistory,
  getMyChats
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startChat);
router.post('/message', protect, sendMessage);
router.get('/my-chats', protect, getMyChats);
router.get('/:roomId', protect, getChatHistory);

module.exports = router;