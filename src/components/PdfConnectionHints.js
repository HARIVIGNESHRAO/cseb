// Warm only the hosts used by this page; never download PDFs speculatively.
export default function PdfConnectionHints({ urls }) {
  const origins = [...new Set(urls.flatMap((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? [url.origin] : [];
    } catch {
      return [];
    }
  }))].slice(0, 3);

  return origins.map((origin) => (
    <link key={origin} rel="preconnect" href={origin} />
  ));
}
