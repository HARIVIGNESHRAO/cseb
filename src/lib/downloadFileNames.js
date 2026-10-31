export function getZipUnitFileName(subject, unit) {
  const code = String(subject.code ?? subject.id).trim();
  const numberedUnit = /^Unit\s+(\d+)$/i.exec(String(unit.name ?? '').trim());
  if (numberedUnit) return `${code.toUpperCase()}_UNIT_${numberedUnit[1]}.pdf`;

  const rawSource = String(unit.pdfFile ?? unit.name ?? unit.id).trim();
  // Remote URLs are download sources, never useful archive entry names.
  const rawName = (/^https?:\/\//i.test(rawSource) ? String(unit.name ?? unit.id) : rawSource).replace(/\.pdf$/i, '');
  const comparableName = rawName.replace(/[^a-z0-9]+/gi, '').toLowerCase();
  const comparableCode = code.replace(/[^a-z0-9]+/gi, '').toLowerCase();
  const name = comparableName.startsWith(comparableCode) ? rawName : `${code}_${rawName}`;
  return `${name.replace(/[^\w\s().-]/g, '').replace(/\s+/g, '_')}.pdf`;
}
