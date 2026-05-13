'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';

export default function ChatBox({ bookingId, otherUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial messages & setup socket
  useEffect(() => {
    // Fetch history
    fetch(`/api/bookings/${bookingId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });

    // Setup socket
    const socketIo = io(window.location.origin);
    setSocket(socketIo);

    socketIo.emit('join_booking', bookingId);

    socketIo.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [bookingId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage(''); // optimistic clear

    // Save to DB
    const res = await fetch(`/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const data = await res.json();
      // Emit via socket
      socket?.emit('send_message', {
        ...data.message,
        bookingId
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-700 text-slate-200 rounded-bl-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] opacity-50 mt-1 block text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1 text-sm bg-slate-900 border-slate-700 focus:border-indigo-500 rounded-full px-4"
            placeholder={`Message ${otherUser?.name || 'User'}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
