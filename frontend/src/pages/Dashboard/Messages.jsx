import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSend, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const SOCKET_URL = 'http://localhost:5000';

export default function Messages() {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers: globalOnlineUsers, clearUnread } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { otherUser, conversationId }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const userId = user?._id || user?.id;

  // Clear unread count when entering messages
  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  // Handle socket events locally for chat
  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
      // Update conversation list too
      setConversations(prev => prev.map(c => {
        if (c.conversationId === data.conversationId) {
          return { ...c, lastMessage: data.text, lastMessageTime: data.createdAt || new Date().toISOString() };
        }
        return c;
      }));
    });

    socket.on('userTyping', ({ senderName }) => setTyping(`${senderName} is typing...`));
    socket.on('userStopTyping', () => setTyping(''));

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('userStopTyping');
    };
  }, [socket]);

  // Fetch conversations
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setConversations(data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchConvos();
  }, [user]);

  // Handle startChatWith redirect state
  useEffect(() => {
    if (loading || !user) return;
    
    const startChatWith = location.state?.startChatWith;
    if (startChatWith) {
      const existingConv = conversations.find(c => c.otherUser?._id === startChatWith._id);
      
      if (existingConv) {
        openChat(existingConv);
      } else {
        // Create temporary conversation card
        const conversationId = [userId, startChatWith._id].sort().join('_');
        const tempConv = {
          conversationId,
          otherUser: startChatWith,
          lastMessage: 'Tap to start chatting!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
        setConversations(prev => {
          const exists = prev.find(c => c.conversationId === conversationId);
          if (exists) return prev;
          return [tempConv, ...prev];
        });
        setActiveChat({ otherUser: startChatWith, conversationId });
      }
    }
  }, [location.state, conversations, loading, userId, user]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${activeChat.otherUser._id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    fetchMessages();
  }, [activeChat, user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const msgData = {
      conversationId: activeChat.conversationId,
      sender: userId,
      receiver: activeChat.otherUser._id,
      receiverId: activeChat.otherUser._id,
      text: input,
      createdAt: new Date().toISOString(),
    };

    // Emit to socket for real-time
    socket?.emit('sendMessage', msgData);
    socket?.emit('stopTyping', { receiverId: activeChat.otherUser._id });

    // Save to DB
    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ receiverId: activeChat.otherUser._id, text: input })
      });
    } catch (err) {
      console.error('Send failed', err);
    }

    // Add to local state
    setMessages(prev => [...prev, msgData]);
    setInput('');

    // Update conversation list
    setConversations(prev => prev.map(c => {
      if (c.conversationId === activeChat.conversationId) {
        return { ...c, lastMessage: msgData.text, lastMessageTime: msgData.createdAt };
      }
      return c;
    }));
  };

  const handleTyping = () => {
    if (!activeChat || !socket) return;
    socket.emit('typing', { receiverId: activeChat.otherUser._id, senderName: user.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: activeChat.otherUser._id });
    }, 1500);
  };

  const openChat = (conv) => {
    const conversationId = [userId, conv.otherUser._id].sort().join('_');
    setActiveChat({ otherUser: conv.otherUser, conversationId });
    setTyping('');
  };

  const isOnline = (id) => globalOnlineUsers.includes(id?.toString());

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{onlineUsers.length} users online</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center py-8 text-slate-500 text-sm">Loading chats...</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FiMessageCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No conversations yet.</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Start a conversation from a provider's profile or booking.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.conversationId}
                onClick={() => openChat(conv)}
                className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors ${activeChat?.conversationId === conv.conversationId ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.otherUser?.image || `https://ui-avatars.com/api/?name=${conv.otherUser?.name?.replace(' ','+')}&background=random`}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                    {isOnline(conv.otherUser?._id) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{conv.otherUser?.name}</h3>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <FiMessageCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={60} />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-1 text-slate-600 dark:text-slate-400"><FiArrowLeft size={20} /></button>
                <div className="relative">
                  <img
                    src={activeChat.otherUser?.image || `https://ui-avatars.com/api/?name=${activeChat.otherUser?.name?.replace(' ','+')}&background=random`}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                  />
                  {isOnline(activeChat.otherUser?._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{activeChat.otherUser?.name}</h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    {typing || (isOnline(activeChat.otherUser?._id) ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">No messages yet. Say hello! 👋</p>
              )}
              {messages.map((msg, idx) => {
                const isMine = msg.sender === userId || msg.sender?._id === userId;
                return (
                  <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? 'bg-teal-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-teal-200' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center justify-center w-10 h-10 disabled:opacity-40"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
