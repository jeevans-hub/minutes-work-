import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import AIChatbot from '@/components/AIChatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MintWork — Book Skilled Workers Near You',
  description: 'Find and book trusted plumbers, electricians, carpenters, cleaners and more. Fast, reliable, nearby.',
  keywords: 'worker booking, plumber, electrician, carpenter, cleaner, home services',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen transition-colors duration-300`}>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <AIChatbot />
            </ThemeProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
