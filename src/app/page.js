import Link from 'next/link';
import HomeFeedbackForm from '@/components/HomeFeedbackForm';
import {
  academicCalendarSubjects,
  labSubjects,
  questionPaperSubjects,
  recordSubjects,
  subjects,
  syllabusSubjects,
  timetableSubjects,
} from '@/data/subjects';
import styles from './page.module.css';

export default function Home() {
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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>ACADEMIC CALENDAR</span>
          <span className={styles.sectionCount}>
            {academicCalendarSubjects.length} files
          </span>
        </div>
        {renderSubjectGrid(academicCalendarSubjects)}
      </section>
      <br/>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SYLLABUS</span>
          <span className={styles.sectionCount}>
            {syllabusSubjects.length} files
          </span>
        </div>
        {renderSubjectGrid(syllabusSubjects)}
      </section>
      <br/>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>TIMETABLE</span>
          <span className={styles.sectionCount}>
            {timetableSubjects.length} files
          </span>
        </div>
        {renderSubjectGrid(timetableSubjects)}
      </section>
      <br/>
      {/* Subjects Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SUBJECTS</span>
          <span className={styles.sectionCount}>{subjects.length} courses</span>
        </div>
        {renderSubjectGrid(subjects)}
      </section>
      <br/>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>LAB</span>
          <span className={styles.sectionCount}>{labSubjects.length} courses</span>
        </div>
        {renderSubjectGrid(labSubjects)}
      </section>
      <br/>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>RECORD</span>
          <span className={styles.sectionCount}>
            {recordSubjects.length} courses
          </span>
        </div>
        {renderSubjectGrid(recordSubjects)}
      </section>
      <br/>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>QUESTION PAPERS</span>
          <span className={styles.sectionCount}>
            {questionPaperSubjects.length} files
          </span>
        </div>
        {renderSubjectGrid(questionPaperSubjects)}
      </section>

      <HomeFeedbackForm />

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerText}>CSE-B · Study Portal</span>
      </footer>
    </main>
  );
}
