const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('cseb-theme');
    const saved = stored === 'emerald' ? 'rehman' : stored;
    const theme = ['light', 'dark', 'revenge', 'rehman', 'iqbal', 'aslam'].includes(saved) ? saved : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
