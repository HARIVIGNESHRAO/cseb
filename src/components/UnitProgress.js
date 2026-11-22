'use client';

import { useState, useSyncExternalStore } from 'react';
import styles from './UnitProgress.module.css';

const STORAGE_KEY = 'cseb-unit-progress-v1';
const CHANGE_EVENT = 'cseb-unit-progress-change';
const STATUSES = {
  todo: 'To study',
  studying: 'In progress',
  revised: 'Revised',
  completed: 'Completed',
};

function subscribe(update) {
  window.addEventListener(CHANGE_EVENT, update);
  window.addEventListener('storage', update);
  return () => {
    window.removeEventListener(CHANGE_EVENT, update);
    window.removeEventListener('storage', update);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '{}';
  } catch {
    return '{}';
  }
}

function getServerSnapshot() {
  return '{}';
}

function readProgress(snapshot) {
  try {
    const progress = JSON.parse(snapshot);
    return progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
  } catch {
    return {};
  }
}

function unitKey(subjectId, unitId) {
  return JSON.stringify([subjectId, unitId]);
}

function getUnitStatus(progress, subjectId, unitId) {
  const status = progress[unitKey(subjectId, unitId)];
  return typeof status === 'string' && Object.hasOwn(STATUSES, status) ? status : 'todo';
}

export function UnitStatus({ subjectId, unitId, unitName, className }) {
  const progress = readProgress(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
  const [error, setError] = useState(false);
  const key = unitKey(subjectId, unitId);
  const status = getUnitStatus(progress, subjectId, unitId);

  function changeStatus(event) {
    try {
      const updated = readProgress(localStorage.getItem(STORAGE_KEY));
      const value = event.target.value;
      if (value === 'todo') delete updated[key];
      else updated[key] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setError(false);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      setError(true);
    }
  }

  return <div className={className ? `${styles.control} ${className}` : styles.control}>
    <span className={styles.selectWrap}>
      <select aria-label={`Study status for ${unitName}`} value={status} onChange={changeStatus}>
        {Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <span className={styles.chevron} aria-hidden="true">⌄</span>
    </span>
    {error && <p role="status">Could not save study status on this device.</p>}
  </div>;
}

export function SubjectProgress({ subjectId, unitIds, color }) {
  const progress = readProgress(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
  if (!unitIds.length) return null;

  const counts = { todo: 0, studying: 0, revised: 0, completed: 0 };
  for (const unitId of unitIds) {
    counts[getUnitStatus(progress, subjectId, unitId)] += 1;
  }

  return <section className={styles.summary} style={{ '--subject-progress-color': color }} aria-label="Study progress">
    <div className={styles.summaryHeading}>
      <h2>Study progress</h2>
      <span>{unitIds.length} {unitIds.length === 1 ? 'unit' : 'units'}</span>
    </div>
    <div className={styles.progressGrid}>
      {Object.entries(STATUSES).map(([status, label]) => (
        <div key={status} className={styles.progressItem}>
          <div className={styles.progressHeader}>
            <span>{label}</span>
            <span>{counts[status]}</span>
          </div>
          <progress aria-label={label} value={counts[status]} max={unitIds.length} />
        </div>
      ))}
    </div>
  </section>;
}
