import Image from 'next/image';
import ReleasedHomepageVideo from '@/components/ReleasedHomepageVideo';
import heroPhoto from '../../public/image.png';
import revengePhoto from '../../public/image-1.jpg';
import lightPhoto from '../../public/image-3.png';
import rehmanPhoto from '../../public/akshay.webp';
import iqbalPhoto from '../../public/iqbal.png';
import aslamPhoto from '../../public/sanjay.png';
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

      <ReleasedHomepageVideo />

      {/* Header */}
      <header className={styles.header} style={{ paddingTop: '96px' }}>
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
              src={lightPhoto}
              alt="Ajay Sanyal portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoLight}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
            <Image
              src={revengePhoto}
              alt="Dhurandhar Revenge character portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoRevenge}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
            <Image
              src={rehmanPhoto}
              alt="Rehman Dakait cinematic portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoRehman}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
            <Image
              src={iqbalPhoto}
              alt="Major Iqbal portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoIqbal}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
            <Image
              src={aslamPhoto}
              alt="SP Chaudhary Aslam portrait"
              className={`${styles.heroPhoto} ${styles.heroPhotoAslam}`}
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 580px, 486px"
            />
          </div>
          <div className={titleStyles.panel}>
            <span className={titleStyles.rule} aria-hidden="true" />
            <h1 className={`${titleStyles.heading} ${titleStyles.defaultHeading}`} aria-label="DHURANDHAR">
              <span className={titleStyles.word} aria-hidden="true">
                {'DHURANDHAR'.split('').map((letter, index) => (
                  <span className={titleStyles.letter} style={{ '--letter-index': index }} key={index}>
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <h1 className={`${titleStyles.heading} ${titleStyles.blueHeading}`} aria-label="DHURANDHAR">
              <span className={titleStyles.word} aria-hidden="true">
                {'DHURANDHAR'.split('').map((letter, index) => (
                  <span className={titleStyles.letter} style={{ '--letter-index': index }} key={index}>
                    {letter === ' ' ? '\u00a0' : letter}
                  </span>
                ))}
              </span>
            </h1>
            <h1 className={`${titleStyles.heading} ${titleStyles.rehmanHeading}`}>REHMAN DAKAIT</h1>
            <h1 className={`${titleStyles.heading} ${titleStyles.sanyalHeading}`}>AJAY SANYAL</h1>
            <h1 className={`${titleStyles.heading} ${titleStyles.iqbalHeading}`}>MAJOR IQBAL</h1>
            <h1 className={`${titleStyles.heading} ${titleStyles.aslamHeading}`}>SP CHAUDHARY ASLAM</h1>
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
