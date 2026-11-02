'use client';

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import styles from './HomepageVideo.module.css';
import VideoReactions from './VideoReactions';

export default function HomepageVideo() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  async function play() {
    setError('');
    try {
      await videoRef.current?.play();
    } catch {
      setError('Unable to play the video. Please try again.');
    }
  }

  return (
    <div className={styles.frame}>
      <div className={styles.stage}>
        <video
          ref={videoRef}
          className={styles.video}
          src="/api/cinematic-video"
          poster="/image.png"
          controls={started}
          playsInline
          preload="metadata"
          aria-label="Dhurandhar video"
          onPlay={() => { setStarted(true); setPlaying(true); setError(''); }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setError('Unable to load the video. Please try again later.')}
        />
        {!started && <div className={styles.preview} aria-hidden="true" />}
        {!playing && (
          <div className={styles.overlay}>
            <button className={styles.play} type="button" onClick={play} aria-label={started ? 'Resume Dhurandhar video' : 'Play Dhurandhar video'}>
              <Play size={30} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
            </button>
            {!started && <span className={styles.hint}>PLAY FILM</span>}
          </div>
        )}
        {error && <p className={styles.error} role="status">{error}</p>}
      </div>
      <div className={styles.effectsBar}>
        <VideoReactions />
      </div>
    </div>
  );
}
