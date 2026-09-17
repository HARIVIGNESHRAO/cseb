'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import {
  academicCalendarSubjects,
  academicCalendarSubjects1,
  academicCalendarSubjectsTwoOne,
  academicCalendarSubjectsTwoTwo,
  syllabusSubjects1,
  syllabusSubjectsTwoOne,
  syllabusSubjectsTwoTwo,
  questionPaperSubjects,
  subjects,
  subjectsTwoOne,
  subjectsTwoTwo,
  syllabusSubjects,
  subjectsThreeOne,
  subjects1,
  subjectsFourTwo,
  labSubjects, timetableSubjects1, record, questionPaperSubjects1
} from '@/data/subjects';
import styles from '@/app/page.module.css';

const formatCount = (count, label) => `${count} ${label}${count === 1 ? '' : 's'}`;

function getSectionCount(section) {
  if (section.id === 'subjects') return formatCount(section.items.length, 'course');
  if (section.id === 'lab-manuals' || section.id === 'labs') return formatCount(section.items.length, 'lab');
  if (section.id === 'papers') return formatCount(section.items.length, 'collection');
  return formatCount(section.items.reduce((total, item) => total + item.units.length, 0), 'file');
}

function getCardCount(subject) {
  const units = subject.units;
  if (subject.category === 'theory') {
    const courseUnits = units.filter((unit) => /^Unit\s+\d+/i.test(unit.name));
    const extraResources = units.length - courseUnits.length;
    return [
      courseUnits.length > 0 ? formatCount(courseUnits.length, 'unit') : null,
      extraResources > 0 ? formatCount(extraResources, 'resource') : null,
    ].filter(Boolean).join(' · ') || '0 units';
  }
  const mixedResources = units.some((unit) => unit.videoUrl || ['video', 'youtube', 'external-links'].includes(unit.type) || unit.resources?.length);
  return formatCount(units.length, mixedResources ? 'resource' : 'file');
}

const SEMESTER_STORAGE_KEY = 'cseb-selected-semester';
const LAB_REVISION_NOTICE_KEY = 'cseb-sdc-stm-videos-uploaded-v4';

const semesterTabs = [
  { id: '2-1', label: '2-1' },
  { id: '2-2', label: '2-2' },
  { id: '3-1', label: '3-1' },
  { id: '3-2', label: '3-2' },
  { id: '4-1', label: '4-1' },
  { id: '4-2', label: '4-2' },
];

const semesterThreeOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjectsThreeOne,
  },
];

const semesterThreeTwoSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: syllabusSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjects,
  },

  {
    id: 'papers',
    label: 'QUESTION PAPERS',

    items: questionPaperSubjects,
  },
];

const semesterFourOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects1,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: syllabusSubjects1,
  },
  // {
  //   id: 'timetable',
  //   label: 'TIMETABLE',
  //   count: `${timetableSubjects1.length} files`,
  //   items: timetableSubjects1,
  // },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjects1,
  },

  {
    id: 'lab-manuals',
    label: 'LAB SUBJECTS',

    items: record,
  },
  {
    id: 'papers',
    label: 'QUESTION PAPERS',

    items: questionPaperSubjects1
  },
];

const semesterFourTwoSyllabus = [syllabusSubjects1[0]];

const semesterFourTwoSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects1,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: semesterFourTwoSyllabus,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjectsFourTwo,
  },
];

const semesterSections = {
  '2-1': [
    {
      id: 'academic-calendar',
      label: 'ACADEMIC CALENDAR',

      items: academicCalendarSubjectsTwoOne,
    },
    {
      id: 'syllabus',
      label: 'SYLLABUS',

      items: syllabusSubjectsTwoOne,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',

      items: subjectsTwoOne,
    },
  ],
  '2-2': [
    {
      id: 'academic-calendar',
      label: 'ACADEMIC CALENDAR',

      items: academicCalendarSubjectsTwoTwo,
    },
    {
      id: 'syllabus',
      label: 'SYLLABUS',

      items: syllabusSubjectsTwoTwo,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',

      items: subjectsTwoTwo,
    },
  ],
  '3-1': semesterThreeOneSections,
  '3-2': semesterThreeTwoSections,
  '4-1': semesterFourOneSections,
  '4-2': semesterFourTwoSections,
};

