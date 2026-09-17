import Link from 'next/link';
import { interviewResources } from '@/data/interviewResources';
import styles from '@/app/page.module.css';
import layout from './InterviewResources.module.css';

export default function InterviewResources() {
  return (
    <section id="interview-questions" className={`${styles.section} ${layout.section}`} aria-labelledby="placement-title">
      <div className={styles.sectionHeader}>
        <h2 id="placement-title" className={styles.sectionLabel}>PLACEMENT PREPARATION · ALL SEMESTERS</h2>
        <span className={styles.sectionCount}>1 collection</span>
      </div>
      <div className={styles.grid}>
        <Link href="/interview-questions" className={styles.card} style={{ '--card-color': '#8B5CF6', '--card-bg': 'rgba(139,92,246,0.15)' }}>
          <div className={styles.cardTop}>
            <span className={styles.cardBadge}>INTERVIEW Q&amp;A</span>
            <span className={styles.cardIcon} aria-hidden="true">💼</span>
          </div>
          <h2 className={styles.cardTitle}>Interview Questions &amp; Answers</h2>
          <div className={styles.cardFooter}>
            <span className={styles.cardUnits}>{interviewResources.length} resources</span>
            <span className={styles.cardArrow} aria-hidden="true">→</span>
          </div>
          <div className={styles.cardGlow} />
        </Link>
      </div>
    </section>
  );
}
