import { getPdfCatalog } from '@/lib/pdfCatalog';

export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ files: getPdfCatalog(), checkedAt: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
}
