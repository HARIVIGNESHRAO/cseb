import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { allSubjects, isStudyProgressUnit, isVideoUnit, supportsStudyProgress } from '@/data/subjects';
import PdfPrefetchLink from '@/components/PdfPrefetchLink';
import PdfConnectionHints from '@/components/PdfConnectionHints';
import DownloadAllButton from '@/components/DownloadAllButton';
import { SubjectProgress, UnitStatus } from '@/components/UnitProgress';
import SavePdfOffline from '@/components/SavePdfOffline';
import { getAssetDownloadUrl, getUnitDownloadFileName, getUnitPdfUrl, withPdfAssetVersion } from '@/lib/pdfAssets';
import styles from './subject.module.css';
import alertStyles from './[unitId]/unit.module.css';

export async function generateStaticParams() {
  return allSubjects.map((s) => ({ subjectId: s.id }));
}

export async function generateMetadata({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  if (!subject) return {};
  return { title: `${subject.name} — DHURANDHAR` };
}

export default function SubjectPage({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  if (!subject) notFound();
  const showStudyProgress = supportsStudyProgress(subject.category);
  const isPdfSubject = subject.category !== 'theory';
  return (
    <main id="sidebar-main-content" className={styles.main}>
      <PdfConnectionHints urls={subject.units.flatMap((unit) => (
        unit.videoUrl || ['video', 'youtube', 'external-links'].includes(unit.type)
          ? []
          : [unit.openUrl ?? getUnitPdfUrl(subject, unit), unit.downloadUrl,
            ...(unit.resources ?? []).map((resource) => resource.fileUrl)]
      ))} />
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true"><ChevronRight size={15} /></span>
          <span className={styles.breadcrumbActive} aria-current="page">{subject.name}</span>
        </nav>

        {subject.alert && (
          <div className={alertStyles.seleniumAlert} role="alert">
            <span className={alertStyles.seleniumAlertIcon} aria-hidden="true">⚠️</span>
            <div className={alertStyles.seleniumAlertBody}>
              <div className={alertStyles.seleniumAlertTitle}>{subject.alert.title}</div>
              <p className={alertStyles.seleniumAlertText}>{subject.alert.message}</p>
            </div>
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

        {showStudyProgress && <SubjectProgress subjectId={subject.id} color={subject.color} unitIds={subject.units.filter(isStudyProgressUnit).map((unit) => unit.id)} />}

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
          {subject.category === 'theory' && (
            <DownloadAllButton subject={{
              ...subject,
              units: subject.units.map((unit) => ({
                ...unit,
                pdfUrl: getUnitPdfUrl(subject, unit),
                openUrl: withPdfAssetVersion(unit.openUrl),
                downloadUrl: withPdfAssetVersion(unit.downloadUrl),
                resources: unit.resources?.map((resource) => ({
                  ...resource,
                  fileUrl: withPdfAssetVersion(resource.fileUrl),
                })),
              })),
            }} />
          )}
        </div>

        {/* Units List */}
        <div className={styles.unitsList}>
          {subject.units.map((unit, i) => {
            const isVideo = isVideoUnit(unit);
            const isExternalLinks = unit.type === 'external-links';
            const unitHref = isExternalLinks
              ? unit.openUrl
              : `/subject/${subject.id}/${unit.id}`;
            const pdfUrl = getUnitPdfUrl(subject, unit);
            const downloadUrl = getAssetDownloadUrl(withPdfAssetVersion(unit.downloadUrl ?? unit.openUrl ?? pdfUrl));
            const hasResources = Array.isArray(unit.resources) && unit.resources.length > 0;
            const hasStudyStatus = showStudyProgress && isStudyProgressUnit(unit);
            const hasPdfActions = !isVideo && !isExternalLinks && !hasResources;

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

                  <div className={hasStudyStatus && hasPdfActions ? `${styles.unitActions} ${styles.pairedActions}` : styles.unitActions}>
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
                            href={withPdfAssetVersion(unit.openUrl ?? pdfUrl)}
                            data-recent-title={`${subject.code} · ${unit.name}${unit.topic ? ` · ${unit.topic}` : ''}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.viewButton}
                        >
                          Open PDF ↗
                        </a>
                    )}

                    {/* Hide Download button for video */}
                    {hasPdfActions && (
                        <a
                            href={downloadUrl}
                            download={downloadUrl?.startsWith('/') ? getUnitDownloadFileName(subject, unit) : undefined}
                            className={styles.downloadButton}
                        >
                          Download
                        </a>
                    )}
                    {hasStudyStatus && <UnitStatus subjectId={subject.id} unitId={unit.id} unitName={unit.name} className={styles.studyStatus} />}
                    {hasPdfActions && (
                      <SavePdfOffline
                        url={withPdfAssetVersion(unit.openUrl ?? pdfUrl)}
                        title={`${subject.code} · ${unit.name}${unit.topic ? ` · ${unit.topic}` : ''}`}
                        catalogId={`${subject.id}/${unit.id}`}
                        revision={String(unit.revision ?? unit.updatedAt ?? '')}
                        compact
                        buttonClassName={styles.viewButton}
                      />
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
