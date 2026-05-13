'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(undefined, {
      path: '/socket.io',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      const userId = user?.id || user?._id;
      if (userId) {
        socketInstance.emit('join_user', userId);
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  // Re-join user room when user changes (login/logout)
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (socket && userId) {
      socket.emit('join_user', userId);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
