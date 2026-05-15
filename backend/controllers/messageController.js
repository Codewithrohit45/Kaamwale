const Message = require('../models/Message');
const User = require('../models/User');

// Helper: generate consistent conversationId from two user IDs
const getConversationId = (id1, id2) => {
  return [id1, id2].sort().join('_');
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Group by conversationId, get last message for each
    const convMap = {};
    for (const msg of messages) {
      if (!convMap[msg.conversationId]) {
        const otherUserId = msg.sender.toString() === userId ? msg.receiver : msg.sender;
        convMap[msg.conversationId] = {
          conversationId: msg.conversationId,
          otherUserId,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        };
      }
      // Count unread messages for this user
      if (msg.receiver.toString() === userId && !msg.read) {
        convMap[msg.conversationId].unreadCount++;
      }
    }

    // Fetch user details for each conversation partner
    const conversations = Object.values(convMap);
    const otherUserIds = conversations.map(c => c.otherUserId);
    const users = await User.find({ _id: { $in: otherUserIds } }).select('name image role category');

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const result = conversations.map(c => ({
      ...c,
      otherUser: userMap[c.otherUserId.toString()] || { name: 'Unknown' },
    }));

    // Sort by latest message
    result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const conversationId = getConversationId(req.user.id, req.params.otherUserId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const conversationId = getConversationId(req.user.id, receiverId);

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      receiver: receiverId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
