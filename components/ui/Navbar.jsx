'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'worker') return '/worker/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  };

  const navLinks = user
    ? user.role === 'customer'
      ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/workers', label: 'Find Workers' }, { href: '/bookings', label: 'My Bookings' }, { href: '/profile', label: 'Profile' }]
      : user.role === 'worker'
      ? [{ href: '/worker/dashboard', label: 'Dashboard' }, { href: '/worker/jobs', label: 'Jobs' }, { href: '/worker/map', label: 'Map' }, { href: '/worker/profile', label: 'Profile' }]
      : [{ href: '/admin/dashboard', label: 'Dashboard' }, { href: '/admin/users', label: 'Users' }, { href: '/admin/workers', label: 'Workers' }, { href: '/admin/bookings', label: 'Bookings' }, { href: '/admin/categories', label: 'Categories' }, { href: '/admin/disputes', label: 'Disputes' }]
    : [{ href: '/', label: 'Home' }, { href: '/workers', label: 'Services' }];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-900/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={getDashboardLink()} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
              <span className="text-white font-bold text-sm">MW</span>
            </div>
            <span className="font-bold text-lg">
              <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Mint</span>
              <span className="gradient-text">Work</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markRead(); }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 glass-card shadow-2xl z-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                        <span className="font-semibold text-sm">Notifications</span>
                        <button onClick={markRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-sm">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`px-4 py-3 border-b border-slate-800/50 transition-colors ${!n.isRead ? 'bg-indigo-950/30' : ''}`}>
                              <p className="text-sm text-slate-200">{n.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar + logout */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-indigo-400 capitalize">{user.role}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm cursor-pointer">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <button
                    onClick={logout}
                    className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 mt-1 overflow-hidden animate-fade-in">
          <div className="py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-slate-800/50 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
