'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { withPdfAssetVersion } from '@/lib/pdfAssets';
import styles from '@/app/subject/[subjectId]/[unitId]/unit.module.css';

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
    return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

export default function DownloadAllButton({ subject }) {
    const [loading, setLoading] = useState(false);

    const handleDownloadAll = async () => {
        try {
            setLoading(true);

            const zip = new JSZip();
            const files = [];

            subject.units.forEach((unit) => {
                if (unit.pdfFile) {
                    files.push({
                        name: `${safeFileName(unit.name)}.pdf`,
                        url: withPdfAssetVersion(unit.downloadUrl ?? unit.openUrl ?? unit.pdfFile),
                    });
                }

                if (Array.isArray(unit.resources)) {
                    unit.resources.forEach((resource) => {
                        const resourceUrl = withPdfAssetVersion(resource.fileUrl);
                        const ext = getFileExtension(resource.fileName || resourceUrl, resource.canPreview ? 'pdf' : 'zip');

                        files.push({
                            name: resource.fileName || `${safeFileName(resource.name)}.${ext}`,
                            url: resourceUrl,
                        });
                    });
                }
            });

            for (const file of files) {
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file.name}`);
                }
                const blob = await response.blob();
                zip.file(file.name, blob);
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
        }
    };

    return (
        <button
            type="button"
            onClick={handleDownloadAll}
            disabled={loading}
            className={styles.btnDownload}
            style={{ '--color': subject.color, '--bg': subject.bg }}
        >
            {loading ? '⏳ Preparing ZIP...' : '🗂 Download All PDFs'}
        </button>
    );
}