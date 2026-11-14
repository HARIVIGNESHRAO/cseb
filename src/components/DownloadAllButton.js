'use client';

import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { getZipUnitFileName } from '@/lib/downloadFileNames';
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
    const source = unit.downloadUrl ?? unit.openUrl ?? unit.pdfUrl ?? unit.pdfFile;
    if (!source) return null;
    if (/^https?:\/\//i.test(source) || source.startsWith('/')) return source;

    const pdfDir = subject.pdfDir ?? subject.id;
    return `/pdfs/${pdfDir}/${source}.pdf`;
}

function saveZip(blob, subject) {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${safeFileName(subject.code || subject.name)}-all-files.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Give the browser time to start reading the download before releasing it.
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}

export default function DownloadAllButton({ subject }) {
    const downloadInProgress = useRef(false);
    const preparedZip = useRef(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const downloadableUnits = subject.units.filter((unit) => {
        const isVideo = unit.type === 'video' || unit.type === 'youtube' || Boolean(unit.videoUrl);
        const isExternalLinks = unit.type === 'external-links';
        return !isVideo && !isExternalLinks && (unit.pdfUrl || unit.pdfFile || unit.downloadUrl || unit.resources?.length);
    });

    if (!downloadableUnits.length) return null;

    const handleDownloadAll = async () => {
        if (downloadInProgress.current) return;
        downloadInProgress.current = true;
        try {
            const cacheKey = JSON.stringify(subject);
            if (preparedZip.current?.key === cacheKey) {
                saveZip(preparedZip.current.blob, subject);
                return;
            }
            setLoading(true);

            const zip = new JSZip();
            const files = [];

            downloadableUnits.forEach((unit) => {
                const unitUrl = getUnitUrl(subject, unit);

                if (unitUrl && !unit.resources?.length) {
                    files.push({
                        name: getZipUnitFileName(subject, unit),
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
            preparedZip.current = { key: cacheKey, blob: zipBlob };
            saveZip(zipBlob, subject);
        } catch (error) {
            console.error(error);
            alert('Could not create ZIP file. Some remote files may not allow download.');
        } finally {
            downloadInProgress.current = false;
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
