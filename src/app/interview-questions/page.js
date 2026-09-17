import Link from 'next/link';
import { interviewResources } from '@/data/interviewResources';
import styles from '@/app/subject/[subjectId]/subject.module.css';

export const metadata = {
  title: 'Interview Questions & Answers — CSE Study Portal',
  description: 'Interview preparation resources for all semesters.',
};

const theme = { '--color': '#8B5CF6', '--bg': 'rgba(139,92,246,0.15)' };

export default function InterviewQuestionsPage() {
  return (
    <main className={styles.main}>
      <div className={styles.bgGrid} />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/#interview-questions" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive} aria-current="page">Interview Questions &amp; Answers</span>
        </nav>
        <header className={styles.subjectHeader} style={theme}>
          <div className={styles.subjectLeft}>
            <span className={styles.subjectBadge}>PLACEMENT PREPARATION · ALL SEMESTERS</span>
            <h1 className={styles.subjectTitle}>Interview Questions &amp; Answers</h1>
            <p className={styles.subjectDesc}>Choose a topic to start preparing.</p>
          </div>
          <div className={styles.subjectIcon} aria-hidden="true">💼</div>
        </header>
        <div className={styles.unitsLabel}>
          <div className={styles.unitsLabelText}>
            <span className={styles.labelText}>SELECT A TOPIC</span>
            <span className={styles.labelCount}>{interviewResources.length} resources available</span>
          </div>
        </div>
        <div className={styles.unitsList}>
          {interviewResources.map((resource, index) => (
            <div key={resource.href} className={styles.unitCard} style={theme}>
              <a href={resource.href} target="_blank" rel="noopener noreferrer" className={styles.unitMain}>
                <div className={styles.unitNumber}>
                  <span className={styles.unitNumberText}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className={styles.unitInfo}>
                  <h2 className={styles.unitName}>{resource.title}</h2>
                  <p className={styles.unitTopic}>{resource.source}</p>
                  {resource.note && <p className={styles.unitTopics}>{resource.note}</p>}
                </div>
              </a>
              <div className={styles.unitActions}>
                <a href={resource.href} target="_blank" rel="noopener noreferrer" className={styles.viewButton} aria-label={`Open ${resource.title} (new tab)`}>
                  Open Link ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
