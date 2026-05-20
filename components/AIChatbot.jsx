'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm MintBot 🤖. Tell me what's broken or what service you need, and I'll find the right pro for you!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const pathname = usePathname();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

   
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register') return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { 
          text: data.response.text, 
          isBot: true,
          category: data.response.category 
        }]);
      } else {
        setMessages(prev => [...prev, { text: 'Sorry, I am having trouble connecting right now.', isBot: true }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Sorry, my systems are temporarily offline.', isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = ['My AC is not cooling', 'Sink is leaking', 'Need to paint my room'];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {!isOpen && (
          <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-xl animate-bounce whitespace-nowrap">
            Need help? Chat with AI 🤖
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 ${
            isOpen ? 'bg-slate-800' : 'bg-gradient-to-r from-indigo-500 to-violet-600'
          }`}
        >
          <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] glass-card flex flex-col overflow-hidden z-50 animate-fade-in shadow-2xl shadow-indigo-500/20 border-indigo-500/30 border">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 bg-indigo-900/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-white">MintBot AI</h3>
              <p className="text-xs text-indigo-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.isBot ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700' : 'bg-indigo-600 text-white rounded-tr-sm'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                  
                  {msg.category && (
                    <Link 
                      href={`/workers?category=${msg.category}`}
                      onClick={() => setIsOpen(false)}
                      className="mt-3 block text-center bg-indigo-500 text-white font-medium py-2 px-4 rounded-xl hover:bg-indigo-400 transition-colors"
                    >
                      Find {msg.category} Pros
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 border border-slate-700">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {quickReplies.map(reply => (
                <button
                  key={reply}
                  onClick={() => { setInput(reply); setTimeout(() => handleSend({ preventDefault: () => {} }), 100); }}
                  className="whitespace-nowrap text-xs bg-slate-800/50 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-3 py-1.5 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <div className="p-3 bg-slate-900 border-t border-slate-700">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MintBot anything..."
                className="w-full bg-slate-800 text-sm text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
