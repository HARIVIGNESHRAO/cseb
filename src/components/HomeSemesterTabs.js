'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  academicCalendarSubjects,
  academicCalendarSubjects1,
  syllabusSubjects1,
  questionPaperSubjects,
  subjects,
  syllabusSubjects,
  subjects1,
    labSubjects
} from '@/data/subjects';
import styles from '@/app/page.module.css';

const semesterTabs = [
  { id: '3-2', label: '3-2' },
  { id: '4-1', label: '4-1' },
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
  // {
  //   id: 'timetable',
  //   label: 'TIMETABLE',
  //   count: '0 files',
  // },
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
  // {
  //   id: 'papers',
  //   label: 'QUESTION PAPERS',
  //   count: '0 files',
  // },
];

export default function HomeSemesterTabs() {
  const [activeSemester, setActiveSemester] = useState('4-1');

  useEffect(() => {
    const syncSemesterFromHash = () => {
      const hash = window.location.hash.replace('#semester-', '');

      if (hash === '3-2' || hash === '4-1') {
        setActiveSemester(hash);
      }
    };

    syncSemesterFromHash();
    window.addEventListener('hashchange', syncSemesterFromHash);

    return () => window.removeEventListener('hashchange', syncSemesterFromHash);
  }, []);

  const selectSemester = (semesterId) => {
    setActiveSemester(semesterId);
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
      <span id="semester-3-2" className={styles.semesterAnchor} />
      <span id="semester-4-1" className={styles.semesterAnchor} />
      <div className={styles.semesterTabs} aria-label="Semester options">
        {semesterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.semesterTab} ${
              activeSemester === tab.id ? styles.semesterTabActive : ''
            }`}
            onClick={() => selectSemester(tab.id)}
            aria-pressed={activeSemester === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.semesterResources}>
        {(activeSemester === '3-2' ? semesterThreeTwoSections : semesterFourOneSections).map(
          (section) => (
            <section className={styles.resourceGroup} id={section.id} key={section.id}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>{section.label}</span>
                <span className={styles.sectionCount}>{section.count}</span>
              </div>
              {section.items ? (
                renderSubjectGrid(section.items)
              ) : (
                <div className={styles.emptySemester} aria-label={`${section.label} empty`} />
              )}
            </section>
          )
        )}
      </div>
    </section>
  );
}
