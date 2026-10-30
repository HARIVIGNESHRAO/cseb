export const EXAMS = [
  {
    id: 'befa',
    subject: 'Business Economics and Financial Analysis',
    disabled: true,
    dateLabel: '30 Oct 2026 (Non-interns)',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-10-30T09:30:00+05:30',
    end: '2026-10-30T11:30:00+05:30',
  },
  {
    id: 'stm',
    subject: 'Software Testing Methodologies',
    disabled: true,
    dateLabel: '30 Oct 2026 (Non-interns)',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-10-30T12:00:00+05:30',
    end: '2026-10-30T14:00:00+05:30',
  },
  {
    id: 'dm',
    subject: 'Data Mining',
    disabled: true,
    dateLabel: '30 Oct 2026 (Non-interns)',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-10-30T14:30:00+05:30',
    end: '2026-10-30T16:30:00+05:30',
  },
  {
    id: 'irs',
    subject: 'Information Retrieval System',
    dateLabel: '31 Oct 2026',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-10-31T09:30:00+05:30',
    end: '2026-10-31T11:30:00+05:30',
  },
  {
    id: 'dvt',
    subject: 'Data Visualization Techniques',
    dateLabel: '31 Oct 2026',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-10-31T12:00:00+05:30',
    end: '2026-10-31T14:00:00+05:30',
  },
  {
    id: 'es',
    subject: 'Environmental Science',
    dateLabel: '31 Oct 2026',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-10-31T14:30:00+05:30',
    end: '2026-10-31T16:30:00+05:30',
  },
  {
    id: 'befa',
    subject: 'Business Economics and Financial Analysis',
    dateLabel: '1 Nov 2026 (Interns)',
    timeLabel: '9:30 AM - 11:30 AM',
    start: '2026-11-01T09:30:00+05:30',
    end: '2026-11-01T11:30:00+05:30',
  },
  {
    id: 'stm',
    subject: 'Software Testing Methodologies',
    dateLabel: '1 Nov 2026 (Interns)',
    timeLabel: '12:00 PM - 2:00 PM',
    start: '2026-11-01T12:00:00+05:30',
    end: '2026-11-01T14:00:00+05:30',
  },
  {
    id: 'dm',
    subject: 'Data Mining',
    dateLabel: '1 Nov 2026 (Interns)',
    timeLabel: '2:30 PM - 4:30 PM',
    start: '2026-11-01T14:30:00+05:30',
    end: '2026-11-01T16:30:00+05:30',
  },
  {
    id: 'befa',
    subject: 'Business Economics and Financial Analysis',
    dateLabel: '12 Nov 2026',
    timeLabel: '10:00 AM - 1:00 PM',
    start: '2026-11-12T10:00:00+05:30',
    end: '2026-11-12T13:00:00+05:30',
  },
  {
    id: 'stm',
    subject: 'Software Testing Methodologies',
    dateLabel: '14 Nov 2026',
    timeLabel: '10:00 AM - 1:00 PM',
    start: '2026-11-14T10:00:00+05:30',
    end: '2026-11-14T13:00:00+05:30',
  },
  {
    id: 'dm',
    subject: 'Data Mining',
    dateLabel: '16 Nov 2026',
    timeLabel: '10:00 AM - 1:00 PM',
    start: '2026-11-16T10:00:00+05:30',
    end: '2026-11-16T13:00:00+05:30',
  },
  {
    id: 'irs',
    subject: 'Information Retrieval System',
    dateLabel: '18 Nov 2026',
    timeLabel: '10:00 AM - 1:00 PM',
    start: '2026-11-18T10:00:00+05:30',
    end: '2026-11-18T13:00:00+05:30',
  },
  {
    id: 'dvt',
    subject: 'Data Visualization Techniques',
    dateLabel: '20 Nov 2026',
    timeLabel: '10:00 AM - 1:00 PM',
    start: '2026-11-20T10:00:00+05:30',
    end: '2026-11-20T13:00:00+05:30',
  },
  {
    id: 'holidays',
    kind: 'holiday',
    subject: 'Holidays · College Reopening',
    dateLabel: '1 Dec 2026',
    timeLabel: 'Reopens at 9:30 AM',
    start: '2026-11-20T13:00:00+05:30',
    end: '2026-12-01T09:30:00+05:30',
  },
].map((exam) => ({
  ...exam,
  startTime: new Date(exam.start).getTime(),
  endTime: new Date(exam.end).getTime(),
}));

export function getExamState(now) {
  if (!now) {
    return {
      phase: 'loading',
      exam: null,
      remainingMs: 0,
    };
  }

  const currentTime = now.getTime();
  const liveExam = EXAMS.find(
    (exam) => !exam.disabled && currentTime >= exam.startTime && currentTime < exam.endTime
  );

  if (liveExam) {
    return {
      phase: liveExam.kind === 'holiday' ? 'holiday' : 'live',
      exam: liveExam,
      remainingMs: liveExam.endTime - currentTime,
    };
  }

  const nextExam = EXAMS.find((exam) => !exam.disabled && currentTime < exam.startTime);

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

export function getSelectedExamState(exam, now) {
  if (!now) {
    return { phase: 'countdown', exam, remainingMs: 0 };
  }

  const currentTime = now.getTime();

  if (currentTime < exam.startTime) {
    return { phase: 'countdown', exam, remainingMs: exam.startTime - currentTime };
  }

  if (currentTime < exam.endTime) {
    return { phase: exam.kind === 'holiday' ? 'holiday' : 'live', exam, remainingMs: exam.endTime - currentTime };
  }

  return { phase: 'ended', exam, remainingMs: 0 };
}

export function getAvailableExamIndices(now) {
  if (!now) return [];
  const currentTime = now.getTime();
  return EXAMS.flatMap((exam, index) => (
    !exam.disabled && currentTime < exam.endTime &&
    (exam.kind !== 'holiday' || currentTime >= exam.startTime)
      ? [index] : []
  ));
}
