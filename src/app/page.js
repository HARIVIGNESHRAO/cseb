import ExamCountdown from '@/components/ExamCountdown';
import HomeFeedbackForm from '@/components/HomeFeedbackForm';
import HomeSearch from '@/components/HomeSearch';
import HomeSemesterTabs from '@/components/HomeSemesterTabs';
import HomeStickyNav from '@/components/HomeStickyNav';
import Navbar from '@/components/Navbar';
import VisitCounter from '@/components/VisitCounter';
import styles from './page.module.css';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {
  return (
    <main id="sidebar-main-content" className={styles.main}>
      {/* Background grid */}
      <div className={styles.bgGrid} />

      {/* Primary responsive navbar */}
      <Navbar />

      {/* Legacy sticky nav */}
      <HomeStickyNav />

      {/* Header */}
      <header className={styles.header} style={{ paddingTop: 'calc(64px + 32px)' }}>
        <div className={styles.headerBadge}>
          <span className={styles.dot} />
          B.Tech · Computer Science &amp; Engineering
        </div>
        <h1 className={styles.title}>
          CSE-B
          <br /><span className={styles.titleAccent}>STUDY PORTAL</span>
        </h1>
        <p className={styles.subtitle}>
          All subjects · All units · All PDFs — in one place
        </p>
        <ExamCountdown />
        <VisitCounter />
      </header>

      <div id="search">
        <HomeSearch />
      </div>

      <HomeSemesterTabs />

      <HomeFeedbackForm />

      {/* Footer */}
    <footer className={styles.footer} id="feedback">
      <span className={styles.footerText}>© {new Date().getFullYear()} KMIT CSE Department. All Rights Reserved.</span>
    </footer>
      <SpeedInsights />
    </main>
  );
}