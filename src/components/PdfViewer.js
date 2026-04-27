'use client';

import { useState } from 'react';
import styles from './PdfViewer.module.css';

export default function PdfViewer({ pdfUrl, subject, unit }) {
  const [pdfError, setPdfError] = useState(false);
  const [loading, setLoading] = useState(true);
  const pdfFile = unit.pdfFile ?? unit.id;
  const pdfDir = subject.pdfDir ?? subject.id;
  const openUrl = unit.openUrl ?? pdfUrl;
  const downloadUrl = unit.downloadUrl ?? openUrl;

  return (
    <div
      className={styles.wrapper}
      style={{ '--color': subject.color, '--bg': subject.bg }}
    >
      {/* Viewer Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarDot} style={{ background: '#EF4444' }} />
          <span className={styles.toolbarDot} style={{ background: '#F59E0B' }} />
          <span className={styles.toolbarDot} style={{ background: '#10B981' }} />
        </div>
        <span className={styles.toolbarTitle}>
          {subject.code} · {unit.name} · {unit.topic}
        </span>
        <div className={styles.toolbarRight}>
          <a
            href={downloadUrl}
            download={unit.downloadUrl ? undefined : `${subject.code}_${pdfFile}.pdf`}
            className={styles.toolbarBtn}
            title="Download"
          >
            ⬇
          </a>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.toolbarBtn}
            title="Open in new tab"
          >
            ↗
          </a>
        </div>
      </div>

      {/* PDF Area */}
      <div className={styles.viewerArea}>
        {loading && !pdfError && (
          <div className={styles.loading}>
            <div className={styles.spinner} style={{ borderTopColor: subject.color }} />
            <span>Loading PDF...</span>
          </div>
        )}

        {!pdfError ? (
          <iframe
            src={pdfUrl}
            className={styles.iframe}
            title={`${unit.name} PDF`}
            onLoad={() => setLoading(false)}
            onError={() => { setPdfError(true); setLoading(false); }}
            style={{ display: loading ? 'none' : 'block' }}
          />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>📂</div>
            <h3 className={styles.placeholderTitle}>PDF not uploaded yet</h3>
            <p className={styles.placeholderText}>
              {unit.pdfUrl
                ? 'Check the external link configured for this item.'
                : 'Add the PDF file at the path below:'}
            </p>
            <div className={styles.placeholderPath}>
              <code>
                {unit.pdfUrl
                  ? unit.pdfUrl
                  : `public/pdfs/${pdfDir}/${pdfFile}.pdf`}
              </code>
            </div>
            <p className={styles.placeholderHint}>
              Once added, refresh the page to view it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
