import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { useToast } from '../components/NotificationToast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const addToast = useToast();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.token) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('register', user._id);
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('newMessage', (data) => {
        // Increment unread count if not on messages page
        const isMessagePage = window.location.pathname === '/user/messages' || window.location.pathname === '/provider/messages';
        if (!isMessagePage) {
          setUnreadCount(prev => prev + 1);
          addToast(`New message from ${data.senderName || 'someone'}`, 'info');
        }
      });

      newSocket.on('bookingStatusChanged', ({ status }) => {
        addToast(`Booking status updated to ${status}!`, 'success');
        // Optional: refresh data or trigger a global refresh event
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, addToast]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, unreadCount, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
};
