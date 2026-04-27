import Link from 'next/link';
import { subjects } from '@/data/subjects';
import styles from './page.module.css';

export default function Home() {
  const labSubjects = subjects.filter((subject) => subject.category === 'lab');
  const theorySubjects = subjects.filter(
    (subject) => subject.category !== 'lab'
  );

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
    <main className={styles.main}>
      {/* Background grid */}
      <div className={styles.bgGrid} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerBadge}>
          <span className={styles.dot} />
          B.Tech · Computer Science &amp; Engineering
        </div>
        <h1 className={styles.title}>
          CSE<span className={styles.titleAccent}>-B</span>
          <br />Study Portal
        </h1>
        <p className={styles.subtitle}>
          All subjects · All units · All PDFs — in one place
        </p>
      </header>

      {/* Subjects Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SUBJECTS</span>
          <span className={styles.sectionCount}>
            {theorySubjects.length} courses
          </span>
        </div>
        {renderSubjectGrid(theorySubjects)}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>LAB</span>
          <span className={styles.sectionCount}>{labSubjects.length} courses</span>
        </div>
        {renderSubjectGrid(labSubjects)}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerText}>CSE-B · Study Portal</span>
      </footer>
    </main>
  );
}
