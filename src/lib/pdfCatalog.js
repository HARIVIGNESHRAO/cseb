import { allSubjects } from '@/data/subjects';
import { getUnitPdfUrl, withPdfAssetVersion } from '@/lib/pdfAssets';

// Only small file descriptors are sent to the offline library, never PDF bytes.
export function getPdfCatalog() {
  return allSubjects.flatMap((subject) => subject.units.flatMap((unit) => {
    if (unit.videoUrl || ['video', 'youtube', 'external-links'].includes(unit.type)) return [];
    const base = {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      unitId: unit.id,
      unitName: unit.name,
      topic: unit.topic,
      topics: unit.topics,
    };
    if (unit.resources?.length) return unit.resources.filter((resource) => resource.canPreview).map((resource) => ({
      ...base, resourceId: resource.id, id: `${subject.id}/${unit.id}/${resource.id}`,
      title: `${subject.code} · ${resource.name}`,
      sourceUrl: withPdfAssetVersion(resource.fileUrl),
      revision: String(resource.revision ?? resource.updatedAt ?? ''),
    }));
    return [{
      ...base, id: `${subject.id}/${unit.id}`,
      title: `${subject.code} · ${unit.name}${unit.topic ? ` · ${unit.topic}` : ''}`,
      sourceUrl: withPdfAssetVersion(unit.openUrl ?? getUnitPdfUrl(subject, unit)),
      revision: String(unit.revision ?? unit.updatedAt ?? ''),
    }];
  }));
}
