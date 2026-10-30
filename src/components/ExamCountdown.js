'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/app/page.module.css';
import { EXAMS, getExamState, getSelectedExamState, getAvailableExamIndices } from '@/lib/examSchedule';

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

  if (examState.phase === 'loading' || examState.phase === 'done') {
    return (
      <section className={styles.examCountdown} aria-live="polite">
        <QuickDashboardLinks />
      </section>
    );
  }

  const availableIndices = getAvailableExamIndices(now);
  const activeIndex = availableIndices.includes(selectedExamIndex) ? selectedExamIndex : EXAMS.indexOf(examState.exam);
  const selectedExam = EXAMS[activeIndex];
  const selectedPosition = availableIndices.indexOf(activeIndex);
  const displayedState = activeIndex === EXAMS.indexOf(examState.exam)
    ? examState
    : getSelectedExamState(selectedExam, now);
  const countdownParts = formatRemaining(displayedState.remainingMs);
  const isLive = displayedState.phase === 'live';
  const isEnded = displayedState.phase === 'ended';
  const isHoliday = selectedExam.kind === 'holiday';
  const onHoliday = displayedState.phase === 'holiday';
  const urgency = isEnded ? 'normal' : isLive || displayedState.remainingMs < 48 * 60 * 60 * 1000
    ? 'critical' : displayedState.remainingMs < 7 * 24 * 60 * 60 * 1000 ? 'soon' : 'normal';

  function selectPreviousExam(event) {
    event.stopPropagation();
    setSelectedExamIndex(availableIndices[Math.max(0, selectedPosition - 1)]);
  }

  function selectNextExam(event) {
    event.stopPropagation();
    setSelectedExamIndex(availableIndices[Math.min(availableIndices.length - 1, selectedPosition + 1)]);
  }

  function openSubject() {
    if (!isHoliday) router.push(`/subject/${selectedExam.id}`);
  }

  return (
    <section
      className={`${styles.examCountdown} ${isLive ? styles.examCountdownLive : ''} ${styles.examCountdownClickable}`}
      data-urgency={urgency}
      aria-label={`${selectedExam.subject}. ${onHoliday ? 'Holidays until college reopens on 1 December' : isLive ? 'Exam in progress' : isEnded ? 'Exam completed' : urgency === 'critical' ? 'Starts within 48 hours' : urgency === 'soon' ? 'Starts within 7 days' : 'Upcoming exam'}`}
      role={isHoliday ? undefined : 'link'}
      tabIndex={isHoliday ? undefined : 0}
      onClick={openSubject}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && !isHoliday && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openSubject();
        }
      }}
    >
      <div className={styles.examCountdownMeta}>
        <button
          type="button"
          className={styles.examCountdownArrow}
          onClick={selectPreviousExam}
          disabled={selectedPosition <= 0}
          aria-label="Show previous exam"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.examCountdownText}>
          <span className={styles.examCountdownLabel}>
            {onHoliday ? 'Holidays · 21–30 November' : isHoliday ? 'Upcoming Holidays' : isLive ? 'Exam Live Now' : isEnded ? 'Exam Completed' : 'Exam Countdown'}
          </span>
          <span className={`${styles.examCountdownName} ${styles.examCountdownFullName}`}>{isHoliday ? 'Holidays' : selectedExam.subject}</span>
        </div>
        <span className={styles.examCountdownDate}>
          {isHoliday
            ? 'College Reopening · 1st December · 9:30 AM'
            : `${selectedExam.dateLabel} · ${selectedExam.timeLabel}`}
        </span>
        <button
          type="button"
          className={styles.examCountdownArrow}
          onClick={selectNextExam}
          disabled={selectedPosition === availableIndices.length - 1}
          aria-label="Show next exam"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.examCountdownStatus}>
        {onHoliday ? 'College reopens in' : isHoliday ? 'Holidays start in' : isLive ? 'Ends in' : isEnded ? 'Ended' : 'Starts in'}
      </div>

      <div className={styles.examCountdownTimerGrid}>
        {countdownParts.map((part) => (
          <div className={styles.examCountdownTimerItem} key={part.unit} data-unit={part.unit}>
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
