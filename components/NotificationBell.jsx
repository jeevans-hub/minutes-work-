'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socket = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Optional: Show a browser notification or toast
        if (Notification.permission === 'granted') {
          new Notification('MintWork', { body: notification.message });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_notification');
      }
    };
  }, [socket]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read
      try {
        await fetch('/api/notifications', { method: 'PUT' });
        setUnreadCount(0);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-white">Notifications</h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  href={notif.bookingId ? `/bookings/${notif.bookingId}` : '/'}
                  onClick={() => setIsOpen(false)}
                  className={`block p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                    !notif.isRead ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {notif.message}
                  </p>
                  <span className="text-xs text-slate-500 block mt-1">
                    {new Date(notif.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