export default function HomeSemesterTabs() {
  const [activeSemester, setActiveSemester] = useState('4-1');
  const [showLabNotice, setShowLabNotice] = useState(false);
  const labNoticeRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LAB_REVISION_NOTICE_KEY)) return;
      localStorage.setItem(LAB_REVISION_NOTICE_KEY, 'shown');
    } catch {
      // Skip the popup if its one-time status cannot be saved.
      return;
    }

    setShowLabNotice(true);
  }, []);

  useEffect(() => {
    if (!showLabNotice) return;
    const dialog = labNoticeRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [showLabNotice]);

  useEffect(() => {
    const syncSemesterFromHash = () => {
      if (window.location.hash === '#lab-manuals') {
        setActiveSemester('4-1');
        localStorage.setItem(SEMESTER_STORAGE_KEY, '4-1');
        return;
      }

      const hash = window.location.hash.replace('#semester-', '');

      if (semesterTabs.some((tab) => tab.id === hash)) {
        setActiveSemester(hash);
        localStorage.setItem(SEMESTER_STORAGE_KEY, hash);
        return;
      }

      const savedSemester = localStorage.getItem(SEMESTER_STORAGE_KEY);
      if (semesterTabs.some((tab) => tab.id === savedSemester)) {
        setActiveSemester(savedSemester);
      }
    };

    syncSemesterFromHash();
    window.addEventListener('hashchange', syncSemesterFromHash);

    return () => window.removeEventListener('hashchange', syncSemesterFromHash);
  }, []);

  useEffect(() => {
    if (activeSemester === '4-1' && window.location.hash === '#lab-manuals') {
      document.getElementById('lab-manuals')?.scrollIntoView({ block: 'start' });
    }
  }, [activeSemester]);

  const selectSemester = (semesterId) => {
    setActiveSemester(semesterId);
    localStorage.setItem(SEMESTER_STORAGE_KEY, semesterId);
    window.history.replaceState(null, '', `#semester-${semesterId}`);
  };

  const renderSubjectGrid = (items) => (
    <div className={styles.grid}>
      {items.map((subject, i) => {
        const CardComponent = subject.locked ? 'div' : Link;
        const navigationProps = subject.locked
          ? { 'aria-disabled': true, 'aria-label': `${subject.name} is locked` }
          : { href: `/subject/${subject.id}` };

        return (
          <CardComponent
            key={subject.id}
            {...navigationProps}
            className={`${styles.card} ${subject.locked ? styles.cardLocked : ''}`}
            style={{
              '--card-color': subject.color,
              '--card-bg': subject.bg,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className={styles.cardTop}>
              <span className={styles.cardBadge}>{subject.code}</span>
              <span className={styles.cardIcon}>{subject.locked ? '🔒' : subject.icon}</span>
            </div>
            <h2 className={styles.cardTitle}>{subject.name}</h2>
            <p className={styles.cardDesc}>{subject.desc}</p>
            <div className={styles.cardFooter}>
              {subject.locked ? (
                <span className={styles.cardLockStatus}>Locked</span>
              ) : (
                <span className={styles.cardUnits}>
                  {getCardCount(subject)}
                </span>
              )}
              <span className={styles.cardArrow}>{subject.locked ? '•••' : '→'}</span>
            </div>
            <div className={styles.cardGlow} />
          </CardComponent>
        );
      })}
    </div>
  );

  return (
    <section className={styles.section}>
      <dialog
        ref={labNoticeRef}
        className={styles.labNotice}
        aria-labelledby="lab-notice-title"
        aria-describedby="lab-notice-description"
        onCancel={() => setShowLabNotice(false)}
      >
        <button
          type="button"
          className={styles.labNoticeClose}
          aria-label="Close lab update"
          onClick={() => setShowLabNotice(false)}
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className={styles.labNoticeIcon}>
          <FlaskConical size={28} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <p className={styles.labNoticeEyebrow}>LAB RESOURCE UPDATE</p>
        <h2 id="lab-notice-title" className={styles.labNoticeTitle}>SDC &amp; STM videos are now available!</h2>
        <div className={styles.labNoticeTags} aria-label="Affected labs">
          <span>SDC LAB</span>
          <span>STM LAB</span>
        </div>
        <p id="lab-notice-description" className={styles.labNoticeDescription}>
          SDC and STM lab videos have been added. Open your lab below to watch the videos.
        </p>
        <div className={styles.labNoticeLinks}>
          <Link href="/subject/sdc1" onClick={() => setShowLabNotice(false)}>View SDC lab →</Link>
          <Link href="/subject/stm1" onClick={() => setShowLabNotice(false)}>View STM lab →</Link>
        </div>
        <button
          type="button"
          className={styles.labNoticeButton}
          onClick={() => setShowLabNotice(false)}
          autoFocus
        >
          Got it
        </button>
      </dialog>
      <span id="semester-2-1" className={styles.semesterAnchor} />
      <span id="semester-2-2" className={styles.semesterAnchor} />
      <span id="semester-3-1" className={styles.semesterAnchor} />
      <span id="semester-3-2" className={styles.semesterAnchor} />
      <span id="semester-4-1" className={styles.semesterAnchor} />
      <span id="semester-4-2" className={styles.semesterAnchor} />
      <div id="semester-picker" data-active-semester={activeSemester} className={styles.semesterPicker}>
        <div className={styles.semesterPickerIdentity}>
          <span className={styles.semesterPickerIcon} aria-hidden="true">⌘</span>
          <span className={styles.semesterPickerCopy}>
            <span className={styles.semesterPickerEyebrow}>Explore resources</span>
            <label className={styles.semesterSelectLabel} htmlFor="semester-select">
              Choose semester
            </label>
          </span>
        </div>
        <div className={styles.semesterSelectWrap}>
          <select
            id="semester-select"
            className={styles.semesterSelect}
            value={activeSemester}
            onChange={(event) => selectSemester(event.target.value)}
          >
            {semesterTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                Semester {tab.label}
              </option>
            ))}
          </select>
          <span className={styles.semesterSelectChevron} aria-hidden="true">⌄</span>
        </div>
      </div>

      <div className={styles.semesterResources}>
        {semesterSections[activeSemester].length === 0 ? (
          <div className={styles.emptySemester} role="status">
            Resources for semester {activeSemester} will be added soon.
          </div>
        ) : semesterSections[activeSemester].map(
          (section) => (
            <section className={styles.resourceGroup} id={section.id} key={section.id}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>{section.label}</span>
                <span className={styles.sectionCount}>{getSectionCount(section)}</span>
              </div>
              {renderSubjectGrid(section.items)}
            </section>
          )
        )}
      </div>
    </section>
  );
}
