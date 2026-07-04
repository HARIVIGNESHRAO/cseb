'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

const START_AT = new Date(2026, 5, 5, 12, 35, 0).getTime();
const HIDE_AFTER = new Date(2026, 5, 6, 21, 0, 0).getTime();

const SHAKE_WINDOWS = [
  [7, 8],        // Reduced to 1 second (better UX)
  [20, 20.6],
];

function buildParticles(seed) {
  return Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2 + seed;
    const distance = 42 + (index % 5) * 14;

    return {
      id: `${seed}-${index}`,
      left: `${50 + Math.cos(angle) * 44}%`,
      top: `${50 + Math.sin(angle) * 28}%`,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 24,
      shape: index % 3 === 0 ? 'spark' : index % 3 === 1 ? 'flash' : 'sword',
    };
  });
}

export default function CelebrationVideo({ className, src, ...props }) {
  const videoRef = useRef(null);
  const previousTimeRef = useRef(0);
  const burstFlagsRef = useRef({ seven: false, twenty: false });
  const burstIdRef = useRef(0);

  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [explosions, setExplosions] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const now = Date.now();
      setIsVisible(now >= START_AT && now < HIDE_AFTER);
    };

    updateVisibility();
    const interval = window.setInterval(updateVisibility, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  const removeBurst = (burstId) => {
    setExplosions((currentBursts) => currentBursts.filter((burst) => burst.id !== burstId));
  };

  const handleTimeUpdate = (event) => {
    const currentTime = event.currentTarget.currentTime;
    const shouldShake = SHAKE_WINDOWS.some(([start, end]) => currentTime >= start && currentTime <= end);

    // Simplified (cleaner)
    setIsShaking(shouldShake);

    if (currentTime < previousTimeRef.current) {
      burstFlagsRef.current = { seven: false, twenty: false };
    }

    previousTimeRef.current = currentTime;

    const triggerBurst = (key, burstTime, particles) => {
      if (burstFlagsRef.current[key]) return;
      if (currentTime < burstTime || currentTime > burstTime + 0.35) return;

      burstFlagsRef.current[key] = true;

      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          if (key === 'seven') {
            navigator.vibrate(500);        // Strong at first burst
          } else {
            navigator.vibrate(200);        // Light at second burst
          }
        }
      } catch (e) {}

      const burstId = `${key}-${++burstIdRef.current}`;

      setExplosions((currentBursts) => [
        ...currentBursts,
        { id: burstId, particles },
      ]);

      window.setTimeout(() => removeBurst(burstId), 700);
    };

    triggerBurst('seven', 7, buildParticles(0.5));
    triggerBurst('twenty', 20, buildParticles(1.4));
  };

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;
    video.play();
    setHasStarted(true);
    setShowControls(true);
  };

  return (
    <div className={isShaking ? `${styles.celebrateFrame} ${styles.celebrateFrameShake}` : styles.celebrateFrame}>
      <div className={styles.celebrateFrameInner}>
        <span className={styles.celebrateOrbOne} aria-hidden="true" />
        <span className={styles.celebrateOrbTwo} aria-hidden="true" />

        <div className={styles.celebrateInnerStage}>
          <div className={styles.celebrateExplosionLayer} aria-hidden="true">
            {explosions.map((burst) => (
              <span key={burst.id} className={styles.celebrateExplosionBurst}>
                {burst.particles.map((particle) => (
                  <span
                    key={particle.id}
                    className={`${styles.celebrateParticle} ${styles[`celebrateParticle--${particle.shape}`]}`}
                    style={{
                      left: particle.left,
                      top: particle.top,
                      '--dx': `${particle.dx}px`,
                      '--dy': `${particle.dy}px`,
                    }}
                  />
                ))}
              </span>
            ))}
          </div>

          {!hasStarted ? (
            <button type="button" className={styles.celebratePlayButton} onClick={startPlayback}>
              <span className={styles.celebratePlayIcon}>▶</span>
              <span className={styles.celebratePlayText}>Play</span>
            </button>
          ) : null}

          <video
            ref={videoRef}
            className={className ? `${className} ${styles.celebrateVideo}` : styles.celebrateVideo}
            src={src}
            controls={showControls}
            loop
            playsInline
            preload="metadata"
            onPlay={() => setHasStarted(true)}
            onTimeUpdate={handleTimeUpdate}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}