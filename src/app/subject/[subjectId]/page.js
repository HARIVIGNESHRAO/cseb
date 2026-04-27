import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allSubjects } from '@/data/subjects';
import styles from './subject.module.css';

export async function generateStaticParams() {
  return allSubjects.map((s) => ({ subjectId: s.id }));
}

export async function generateMetadata({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  if (!subject) return {};
  return { title: `${subject.name} — CSE-B Portal` };
}

export default function SubjectPage({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  if (!subject) notFound();
  const isLabSubject = subject.category === 'lab';

  return (
    <main className={styles.main}>
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>{subject.name}</span>
        </nav>

        {/* Subject Header */}
        <div
          className={styles.subjectHeader}
          style={{ '--color': subject.color, '--bg': subject.bg }}
        >
          <div className={styles.subjectLeft}>
            <span className={styles.subjectBadge}>{subject.code}</span>
            <h1 className={styles.subjectTitle}>{subject.name}</h1>
            <p className={styles.subjectDesc}>{subject.desc}</p>
          </div>
          <div className={styles.subjectIcon}>{subject.icon}</div>
        </div>

        {/* Units Label */}
        <div className={styles.unitsLabel}>
          <span className={styles.labelText}>
            {isLabSubject ? 'SELECT A PDF' : 'SELECT A UNIT'}
          </span>
          <span className={styles.labelCount}>
            {subject.units.length} {isLabSubject ? 'PDFs' : 'units'} available
          </span>
        </div>

        {/* Units List */}
        <div className={styles.unitsList}>
          {subject.units.map((unit, i) => (
            <Link
              key={unit.id}
              href={`/subject/${subject.id}/${unit.id}`}
              className={styles.unitCard}
              style={{
                '--color': subject.color,
                '--bg': subject.bg,
                animationDelay: `${i * 70}ms`,
              }}
            >
              <div className={styles.unitNumber}>
              </div>
              <div className={styles.unitInfo}>
                <h3 className={styles.unitName}>{unit.name}</h3>
                <p className={styles.unitTopic}>{unit.topic}</p>
                <p className={styles.unitTopics}>{unit.topics}</p>
              </div>
              <div className={styles.unitMeta}>
                <span className={styles.pdfTag}>PDF</span>
                <span className={styles.unitArrow}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Info box */}
      </div>
    </main>
  );
}
