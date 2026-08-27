import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allSubjects } from '@/data/subjects';
import PdfPrefetchLink from '@/components/PdfPrefetchLink';
import DownloadAllButton from '@/components/DownloadAllButton';
import { getAssetDownloadUrl, getUnitDownloadFileName, getUnitPdfUrl } from '@/lib/pdfAssets';
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
  const isPdfSubject = subject.category !== 'theory';
  return (
    <main id="sidebar-main-content" className={styles.main}>
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>{subject.name}</span>
        </nav>

        {subject.alert && (
          <div className={styles.alertBox}>
            <div className={styles.alertTitle}>{subject.alert.title}</div>
            <p className={styles.alertText}>{subject.alert.message}</p>
          </div>
        )}

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
          <div className={styles.unitsLabelText}>
            <span className={styles.labelText}>
              {isPdfSubject ? 'SELECT A PDF' : 'SELECT A UNIT'}
            </span>
            <span className={styles.labelCount}>
              {subject.units.length} {isPdfSubject ? 'PDFs' : 'units'} available
            </span>
          </div>
          <DownloadAllButton subject={subject} />
        </div>

        {/* Units List */}
        <div className={styles.unitsList}>
          {subject.units.map((unit, i) => {
            const isVideo = unit.type === 'video' || unit.type === 'youtube' || !!unit.videoUrl;
            const isExternalLinks = unit.type === 'external-links';
            const unitHref = isExternalLinks
              ? unit.openUrl
              : `/subject/${subject.id}/${unit.id}`;
            const pdfUrl = getUnitPdfUrl(subject, unit);
            const downloadUrl = getAssetDownloadUrl(unit.downloadUrl ?? unit.openUrl ?? pdfUrl);
            const hasResources = Array.isArray(unit.resources) && unit.resources.length > 0;

            return (
                <div
                    key={unit.id}
                    className={styles.unitCard}
                    style={{
                      '--color': subject.color,
                      '--bg': subject.bg,
                      animationDelay: `${i * 70}ms`,
                    }}
                >
                  <PdfPrefetchLink href={unitHref} className={styles.unitMain}>
                    <div className={styles.unitNumber}>
                      <span className={styles.unitNumberText}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className={styles.unitInfo}>
                      <h3 className={styles.unitName}>{unit.name}</h3>
                      <p className={styles.unitTopic}>{unit.topic}</p>
                      <p className={styles.unitTopics}>{unit.topics}</p>
                    </div>
                  </PdfPrefetchLink>

                  <div className={styles.unitActions}>
                    {isVideo ? (
                        // ===== VIDEO BUTTON =====
                        <PdfPrefetchLink href={unitHref} className={styles.viewButton}>
                          Watch Video ▶
                        </PdfPrefetchLink>
                    ) : isExternalLinks ? (
                        <a
                          href={unit.openUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewButton}
                        >
                          Open Links ↗
                        </a>
                    ) : hasResources ? (
                        <PdfPrefetchLink href={unitHref} className={styles.viewButton}>
                          View Files
                        </PdfPrefetchLink>
                    ) : (
                        <a
                            href={unit.openUrl ?? pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.viewButton}
                        >
                          Open PDF ↗
                        </a>
                    )}

                    {/* Hide Download button for video */}
                    {!isVideo && !isExternalLinks && !hasResources && (
                        <a
                            href={downloadUrl}
                            download={downloadUrl?.startsWith('/') ? getUnitDownloadFileName(subject, unit) : undefined}
                            className={styles.downloadButton}
                        >
                          Download
                        </a>
                    )}
                  </div>
                </div>
            );
          })}
        </div>

        {/* Info box */}
      </div>
    </main>
  );
}
