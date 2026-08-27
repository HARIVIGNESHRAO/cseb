import { statSync } from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function getPublicAssetVersion(assetUrl) {
  if (!assetUrl?.startsWith('/')) return null;

  const [pathname] = assetUrl.split('?');
  const normalizedPath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const assetPath = path.join(PUBLIC_DIR, normalizedPath);

  if (!assetPath.startsWith(PUBLIC_DIR)) return null;

  try {
    return String(Math.trunc(statSync(assetPath).mtimeMs));
  } catch {
    return null;
  }
}

export function withPdfAssetVersion(assetUrl) {
  const version = getPublicAssetVersion(assetUrl);
  if (!version) return assetUrl;

  const separator = assetUrl.includes('?') ? '&' : '?';
  return `${assetUrl}${separator}v=${version}`;
}

export function getAssetDownloadUrl(assetUrl) {
  if (typeof assetUrl !== 'string') return assetUrl;

  // The HTML download attribute does not force downloads for cross-origin
  // URLs. Cloudinary's fl_attachment delivery flag adds the required
  // Content-Disposition response header while preserving the original asset.
  if (
    assetUrl.startsWith('https://res.cloudinary.com/') &&
    assetUrl.includes('/upload/') &&
    !assetUrl.includes('/upload/fl_attachment')
  ) {
    return assetUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  return assetUrl;
}

export function getUnitDownloadFileName(subject, unit) {
  const rawName = String(unit.pdfFile ?? unit.id ?? 'study-material')
    .replace(/\.pdf$/i, '')
    .trim();
  const subjectCode = String(subject.code ?? subject.id ?? 'CSE').trim();
  const comparableName = rawName.replace(/[^a-z0-9]+/gi, '').toLowerCase();
  const comparableCode = subjectCode.replace(/[^a-z0-9]+/gi, '').toLowerCase();
  const fileBase = comparableName.startsWith(comparableCode)
    ? rawName
    : `${subjectCode}_${rawName}`;

  return `${fileBase.replace(/[\\/:*?"<>|]+/g, '_')}.pdf`;
}

export function getUnitPdfUrl(subject, unit) {
  if (unit.pdfUrl) return unit.pdfUrl;

  const pdfFile = unit.pdfFile ?? unit.id;

  // FIX: If pdfFile is a Cloudinary or external link, return it immediately
  if (typeof pdfFile === 'string' && (pdfFile.startsWith('http://') || pdfFile.startsWith('https://'))) {
    return pdfFile;
  }

  const pdfDir = subject.pdfDir ?? subject.id;

  return withPdfAssetVersion(`/pdfs/${pdfDir}/${pdfFile}.pdf`);
}
