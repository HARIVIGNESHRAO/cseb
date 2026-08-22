'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/app/page.module.css';

const EXAMS = [
  {
    id: 'befa',
    subject: 'Business Economics and Financial Analysis',
    dateLabel: '22 Aug 2026',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-08-22T09:30:00+05:30',
    end: '2026-08-22T11:30:00+05:30',
  },
  {
    id: 'stm',
    subject: 'Software Testing Methodologies',
    dateLabel: '22 Aug 2026',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-08-22T12:00:00+05:30',
    end: '2026-08-22T14:00:00+05:30',
  },
  {
    id: 'dm',
    subject: 'Data Mining',
    dateLabel: '22 Aug 2026',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-08-22T14:30:00+05:30',
    end: '2026-08-22T16:30:00+05:30',
  },
  {
    id: 'irs',
    subject: 'Information Retrieval System',
    dateLabel: '23 Aug 2026',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-08-23T09:30:00+05:30',
    end: '2026-08-23T11:30:00+05:30',
  },
  {
    id: 'dvt',
    subject: 'Data Visualization Techniques',
    dateLabel: '23 Aug 2026',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-08-23T12:00:00+05:30',
    end: '2026-08-23T14:00:00+05:30',
  },
  {
    id: 'es',
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

function getSelectedExamState(exam, now) {
  if (!now) {
    return { phase: 'countdown', exam, remainingMs: 0 };
  }

  const currentTime = now.getTime();

  if (currentTime < exam.startTime) {
    return { phase: 'countdown', exam, remainingMs: exam.startTime - currentTime };
  }

  if (currentTime < exam.endTime) {
    return { phase: 'live', exam, remainingMs: exam.endTime - currentTime };
  }

  return { phase: 'ended', exam, remainingMs: 0 };
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
  const [selectedExamIndex, setSelectedExamIndex] = useState(null);
  const router = useRouter();

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

  const selectedExam = selectedExamIndex === null ? examState.exam : EXAMS[selectedExamIndex];
  const displayedState = selectedExamIndex === null
    ? examState
    : getSelectedExamState(selectedExam, now);
  const countdownParts = formatRemaining(displayedState.remainingMs);
  const isLive = displayedState.phase === 'live';
  const isEnded = displayedState.phase === 'ended';

  function selectPreviousExam(event) {
    event.stopPropagation();
    setSelectedExamIndex((currentIndex) => {
      const index = currentIndex === null ? EXAMS.findIndex((exam) => exam.id === selectedExam.id) : currentIndex;
      return Math.max(0, index - 1);
    });
  }

  function selectNextExam(event) {
    event.stopPropagation();
    setSelectedExamIndex((currentIndex) => {
      const index = currentIndex === null ? EXAMS.findIndex((exam) => exam.id === selectedExam.id) : currentIndex;
      return Math.min(EXAMS.length - 1, index + 1);
    });
  }

  return (
    <section
      className={`${styles.examCountdown} ${isLive ? styles.examCountdownLive : ''} ${styles.examCountdownClickable}`}
      aria-live="polite"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/subject/${selectedExam.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          router.push(`/subject/${selectedExam.id}`);
        }
      }}
    >
      <div className={styles.examCountdownMeta}>
        <button
          type="button"
          className={styles.examCountdownArrow}
          onClick={selectPreviousExam}
          disabled={selectedExamIndex === 0}
          aria-label="Show previous exam"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.examCountdownText}>
          <span className={styles.examCountdownLabel}>
            {isLive ? 'Exam Live Now' : isEnded ? 'Exam Completed' : 'Exam Countdown'}
          </span>
          <span className={styles.examCountdownName}>{selectedExam.subject}</span>
        </div>
        <span className={styles.examCountdownDate}>
          {selectedExam.dateLabel} · {selectedExam.timeLabel}
        </span>
        <button
          type="button"
          className={styles.examCountdownArrow}
          onClick={selectNextExam}
          disabled={selectedExamIndex === EXAMS.length - 1}
          aria-label="Show next exam"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.examCountdownStatus}>
        {isLive ? 'Ends in' : isEnded ? 'Ended' : 'Starts in'}
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
