import Image from 'next/image';
import heroPhoto from '../../public/image.png';
import revengePhoto from '../../public/image-1.jpg';
import ExamCountdown from '@/components/ExamCountdown';
import InterviewResources from '@/components/InterviewResources';
import HomeFeedbackForm from '@/components/HomeFeedbackForm';
import HomeSearch from '@/components/HomeSearch';
import HomeSemesterTabs from '@/components/HomeSemesterTabs';
import HomeStickyNav from '@/components/HomeStickyNav';
import Navbar from '@/components/Navbar';
import VisitCounter from '@/components/VisitCounter';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import styles from './page.module.css';
import titleStyles from './heroTitle.module.css';

export default function Home() {
  return (
    <>
    <ScrollProgress />
    <BackToTop />
    <main id="sidebar-main-content" className={styles.main}>
      {/* Background grid */}
      <div className={styles.bgGrid} />

      {/* Primary responsive navbar */}
      <Navbar />

      {/* Legacy sticky nav */}
      <HomeStickyNav />

      {/* Header */}
      <header className={styles.header} style={{ paddingTop: 'calc(64px + 32px)' }}>
        <div className={`${styles.heroIdentity} ${titleStyles.card}`}>
          <div className={styles.heroMedia}>
            <Image
              src={heroPhoto}
              alt="Dhurandhar character portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoClassic}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
              priority
            />
            <Image
              src={revengePhoto}
              alt="Dhurandhar Revenge character portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoRevenge}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
          </div>
          <div className={titleStyles.panel}>
            <span className={titleStyles.rule} aria-hidden="true" />
            <h1 className={titleStyles.heading} aria-label="DHURANDHAR">
              <span className={titleStyles.word} aria-hidden="true">
                {'DHURANDHAR'.split('').map((letter, index) => (
                  <span className={titleStyles.letter} style={{ '--letter-index': index }} key={index}>
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <span className={titleStyles.rule} aria-hidden="true" />
          </div>
        </div>
        <ExamCountdown />
        <VisitCounter />
      </header>

      <div id="search">
        <HomeSearch />
      </div>

      <HomeSemesterTabs />

      <InterviewResources />

      <HomeFeedbackForm />

      {/* Footer */}
    <footer className={styles.footer}>
      <span className={styles.footerText}>© {new Date().getFullYear()} DHURANDHAR. All Rights Reserved.</span>
    </footer>
    </main>
    </>
  );
}
