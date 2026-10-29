const themeScript = `
(() => {
  try {
    const saved = localStorage.getItem('cseb-theme');
    const theme = ['light', 'dark', 'revenge'].includes(saved) ? saved : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
