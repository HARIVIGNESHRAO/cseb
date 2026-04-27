import { notFound } from 'next/navigation';
import Link from 'next/link';
import { subjects } from '@/data/subjects';
import PdfViewer from '@/components/PdfViewer';
import styles from './unit.module.css';

export async function generateStaticParams() {
  return subjects.flatMap((s) =>
    s.units.map((u) => ({ subjectId: s.id, unitId: u.id }))
  );
}

export async function generateMetadata({ params }) {
  const subject = subjects.find((s) => s.id === params.subjectId);
  const unit = subject?.units.find((u) => u.id === params.unitId);
  if (!subject || !unit) return {};
  return { title: `${unit.name} — ${subject.name} — CSE-B` };
}

export default function UnitPage({ params }) {
  const subject = subjects.find((s) => s.id === params.subjectId);
  if (!subject) notFound();
  const unit = subject.units.find((u) => u.id === params.unitId);
  if (!unit) notFound();

  const pdfUrl = `/pdfs/${subject.id}/${unit.id}.pdf`;
  const unitIndex = subject.units.findIndex((u) => u.id === unit.id);
  const prevUnit = unitIndex > 0 ? subject.units[unitIndex - 1] : null;
  const nextUnit = unitIndex < subject.units.length - 1 ? subject.units[unitIndex + 1] : null;

  return (
    <main className={styles.main}>
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.bcLink}>Home</Link>
          <span className={styles.bcSep}>/</span>
          <Link href={`/subject/${subject.id}`} className={styles.bcLink}>{subject.name}</Link>
          <span className={styles.bcSep}>/</span>
          <span className={styles.bcActive}>{unit.name}</span>
        </nav>

        {/* Unit Header */}
        <div
          className={styles.unitHeader}
          style={{ '--color': subject.color, '--bg': subject.bg }}
        >
          <div className={styles.unitHeaderLeft}>
            <div className={styles.unitHeaderBadges}>
              <span className={styles.subjectBadge}>{subject.code}</span>
              <span className={styles.unitBadge}>{unit.name}</span>
            </div>
            <h1 className={styles.unitTitle}>{unit.topic}</h1>
            <p className={styles.unitTopics}>{unit.topics}</p>
          </div>
          <div className={styles.unitHeaderActions}>
            <a
              href={pdfUrl}
              download={`${subject.code}_${unit.id}.pdf`}
              className={styles.btnDownload}
              style={{ '--color': subject.color, '--bg': subject.bg }}
            >
              ⬇ Download PDF
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnOpen}
            >
              ↗ Open in Tab
            </a>
          </div>
        </div>

        {/* PDF Viewer (Client Component) */}
        <PdfViewer pdfUrl={pdfUrl} subject={subject} unit={unit} />

        {/* Unit Navigation */}
        <div className={styles.unitNav}>
          {prevUnit ? (
            <Link
              href={`/subject/${subject.id}/${prevUnit.id}`}
              className={styles.navBtn}
            >
              <span className={styles.navLabel}>← Previous</span>
              <span className={styles.navName}>{prevUnit.name}: {prevUnit.topic}</span>
            </Link>
          ) : <div />}

          {nextUnit ? (
            <Link
              href={`/subject/${subject.id}/${nextUnit.id}`}
              className={`${styles.navBtn} ${styles.navBtnRight}`}
              style={{ '--color': subject.color }}
            >
              <span className={styles.navLabel}>Next →</span>
              <span className={styles.navName}>{nextUnit.name}: {nextUnit.topic}</span>
            </Link>
          ) : <div />}
        </div>
      </div>
    </main>
  );
}
