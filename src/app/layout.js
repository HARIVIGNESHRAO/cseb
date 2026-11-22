import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import ThemeScript from '@/components/ThemeScript';
import ThemeToggle from '@/components/ThemeToggle';
import OfflineSupport from '@/components/OfflineSupport';
import { developmentOfflineReset } from '@/lib/developmentOfflineReset';

export const metadata = {
  title: 'DHURANDHAR',
  description: 'B.Tech DHURANDHAR  Study materials for CP, CC, MWT, IoT, CS, IPR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === 'development' && (
          <script dangerouslySetInnerHTML={{ __html: developmentOfflineReset }} />
        )}
        <ThemeScript />
        <div className="portalUtilityBar">
          <OfflineSupport />
          <ThemeToggle />
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
