'use client';

import { useState } from 'react';
import styles from './PdfViewer.module.css';

const AI_TOOLS = [
  {
    name: 'NotebookLM',
    href: 'https://notebooklm.google/',
    desc: 'Study guides, summaries, questions',
  },
  {
    name: 'ChatGPT',
    href: 'https://chatgpt.com/',
    desc: 'Explain, quiz, simplify topics',
  },
  {
    name: 'Claude',
    href: 'https://claude.ai/',
    desc: 'Long PDF reading and notes',
  },
  {
    name: 'Adobe Acrobat AI',
    href: 'https://www.adobe.com/acrobat/generative-ai-pdf.html',
    desc: 'PDF summaries and answers',
  },
  {
    name: 'ChatPDF',
    href: 'https://www.chatpdf.com/',
    desc: 'Fast chat with uploaded PDFs',
  },
];

export default function PdfViewer({ pdfUrl, subject, unit }) {
  const [aiOpen, setAiOpen] = useState(false);
  const openUrl = unit.openUrl ?? pdfUrl;

  const isVideo = unit.type === 'video' || !!unit.videoUrl;

  // ===================== FULL SCREEN VIDEO =====================
  if (isVideo) {
    return (
        <div
            style={{
              background: '#0a0a0a',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #222',
              marginBottom: '16px',
            }}
        >
          {/* Toolbar */}
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#111',
                borderBottom: '1px solid #222',
              }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
            </div>

            <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#888',
                  fontFamily: 'monospace',
                }}
            >
            {subject.code} · {unit.name}
          </span>

            <div style={{ width: 42 }} />
          </div>

          {/* Video */}
          <div
              style={{
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                padding: '20px',
              }}
          >
            <video
                src={unit.videoUrl}
                controls
                controlsList="nodownload"
                style={{
                  width: '100%',
                  maxHeight: '75vh',
                  borderRadius: '8px',
                  outline: 'none',
                }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
    );
  }

  // ===================== NORMAL PDF =====================
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
          <div className={styles.toolbarRight} />
        </div>

        <div className={styles.viewerArea}>
          <div className={styles.viewerActions}>
            <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openPdfButton}
            >
              ↗ Open PDF in new tab
            </a>

            <div className={styles.aiMenuWrap}>
              <button
                  type="button"
                  className={styles.askAiButton}
                  onClick={() => setAiOpen((value) => !value)}
                  aria-expanded={aiOpen}
                  aria-controls="pdf-ai-tools"
              >
                ✦ Ask AI
              </button>

              {aiOpen ? (
                  <div id="pdf-ai-tools" className={styles.aiPanel}>
                    <div className={styles.aiPanelHeader}>
                      <span className={styles.aiPanelTitle}>Ask AI about this PDF</span>
                      <span className={styles.aiPanelHint}>
                    Open the PDF, then upload it here.
                  </span>
                    </div>

                    <div className={styles.aiToolList}>
                      {AI_TOOLS.map((tool) => (
                          <a
                              key={tool.href}
                              href={tool.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.aiTool}
                          >
                            <span className={styles.aiToolName}>{tool.name}</span>
                            <span className={styles.aiToolDesc}>{tool.desc}</span>
                          </a>
                      ))}
                    </div>
                  </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
  );
}