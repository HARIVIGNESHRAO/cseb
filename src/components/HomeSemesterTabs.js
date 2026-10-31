'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { semesterTabs, semesterSections } from '@/data/semesterSections';
import styles from '@/app/page.module.css';
import { getSemesterDefaults, SEMESTER_ROLLOVER } from '@/lib/semesterDefault';

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

export default function HomeSemesterTabs() {
  const [activeSemester, setActiveSemester] = useState('4-1');

  useEffect(() => {
    const syncSemesterFromHash = () => {
      const { semester: defaultSemester, storageKey } = getSemesterDefaults();
      const hash = window.location.hash.replace('#semester-', '');

      if (semesterTabs.some((tab) => tab.id === hash)) {
        setActiveSemester(hash);
        try { localStorage.setItem(storageKey, hash); } catch { /* Selection works without storage. */ }
        return;
      }

      let savedSemester;
      try { savedSemester = localStorage.getItem(storageKey); } catch { /* Use the scheduled default. */ }
      if (semesterTabs.some((tab) => tab.id === savedSemester)) {
        setActiveSemester(savedSemester);
      } else {
        setActiveSemester(defaultSemester);
      }
    };

    syncSemesterFromHash();
    window.addEventListener('hashchange', syncSemesterFromHash);

    // Long timeouts must be split to avoid the browser's 32-bit delay limit.
    let rolloverTimer;
    function scheduleRollover() {
      const remaining = SEMESTER_ROLLOVER - Date.now();
      if (remaining <= 0) {
        syncSemesterFromHash();
        return;
      }
      rolloverTimer = window.setTimeout(scheduleRollover, Math.min(remaining, 2147483647));
    }
    scheduleRollover();
    window.addEventListener('focus', syncSemesterFromHash);
    return () => {
      window.clearTimeout(rolloverTimer);
      window.removeEventListener('hashchange', syncSemesterFromHash);
      window.removeEventListener('focus', syncSemesterFromHash);
    };
  }, []);

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (['subjects', 'lab-manuals', 'papers'].includes(sectionId)) {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
    }
  }, [activeSemester]);

  const selectSemester = (semesterId) => {
    setActiveSemester(semesterId);
    try { localStorage.setItem(getSemesterDefaults().storageKey, semesterId); } catch { /* Selection works without storage. */ }
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
      <span id="semester-2-1" className={styles.semesterAnchor} />
      <span id="semester-2-2" className={styles.semesterAnchor} />
      <span id="semester-3-1" className={styles.semesterAnchor} />
      <span id="semester-3-2" className={styles.semesterAnchor} />
      <span id="semester-4-1" className={styles.semesterAnchor} />
      <span id="semester-4-2" className={styles.semesterAnchor} />
      <div id="semester-picker" data-active-semester={activeSemester} data-has-papers={semesterSections[activeSemester].some((section) => section.id === 'papers')} data-has-labs={semesterSections[activeSemester].some((section) => section.id === 'lab-manuals')} className={styles.semesterPicker}>
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
