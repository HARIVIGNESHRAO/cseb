'use client';

import { useEffect, useState } from 'react';

export default function useHasSemesterSection(section) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const picker = document.getElementById('semester-picker');
    if (!picker) return;
    const attribute = `data-has-${section}`;
    const sync = () => setAvailable(picker.getAttribute(attribute) === 'true');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(picker, { attributes: true, attributeFilter: [attribute] });
    return () => observer.disconnect();
  }, [section]);

  return available;
}
