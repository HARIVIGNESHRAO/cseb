'use client';
import { useEffect, useRef, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import styles from './HomepageVideo.module.css';
import { createVisitorId } from '@/lib/visitorId';

export default function VideoReactions() {
  const visitorRef = useRef('');
  const pendingRef = useRef(false);
  const versionRef = useRef(0);
  const [counts, setCounts] = useState(null);
  const [reaction, setReaction] = useState('none');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    try {
      visitorRef.current = localStorage.getItem('cseb-video-reaction-visitor') || createVisitorId();
      localStorage.setItem('cseb-video-reaction-visitor', visitorRef.current);
    } catch { visitorRef.current = createVisitorId(); }
    async function refresh() {
      if (document.hidden || pendingRef.current) return;
      const version = versionRef.current;
      try {
        const response = await fetch(`/api/video-reactions?visitorId=${encodeURIComponent(visitorRef.current)}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active && !pendingRef.current && version === versionRef.current) { setCounts(data); setReaction(data.reaction); setError(''); }
      } catch {
        if (active && !controller.signal.aborted) setError('Reactions are currently unavailable.');
      }
    }
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => { active = false; controller.abort(); window.clearInterval(interval); };
  }, []);

  async function vote(value) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    versionRef.current += 1;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/video-reactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: visitorRef.current, reaction: reaction === value ? 'none' : value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCounts(data); setReaction(data.reaction);
    } catch { setError('Could not save your reaction. Please try again.'); }
    finally { pendingRef.current = false; setPending(false); }
  }
  return (
    <div className={styles.reactions} role="group" aria-label="Video reactions" aria-busy={pending}>
      {[[ 'like', ThumbsUp, 'likes' ], [ 'dislike', ThumbsDown, 'dislikes' ]].map(([value, Icon, countKey]) => (
        <button key={value} type="button" className={styles.reactionButton} aria-pressed={reaction === value}
          aria-label={`${value === 'like' ? 'Like' : 'Dislike'} video${counts ? `, ${counts[countKey]} total` : ''}`}
          disabled={!counts || pending} onClick={() => vote(value)}>
          <Icon size={16} fill={reaction === value ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>{value === 'like' ? 'Like' : 'Dislike'}</span>
          <span className={styles.reactionCount}>{counts ? counts[countKey].toLocaleString() : '—'}</span>
        </button>
      ))}
      {error && <span className={styles.reactionError} role="status">{error}</span>}
    </div>
  );
}
