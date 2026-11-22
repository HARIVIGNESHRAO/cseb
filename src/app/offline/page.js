import SavedPdfLibrary from '@/components/SavedPdfLibrary';
import { allSubjects } from '@/data/subjects';
import { getPdfCatalog } from '@/lib/pdfCatalog';

export const metadata = { title: 'Saved PDFs — DHURANDHAR' };

export default function OfflinePage() {
  const subjects = allSubjects.map(({ code, name, color, bg }) => ({ code, name, color, bg }));
  return <SavedPdfLibrary subjects={subjects} initialCatalog={getPdfCatalog()} initialCatalogAt={Date.now()} />;
}
