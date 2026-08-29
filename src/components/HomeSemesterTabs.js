'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  academicCalendarSubjects,
  academicCalendarSubjects1,
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
  labSubjects, timetableSubjects1, record, questionPaperSubjects1
} from '@/data/subjects';
import styles from '@/app/page.module.css';

const SEMESTER_STORAGE_KEY = 'cseb-selected-semester';

const semesterTabs = [
  { id: '2-1', label: '2-1' },
  { id: '2-2', label: '2-2' },
  { id: '3-1', label: '3-1' },
  { id: '3-2', label: '3-2' },
  { id: '4-1', label: '4-1' },
];

const semesterThreeOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',
    count: `${academicCalendarSubjects.length} files`,
    items: academicCalendarSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',
    count: `${subjectsThreeOne.length} courses`,
    items: subjectsThreeOne,
  },
];

const semesterThreeTwoSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',
    count: `${academicCalendarSubjects.length} files`,
    items: academicCalendarSubjects,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',
    count: `${syllabusSubjects.length} files`,
    items: syllabusSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',
    count: `${subjects.length} courses`,
    items: subjects,
  },

  {
    id: 'papers',
    label: 'QUESTION PAPERS',
    count: `${questionPaperSubjects.length} files`,
    items: questionPaperSubjects,
  },
];

const semesterFourOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',
    count: `${academicCalendarSubjects1.length} files`,
    items: academicCalendarSubjects1,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',
    count: `${syllabusSubjects1.length} files`,
    items: syllabusSubjects1,
  },
  {
    id: 'timetable',
    label: 'TIMETABLE',
    count: `${timetableSubjects1.length} files`,
    items: timetableSubjects1,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',
    count: `${subjects1.length} files`,
    items: subjects1,
  },
  {
    id: 'labs',
    label: 'LAB SUBJECTS',
    count: `${labSubjects.length} files`,
    items: labSubjects,
  },
  {
    id: 'lab-manuals',
    label: 'LAB RECORDS',
    count: `${record.length} files`,
    items: record,
  },
  {
    id: 'papers',
    label: 'QUESTION PAPERS',
    count: `${questionPaperSubjects1.length} files`,
    items: questionPaperSubjects1
  },
];

const semesterSections = {
  '2-1': [
    {
      id: 'syllabus',
      label: 'SYLLABUS',
      count: `${syllabusSubjectsTwoOne.length} file`,
      items: syllabusSubjectsTwoOne,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',
      count: `${subjectsTwoOne.length} courses`,
      items: subjectsTwoOne,
    },
  ],
  '2-2': [
    {
      id: 'syllabus',
      label: 'SYLLABUS',
      count: `${syllabusSubjectsTwoTwo.length} file`,
      items: syllabusSubjectsTwoTwo,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',
      count: `${subjectsTwoTwo.length} courses`,
      items: subjectsTwoTwo,
    },
  ],
  '3-1': semesterThreeOneSections,
  '3-2': semesterThreeTwoSections,
  '4-1': semesterFourOneSections,
};

export default function HomeSemesterTabs() {
  const [activeSemester, setActiveSemester] = useState('4-1');

  useEffect(() => {
    const syncSemesterFromHash = () => {
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

  const selectSemester = (semesterId) => {
    setActiveSemester(semesterId);
    localStorage.setItem(SEMESTER_STORAGE_KEY, semesterId);
    window.history.replaceState(null, '', `#semester-${semesterId}`);
  };

  const renderSubjectGrid = (items) => (
    <div className={styles.grid}>
      {items.map((subject, i) => (
        <Link
          key={subject.id}
          href={`/subject/${subject.id}`}
          className={styles.card}
          style={{
            '--card-color': subject.color,
            '--card-bg': subject.bg,
            animationDelay: `${i * 80}ms`,
          }}
        >
          <div className={styles.cardTop}>
            <span className={styles.cardBadge}>{subject.code}</span>
            <span className={styles.cardIcon}>{subject.icon}</span>
          </div>
          <h2 className={styles.cardTitle}>{subject.name}</h2>
          <p className={styles.cardDesc}>{subject.desc}</p>
          <div className={styles.cardFooter}>
            <span className={styles.cardUnits}>{subject.units.length} Units</span>
            <span className={styles.cardArrow}>→</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>
      ))}
    </div>
  );

  return (
    <section className={styles.section}>
      <span id="semester-2-1" className={styles.semesterAnchor} />
      <span id="semester-2-2" className={styles.semesterAnchor} />
      <span id="semester-3-1" className={styles.semesterAnchor} />
      <span id="semester-3-2" className={styles.semesterAnchor} />
      <span id="semester-4-1" className={styles.semesterAnchor} />
      <div className={styles.semesterPicker}>
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
                <span className={styles.sectionCount}>{section.count}</span>
              </div>
              {renderSubjectGrid(section.items)}
            </section>
          )
        )}
      </div>
    </section>
  );
}
