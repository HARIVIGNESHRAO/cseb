import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { allSubjects, isStudyProgressUnit, isVideoUnit, supportsStudyProgress } from '@/data/subjects';
import { UnitStatus } from '@/components/UnitProgress';
import PdfViewer from '@/components/PdfViewer';
import SavePdfOffline from '@/components/SavePdfOffline';
import PdfConnectionHints from '@/components/PdfConnectionHints';
import { getAssetDownloadUrl, getUnitDownloadFileName, getUnitPdfUrl, withPdfAssetVersion } from '@/lib/pdfAssets';
import styles from './unit.module.css';
export async function generateStaticParams() {
  return allSubjects.flatMap((s) =>
    s.units.map((u) => ({ subjectId: s.id, unitId: u.id }))
  );
}

export async function generateMetadata({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  const unit = subject?.units.find((u) => u.id === params.unitId);
  if (!subject || !unit) return {};
  return { title: `${unit.name} — ${subject.name} — DHURANDHAR` };
}

export default function UnitPage({ params }) {
  const subject = allSubjects.find((s) => s.id === params.subjectId);
  if (!subject) notFound();
  const unit = subject.units.find((u) => u.id === params.unitId);
  if (!unit) notFound();
  const showStudyProgress = supportsStudyProgress(subject.category);
  const isVideo = isVideoUnit(unit);
  const hasResources = Array.isArray(unit.resources) && unit.resources.length > 0;
  const pdfUrl = getUnitPdfUrl(subject, unit);
  const openUrl = withPdfAssetVersion(unit.openUrl ?? pdfUrl);
  const downloadUrl = getAssetDownloadUrl(withPdfAssetVersion(unit.downloadUrl ?? openUrl));
  const unitIndex = subject.units.findIndex((u) => u.id === unit.id);
  const prevUnit =
    unit.id === 'codes'
      ? null
      : unitIndex > 0
        ? subject.units[unitIndex - 1]
        : null;
  const nextUnit = unitIndex < subject.units.length - 1 ? subject.units[unitIndex + 1] : null;

  return (
    <main className={styles.main}>
      {!isVideo && <PdfConnectionHints urls={[openUrl, downloadUrl, ...(unit.resources ?? []).map((resource) => resource.fileUrl)]} />}
      <div className={styles.bgGrid} />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/" className={styles.bcLink}>Home</Link>
          <span className={styles.bcSep} aria-hidden="true"><ChevronRight size={15} /></span>
          <Link href={`/subject/${subject.id}`} className={styles.bcLink}>{subject.name}</Link>
          <span className={styles.bcSep} aria-hidden="true"><ChevronRight size={15} /></span>
          <span className={styles.bcActive} aria-current="page">{unit.name}</span>
        </nav>

        {/* Selenium IDE Important Alert – only for STM Lab / STM Record, Experiment-1 */}
        {(subject.id === 'stm-lab' || subject.id === 'stm1') && unit.id === 'video1' && (
          <div className={styles.seleniumAlert} role="alert">
            <span className={styles.seleniumAlertIcon}>⚠️</span>
            <div className={styles.seleniumAlertBody}>
              <div className={styles.seleniumAlertTitle}>Important Alert – Selenium IDE</div>
              <p className={styles.seleniumAlertText}>
                Please read this carefully before running your tests.<br /><br />
                Selenium IDE works mainly on <strong>Microsoft Edge</strong> and <strong>Mozilla Firefox</strong>. Other browsers may support it, but <strong>Google Chrome no longer supports Selenium IDE properly</strong>.<br /><br />
                If your Selenium IDE test cases fail, there is <strong>no need to worry</strong> as long as you have followed the correct steps. Even if the test passes but it does not actually perform the steps you recorded, that is also not a problem for you.<br /><br />
                During the exam, if you face any such issues, <strong>do not panic</strong>. Inform sir/faculty immediately and they will help you. If the lab systems are not functioning properly, you will be allowed to use your own laptop to demonstrate the steps you performed.
              </p>
            </div>
          </div>
        )}

        {(subject.id === 'sdc' || subject.id === 'sdc1') && ['video', 'video21'].includes(unit.id) && (
          <div className={styles.seleniumAlert} role="alert">
            <span className={styles.seleniumAlertIcon} aria-hidden="true">⚠️</span>
            <div className={styles.seleniumAlertBody}>
              <div className={styles.seleniumAlertTitle}>IMPORTANT ALERT</div>
              <div className={styles.seleniumAlertText}>
                <p>Please read this carefully before proceeding with SDC.</p>
                <p>
                  Here, you can use the command <code>npm create vite@latest react-hero -- --template react</code> for practice purposes.
                </p>
                <p>
                  However, in the exam you will be provided with a ZIP folder that already
                  contains all the <code>node_modules</code>. <strong>Internet access will not be provided during the exam.</strong>
                </p>
                <p>You are supposed to:</p>
                <ol className={styles.labAlertSteps}>
                  <li>Unzip the folder.</li>
                  <li>Write your code in the appropriate files.</li>
                  <li>Create any additional necessary files.</li>
                  <li>Run the required commands by referring to the <code>package.json</code> file.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

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
            {showStudyProgress && isStudyProgressUnit(unit) && <UnitStatus subjectId={subject.id} unitId={unit.id} unitName={unit.name} />}
          </div>

          {!hasResources && !isVideo ? (
              <div className={styles.unitHeaderActions}>
                <a
                    href={downloadUrl}
                    download={downloadUrl?.startsWith('/') ? getUnitDownloadFileName(subject, unit) : undefined}
                    className={styles.btnDownload}
                    style={{ '--color': subject.color, '--bg': subject.bg }}
                >
                  ⬇ Download PDF
                </a>
              </div>
          ) : null}
        </div>

        {hasResources ? (
          <section className={styles.resourceSection}>
            <div className={styles.resourceHeader}>
              <span className={styles.resourceLabel}>CODES</span>
              <span className={styles.resourceCount}>
                {unit.resources.length} files
              </span>
            </div>

            <div className={styles.resourceList}>
              {unit.resources.map((resource) => {
                const resourceUrl = withPdfAssetVersion(resource.fileUrl);
                const resourceDownloadUrl = getAssetDownloadUrl(resourceUrl);

                return (
                  <div key={resource.id} className={styles.resourceCard}>
                    <div className={styles.resourceInfo}>
                      <h3 className={styles.resourceTitle}>{resource.name}</h3>
                      <p className={styles.resourceTopic}>{resource.topic}</p>
                      <p className={styles.resourceFile}>{resource.fileName}</p>
                    </div>

                    <div className={styles.resourceActions}>
                      <a
                        href={resourceDownloadUrl}
                        download={resource.fileName}
                        className={styles.btnDownload}
                        style={{ '--color': subject.color, '--bg': subject.bg }}
                      >
                        ⬇ Download
                      </a>
                      {resource.canPreview ? (
                        <a
                          href={resourceUrl}
                          data-recent-title={`${subject.code} · ${resource.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnOpen}
                        >
                          ↗ View PDF
                        </a>
                      ) : (
                        <span className={styles.resourceHint}>
                          ZIP file available for download only
                        </span>
                      )}
                    </div>
                    {resource.canPreview && <SavePdfOffline catalogId={`${subject.id}/${unit.id}/${resource.id}`} revision={String(resource.revision ?? resource.updatedAt ?? '')} url={resourceUrl} title={`${subject.code} · ${resource.name}`} />}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <PdfViewer pdfUrl={pdfUrl} downloadUrl={downloadUrl} downloadFileName={getUnitDownloadFileName(subject, unit)} subject={subject} unit={{ ...unit, openUrl }} />
        )}

        {/* Unit Navigation */}
        <div className={styles.unitNav}>
          {unit.id === 'codes' ? (
            <Link
              href={`/subject/${subject.id}`}
              className={styles.navBtn}
            >
              <span className={styles.navLabel}>← Previous</span>
              <span className={styles.navName}>{subject.name}</span>
            </Link>
          ) : prevUnit ? (
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
