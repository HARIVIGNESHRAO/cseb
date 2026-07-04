'use client';

import styles from '@/app/page.module.css';

export default function ExamCountdown() {
  return (
    <section className={styles.examCountdown} aria-live="polite">
      <div className={styles.examCountdownMeta}>
        <div className={styles.examCountdownText}>
          <span className={styles.examCountdownLabel}>Student Hub</span>
          <span className={styles.examCountdownName}>Quick Dashboard Links</span>
        </div>
        <span className={styles.examCountdownDate}>Portals Live</span>
      </div>

      {/* Quick Links Grid */}
      <div className={styles.quickLinksGrid}>
        {/* Netra Login */}
        <a 
          href="https://kmit.teleuniv.in/netra" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.examCountdownItem}
        >
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>👁️‍🗨️</span>
          </div>
          <span className={styles.examCountdownValue}>Netra Login</span>
          <span className={styles.examCountdownUnit}>Attendance Portal</span>
        </a>

        {/* Results / Hall Ticket */}
        <a 
          href="https://portal.teleuniv.in/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.examCountdownItem}
        >
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>📜</span>
          </div>
          <span className={styles.examCountdownValue}>Results / Hall Ticket</span>
          <span className={styles.examCountdownUnit}>Teleuniv Exam Portal</span>
        </a>

        {/* KMIT Official */}
        <a 
          href="https://www.kmit.in/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.examCountdownItem}
        >
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>🌐</span>
          </div>
          <span className={styles.examCountdownValue}>KMIT Official</span>
          <span className={styles.examCountdownUnit}>Main Website</span>
        </a>
      </div>
    </section>
  );
}