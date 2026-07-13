import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import ThemeScript from '@/components/ThemeScript';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'CSE Study Portal',
  description: 'B.Tech CSE-B  Study materials for CP, CC, MWT, IoT, CS, IPR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeScript />
        <ThemeToggle />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
