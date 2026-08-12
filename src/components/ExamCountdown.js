'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/app/page.module.css';

const EXAMS = [
  {
    subject: 'Business Economics and Financial Analysis',
    dateLabel: '22 Aug 2026',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-08-22T09:30:00+05:30',
    end: '2026-08-22T11:30:00+05:30',
  },
  {
    subject: 'Software Testing Methodologies',
    dateLabel: '22 Aug 2026',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-08-22T12:00:00+05:30',
    end: '2026-08-22T14:00:00+05:30',
  },
  {
    subject: 'Data Mining',
    dateLabel: '22 Aug 2026',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-08-22T14:30:00+05:30',
    end: '2026-08-22T16:30:00+05:30',
  },
  {
    subject: 'Information Retrieval System',
    dateLabel: '23 Aug 2026',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-08-23T09:30:00+05:30',
    end: '2026-08-23T11:30:00+05:30',
  },
  {
    subject: 'Data Visualization Techniques',
    dateLabel: '23 Aug 2026',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-08-23T12:00:00+05:30',
    end: '2026-08-23T14:00:00+05:30',
  },
  {
    subject: 'Environmental Science',
    dateLabel: '23 Aug 2026',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-08-23T14:30:00+05:30',
    end: '2026-08-23T16:30:00+05:30',
  },
].map((exam) => ({
  ...exam,
  startTime: new Date(exam.start).getTime(),
  endTime: new Date(exam.end).getTime(),
}));

function getExamState(now) {
  if (!now) {
    return {
      phase: 'countdown',
      exam: EXAMS[0],
      remainingMs: 0,
    };
  }

  const currentTime = now.getTime();
  const liveExam = EXAMS.find(
    (exam) => currentTime >= exam.startTime && currentTime < exam.endTime
  );

  if (liveExam) {
    return {
      phase: 'live',
      exam: liveExam,
      remainingMs: liveExam.endTime - currentTime,
    };
  }

  const nextExam = EXAMS.find((exam) => currentTime < exam.startTime);

  if (nextExam) {
    return {
      phase: 'countdown',
      exam: nextExam,
      remainingMs: nextExam.startTime - currentTime,
    };
  }

  return {
    phase: 'done',
    exam: null,
    remainingMs: 0,
  };
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { value: days, unit: 'Days' },
    { value: hours, unit: 'Hours' },
    { value: minutes, unit: 'Minutes' },
    { value: seconds, unit: 'Seconds' },
  ];
}

function QuickDashboardLinks() {
  return (
    <>
      <div className={styles.examCountdownMeta}>
        <div className={styles.examCountdownText}>
          <span className={styles.examCountdownLabel}>Student Hub</span>
          <span className={styles.examCountdownName}>Quick Dashboard Links</span>
        </div>
        <span className={styles.examCountdownDate}>Portals Live</span>
      </div>

      <div className={styles.quickLinksGrid}>
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
    </>
  );
}

export default function ExamCountdown() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const examState = useMemo(() => getExamState(now), [now]);

  if (examState.phase === 'done') {
    return (
      <section className={styles.examCountdown} aria-live="polite">
        <QuickDashboardLinks />
      </section>
    );
  }

  const countdownParts = formatRemaining(examState.remainingMs);
  const isLive = examState.phase === 'live';

  return (
    <section
      className={`${styles.examCountdown} ${isLive ? styles.examCountdownLive : ''}`}
      aria-live="polite"
    >
      <div className={styles.examCountdownMeta}>
        <div className={styles.examCountdownText}>
          <span className={styles.examCountdownLabel}>
            {isLive ? 'Exam Live Now' : 'Exam Countdown'}
          </span>
          <span className={styles.examCountdownName}>{examState.exam.subject}</span>
        </div>
        <span className={styles.examCountdownDate}>
          {examState.exam.dateLabel} · {examState.exam.timeLabel}
        </span>
      </div>

      <div className={styles.examCountdownStatus}>
        {isLive ? 'Ends in' : 'Starts in'}
      </div>

      <div className={styles.examCountdownTimerGrid}>
        {countdownParts.map((part) => (
          <div className={styles.examCountdownTimerItem} key={part.unit}>
            <span className={styles.examCountdownTimerValue}>
              {String(part.value).padStart(2, '0')}
            </span>
            <span className={styles.examCountdownTimerUnit}>{part.unit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
