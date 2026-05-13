'use client';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

const ACCENT_COLORS = [
  { name: 'Indigo', color: '#4F46E5' },
  { name: 'Rose', color: '#F43F5E' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Sky', color: '#0EA5E9' },
];

export default function ThemeToggle() {
  const { theme, toggleTheme, accentColor, changeAccent } = useTheme();
  const [showAccents, setShowAccents] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {/* Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-slate-800 transition-colors border border-slate-700"
        title="Toggle Theme"
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>

      {/* Accent Customizer */}
      <div className="relative">
        <button
          onClick={() => setShowAccents(!showAccents)}
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: accentColor }}
          title="Change Accent Color"
        />

        {showAccents && (
          <div className="absolute right-0 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 min-w-[150px]">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Accent Color</p>
            <div className="grid grid-cols-5 gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    changeAccent(c.color);
                    setShowAccents(false);
                  }}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                    accentColor === c.color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
