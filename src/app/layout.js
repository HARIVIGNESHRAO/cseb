import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import ThemeScript from '@/components/ThemeScript';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './suspension.module.css';

export const metadata = {
  title: 'Website Suspended | CSE Study Portal',
  description: 'This website has been suspended as per the instructions of the Head of Department (HOD).',
};

export default function RootLayout() {
  return (
    <html lang="en">
      <body>
        <ThemeScript />
        <ThemeToggle />
        <main className={styles.main}>
          <section className={styles.notice} aria-labelledby="suspension-title">
            <p className={styles.portal}>CSE Study Portal</p>
            <div className={styles.icon} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V6a4 4 0 0 1 8 0v4" />
                <path d="M12 14v3" />
              </svg>
            </div>
            <p className={styles.label}>Official notice</p>
            <h1 id="suspension-title" className={styles.title}>Website suspended</h1>
            <p className={styles.message}>
              This website has been suspended as per the instructions of the Head of Department (HOD).
            </p>
            <p className={styles.footer}>Thank you for your understanding.</p>
          </section>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
