'use client';

import { useEffect, useRef } from 'react';
import styles from './ScrollProgress.module.css';

export default function ScrollProgress() {
  const fillRef = useRef(null);

  useEffect(() => {
    let frame = null;

    const update = () => {
      frame = null;
      const root = document.documentElement;
      const scrollableHeight = root.scrollHeight - root.clientHeight;
      const progress = scrollableHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
        : 0;

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    // Semester changes and expanded sections can change the page height.
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}
