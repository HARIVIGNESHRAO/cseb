function searchWords(value) {
  return value.toLowerCase().replace(/([a-z])(\d)/g, '$1 $2').match(/[a-z0-9]+/g) || [];
}

function sourceKey(href, origin) {
  if (typeof href !== 'string' || !href) return null;
  try {
    const url = new URL(href, origin);
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

export function searchPdfMaterials(catalog, query, savedFiles, { savedOnly, origin }) {
  const terms = searchWords(query);
  const unitNumber = terms.find((term, index) => terms[index - 1] === 'unit' && /^\d+$/.test(term));
  if (!terms.length && !savedOnly) return [];

  const savedBySource = new Map();
  const savedById = new Map();
  for (const file of savedFiles) {
    const source = sourceKey(file.sourceUrl, origin);
    if (source && !savedBySource.has(source)) savedBySource.set(source, file);
    if (file.catalogId && !savedById.has(file.catalogId)) savedById.set(file.catalogId, file);
  }

  return catalog.flatMap((pdf) => {
    if (unitNumber && !searchWords(pdf.unitName || '').includes(unitNumber)) return [];
    const words = searchWords([pdf.title, pdf.subjectName, pdf.subjectCode, pdf.unitName, pdf.topic, pdf.topics].join(' '));
    if (!terms.every((term) => words.some((word) => /^\d+$/.test(term) ? word === term : word.startsWith(term)))) return [];
    const saved = savedBySource.get(sourceKey(pdf.sourceUrl, origin)) || savedById.get(pdf.id);
    if (savedOnly && !saved) return [];
    return [{ ...pdf, href: savedOnly ? saved.url : pdf.sourceUrl, saved: Boolean(saved) }];
  });
}
