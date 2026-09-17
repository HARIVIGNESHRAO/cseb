'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildSearchItems, filterSearchItems, normalizeSearchValue } from '@/lib/searchItems';

export default function useSemesterSearch(query) {
  const [semester, setSemester] = useState('4-1');
  const [scope, setScope] = useState('current');
  const items = useMemo(() => buildSearchItems(), []);

  useEffect(() => {
    const picker = document.getElementById('semester-picker');
    if (!picker) return;
    const sync = () => setSemester(picker.dataset.activeSemester);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(picker, { attributes: true, attributeFilter: ['data-active-semester'] });
    return () => observer.disconnect();
  }, []);

  const results = useMemo(() => filterSearchItems(items, query, semester, scope), [items, query, semester, scope]);
  return { semester, scope, setScope, results, normalizedQuery: normalizeSearchValue(query) };
}
