const themeScript = `
(() => {
  try {
    const theme = localStorage.getItem('cseb-theme') === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
