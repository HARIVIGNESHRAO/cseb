import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import ThemeScript from '@/components/ThemeScript';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'DHURANDHAR',
  description: 'B.Tech DHURANDHAR  Study materials for CP, CC, MWT, IoT, CS, IPR',
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
