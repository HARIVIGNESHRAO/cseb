'use client';

import { useEffect, useState } from 'react';
import { semesterTabs } from '@/data/semesterSections';

function getActiveHref() {
  if (window.scrollY < 80) return '#';

  const semesterPicker = document.getElementById('semester-picker');
  const semesterHref = `#semester-${semesterPicker?.dataset.activeSemester}`;
  const sections = [
    { element: document.getElementById('search'), href: '#search' },
    { element: semesterPicker, href: semesterTabs.some((tab) => `#semester-${tab.id}` === semesterHref) ? semesterHref : '#' },
    { element: document.getElementById('subjects'), href: '#subjects' },
    { element: document.getElementById('lab-manuals'), href: '#lab-manuals' },
    { element: document.getElementById('papers'), href: '#papers' },
    { element: document.getElementById('interview-questions'), href: '#interview-questions' },
    { element: document.getElementById('feedback'), href: '#feedback' },
  ].filter(({ element }) => element && element.getClientRects().length > 0)
    .map(({ element, href }) => ({ href, top: element.getBoundingClientRect().top }))
    .sort((a, b) => a.top - b.top);

  // Select the last section that has reached the upper third of the viewport.
  const activationLine = Math.min(window.innerHeight * 0.3, 240);
  let active = '#';
  for (const section of sections) {
    if (section.top <= activationLine) active = section.href;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    return sections.at(-1)?.href ?? active;
  }
  return active;
}

export default function useActiveHomeSection() {
  const [activeHref, setActiveHref] = useState('#');
  useEffect(() => {
    let frame = null;
    const updateActiveHref = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        setActiveHref(getActiveHref());
      });
    };

    const picker = document.getElementById('semester-picker');
    const observer = new MutationObserver(updateActiveHref);
    if (picker) observer.observe(picker, { attributes: true, attributeFilter: ['data-active-semester'] });
    const resizeObserver = new ResizeObserver(updateActiveHref);
    resizeObserver.observe(document.body);
    updateActiveHref();
    window.addEventListener('scroll', updateActiveHref, { passive: true });
    window.addEventListener('hashchange', updateActiveHref);
    window.addEventListener('resize', updateActiveHref);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateActiveHref);
      window.removeEventListener('hashchange', updateActiveHref);
      window.removeEventListener('resize', updateActiveHref);
    };
  }, []);

  return [activeHref, setActiveHref];
}
