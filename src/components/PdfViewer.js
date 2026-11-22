'use client';

import { useState } from 'react';
import styles from './PdfViewer.module.css';
import SavePdfOffline from './SavePdfOffline';

const AI_TOOLS = [
  {
    name: 'NotebookLM',
    href: 'https://notebooklm.google/',
    desc: 'Study guides, summaries, questions',
  },
  {
    name: 'ChatGPT',
    href: 'https://chatgpt.com/',
    promptParam: 'q',
    desc: 'Explain, quiz, simplify topics',
  },
  {
    name: 'Claude',
    href: 'https://claude.ai/new',
    promptParam: 'q',
    desc: 'Long PDF reading and notes',
  },
  {
    name: 'Gemini',
    href: 'https://gemini.google.com/app',
    desc: 'Paste the copied PDF message to ask questions',
  },
  {
    name: 'Grok',
    href: 'https://grok.com/',
    desc: 'Paste the copied PDF message to ask questions',
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

export default function PdfViewer({ pdfUrl, downloadUrl, downloadFileName, subject, unit }) {
  const [aiOpen, setAiOpen] = useState(false);
  const openUrl = unit.openUrl ?? pdfUrl;
  const [siteOrigin, setSiteOrigin] = useState('https://csesalaar.vercel.app');
  const [copyStatus, setCopyStatus] = useState('');
  const [linkStatus, setLinkStatus] = useState('');
  const absolutePdfUrl = new URL(pdfUrl, siteOrigin).href;
  const aiPrompt = `Help me study this PDF for ${subject.name}: ${unit.name}${unit.topic ? ` — ${unit.topic}` : ''}.
PDF: ${absolutePdfUrl}
Please read it so I can ask questions about it. If you cannot access the PDF link, ask me to upload the file instead of guessing its contents.`;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopyStatus('Copied! Paste this into your selected AI service.');
    } catch {
      setCopyStatus('Select and copy the message below, then paste it into your AI service.');
    }
  };

  const getAiHref = (tool) => {
    const url = new URL(tool.href);
    if (tool.promptParam) url.searchParams.set(tool.promptParam, aiPrompt);
    return url.href;
  };

  const isVideo = unit.type === 'video' || unit.type === 'youtube' || !!unit.videoUrl;
  const isYouTube = unit.type === 'youtube';

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
            {subject.code} · {unit.name}{unit.topic ? ` · ${unit.topic}` : ''}
          </span>

            <div style={{ width: 42 }} />
          </div>

          {/* Video or YouTube iframe */}
          <div
              style={{
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: isYouTube ? 'auto' : '70vh',
                padding: isYouTube ? '0' : '20px',
              }}
          >
            {isYouTube ? (
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 */ }}>
                <iframe
                  src={`${unit.videoUrl}?rel=0&modestbranding=1&autoplay=0`}
                  title={`${subject.code} · ${unit.topic}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </div>
            ) : (
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
            )}
          </div>
        </div>
    );
  }

  const aiMenu = (
            <div className={styles.aiMenuWrap}>
              <button
                  type="button"
                  className={styles.askAiButton}
                  onClick={() => {
                    if (!['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) {
                      setSiteOrigin(window.location.origin);
                    }
                    setAiOpen((value) => !value);
                  }}
                  aria-expanded={aiOpen}
                  aria-controls="pdf-ai-tools"
              >
                ✦ Ask AI
              </button>

              {aiOpen ? (
                  <div id="pdf-ai-tools" className={styles.aiPanel}>
                    <div className={styles.aiPanelHeader}>
                      <span className={styles.aiEyebrow}>YOUR STUDY COMPANION</span>
                      <span className={styles.aiPanelTitle}>A little help with this PDF.</span>
                      <span className={styles.aiPanelHint}>
                    ChatGPT and Claude links include your PDF message. For other tools, paste the copied message or add the PDF link as a source.
                  </span>
                    </div>

                    <details className={styles.aiMessageDetails}>
                      <summary>Preview PDF message</summary>
                    <textarea
                      className={styles.aiPrompt}
                      aria-label="PDF message to copy into your AI service"
                      value={aiPrompt}
                      readOnly
                      onFocus={(event) => event.target.select()}
                    />
                    </details>
                    <button type="button" className={styles.aiCopyButton} onClick={copyPrompt}>
                      Copy PDF message
                    </button>
                    <p className={styles.aiStatus} role="status">{copyStatus || 'If the AI cannot open the link, upload the PDF there.'}</p>
                    <div className={styles.aiToolList}>
                      {AI_TOOLS.map((tool) => (
                          <a
                              key={tool.href}
                              href={getAiHref(tool)}
                              onClick={() => { void copyPrompt(); }}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.aiTool}
                          >
                            <span className={styles.aiToolHeading}><span className={styles.aiToolName}>{tool.name}</span><span className={styles.aiToolArrow} aria-hidden="true">↗</span></span>
                            <span className={styles.aiToolDesc}>{tool.desc}</span>
                          </a>
                      ))}
                    </div>
                  </div>
              ) : null}
            </div>
  );

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
          <div className={styles.accessIntro}>
            <h2>Read your study material</h2>
            <p>Open the PDF directly, or download it once to read offline.</p>
          </div>
          <div className={`${styles.viewerActions} ${aiOpen ? styles.viewerActionsExpanded : ''}`}>
            <a
                href={openUrl}
                data-recent-title={`${subject.code} · ${unit.name}${unit.topic ? ` · ${unit.topic}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openPdfButton}
            >
              ↗ Open PDF in new tab
            </a>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={downloadUrl.startsWith('/') ? downloadFileName : undefined}
                className={styles.openPdfButton}
              >
                ↓ Download PDF
              </a>
            )}
            <button
              type="button"
              className={styles.askAiButton}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(new URL(openUrl, window.location.origin).href);
                  setLinkStatus('PDF link copied.');
                } catch {
                  setLinkStatus('Could not copy. Use Open PDF, then copy the address from your browser.');
                }
              }}
            >
              Copy PDF link
            </button>

            <SavePdfOffline catalogId={`${subject.id}/${unit.id}`} revision={String(unit.revision ?? unit.updatedAt ?? '')} key={openUrl} url={openUrl} title={`${subject.code} · ${unit.name}${unit.topic ? ` · ${unit.topic}` : ''}`} />
            {aiMenu}
          </div>
          <p className={styles.accessHint}>Loading slowly? Download the PDF and open it in your phone’s PDF reader. Large files may take longer on mobile data.</p>
          <p className={styles.accessStatus} role="status">{linkStatus}</p>
        </div>
      </div>
  );
}
