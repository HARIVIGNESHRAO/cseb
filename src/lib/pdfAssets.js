import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const assetVersions = new Map();

function getPublicAssetVersion(assetUrl) {
  if (typeof assetUrl !== 'string' || !assetUrl.startsWith('/') || assetUrl.startsWith('//')) return null;
  try {
    const url = new URL(assetUrl, 'https://portal.local');
    const assetPath = path.resolve(PUBLIC_DIR, `.${decodeURIComponent(url.pathname)}`);
    if (!assetPath.startsWith(`${PUBLIC_DIR}${path.sep}`)) return null;
    const stat = statSync(assetPath);
    if (!stat.isFile()) return null;
    const signature = `${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    const cached = assetVersions.get(assetPath);
    if (cached?.signature === signature) return cached.version;
    const version = createHash('sha256').update(readFileSync(assetPath)).digest('hex').slice(0, 20);
    assetVersions.set(assetPath, { signature, version });
    return version;
  } catch {
    return null;
  }
}

export function withPdfAssetVersion(assetUrl) {
  const version = getPublicAssetVersion(assetUrl);
  if (!version) return assetUrl;
  const url = new URL(assetUrl, 'https://portal.local');
  url.searchParams.set('v', version);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getAssetDownloadUrl(assetUrl) {
  if (typeof assetUrl !== 'string') return assetUrl;

  // ImageKit can set Content-Disposition: attachment for cross-origin files.
  // Without this query parameter, browsers commonly open PDFs in a new tab
  // because the HTML download attribute is ignored across origins.
  try {
    const url = new URL(assetUrl);
    if (url.hostname === 'ik.imagekit.io') {
      url.searchParams.set('ik-attachment', 'true');
      return url.toString();
    }
  } catch {
    // Relative/local asset URLs are handled below.
  }

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
  if (unit.pdfUrl) return withPdfAssetVersion(unit.pdfUrl);

  const pdfFile = unit.pdfFile ?? unit.id;

  // FIX: If pdfFile is a Cloudinary or external link, return it immediately
  if (typeof pdfFile === 'string' && (pdfFile.startsWith('http://') || pdfFile.startsWith('https://'))) {
    return pdfFile;
  }

  const pdfDir = subject.pdfDir ?? subject.id;

  return withPdfAssetVersion(`/pdfs/${pdfDir}/${pdfFile}.pdf`);
}
