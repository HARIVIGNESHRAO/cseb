import { unstable_noStore as noStore } from 'next/cache';
import { isVideoReleased } from '@/lib/videoRelease';
import HomepageVideo from './HomepageVideo';
import styles from '@/app/page.module.css';

export default function ReleasedHomepageVideo() {
  noStore();
  if (!isVideoReleased()) return null;
  return <section className={styles.homepageVideoSection} aria-label="Dhurandhar video"><HomepageVideo /></section>;
}
