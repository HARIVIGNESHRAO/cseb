'use client';

import styles from '@/app/page.module.css';

export default function SearchScope({ semester, scope, setScope }) {
  return (
    <div className={styles.searchScope} role="group" aria-label="Search scope">
      <button type="button" aria-pressed={scope === 'current'} onClick={() => setScope('current')}>
        Semester {semester}
      </button>
      <button type="button" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
        All semesters
      </button>
    </div>
  );
}
