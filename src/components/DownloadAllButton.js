'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import styles from '@/app/subject/[subjectId]/subject.module.css';

function getFileExtension(url, fallback = 'pdf') {
    try {
        const cleanUrl = url.split('?')[0];
        const lastPart = cleanUrl.split('/').pop() || '';
        if (lastPart.includes('.')) {
            return lastPart.split('.').pop();
        }
    } catch {}
    return fallback;
}

function safeFileName(name) {
    return String(name).replace(/[^\w\s().-]/g, '').replace(/\s+/g, '_');
}

function getUnitUrl(subject, unit) {
    const source = unit.downloadUrl ?? unit.openUrl ?? unit.pdfFile;
    if (!source) return null;
    if (/^https?:\/\//i.test(source)) return source;

    const pdfDir = subject.pdfDir ?? subject.id;
    return `/pdfs/${pdfDir}/${source}.pdf`;
}

function getUnitFileName(subject, unit) {
    const rawName = String(unit.pdfFile ?? unit.name ?? unit.id).replace(/\.pdf$/i, '').trim();
    const code = String(subject.code ?? subject.id).trim();
    const comparableName = rawName.replace(/[^a-z0-9]+/gi, '').toLowerCase();
    const comparableCode = code.replace(/[^a-z0-9]+/gi, '').toLowerCase();
    const name = comparableName.startsWith(comparableCode) ? rawName : `${code}_${rawName}`;
    return `${safeFileName(name)}.pdf`;
}

export default function DownloadAllButton({ subject }) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const downloadableUnits = subject.units.filter((unit) => {
        const isVideo = unit.type === 'video' || unit.type === 'youtube' || Boolean(unit.videoUrl);
        const isExternalLinks = unit.type === 'external-links';
        return !isVideo && !isExternalLinks && (unit.pdfFile || unit.downloadUrl || unit.resources?.length);
    });

    if (!downloadableUnits.length) return null;

    const handleDownloadAll = async () => {
        try {
            setLoading(true);

            const zip = new JSZip();
            const files = [];

            downloadableUnits.forEach((unit) => {
                const unitUrl = getUnitUrl(subject, unit);

                if (unitUrl && !unit.resources?.length) {
                    files.push({
                        name: getUnitFileName(subject, unit),
                        url: unitUrl,
                    });
                }

                if (Array.isArray(unit.resources)) {
                    unit.resources.forEach((resource) => {
                        const resourceUrl = resource.fileUrl;
                        const ext = getFileExtension(resource.fileName || resourceUrl, resource.canPreview ? 'pdf' : 'zip');

                        files.push({
                            name: resource.fileName || `${safeFileName(resource.name)}.${ext}`,
                            url: resourceUrl,
                        });
                    });
                }
            });

            setProgress({ current: 0, total: files.length });

            for (const [index, file] of files.entries()) {
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file.name}`);
                }
                const blob = await response.blob();
                zip.file(file.name, blob);
                setProgress({ current: index + 1, total: files.length });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const objectUrl = window.URL.createObjectURL(zipBlob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${safeFileName(subject.code || subject.name)}-all-files.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error(error);
            alert('Could not create ZIP file. Some remote files may not allow download.');
        } finally {
            setLoading(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    return (
        <button
            type="button"
            onClick={handleDownloadAll}
            disabled={loading}
            className={styles.downloadAllButton}
            style={{ '--color': subject.color, '--bg': subject.bg }}
        >
            {loading
                ? `Preparing ZIP ${progress.current}/${progress.total || '…'}`
                : '⬇ Download all as ZIP'}
        </button>
    );
}
