export function groupSavedPdfs(files, subjects = []) {
  const groups = new Map();
  for (const file of files) {
    const parts = String(file.title || 'Saved PDF').split(' · ');
    const code = parts.length > 1 ? parts.shift().trim() : 'Other';
    const label = parts.join(' · ');
    if (!groups.has(code)) {
      const subject = subjects.find((entry) => entry.code === code);
      groups.set(code, {
        code, name: subject?.name || (code === 'Other' ? 'Other study materials' : code),
        color: subject?.color, bg: subject?.bg, files: [],
      });
    }
    groups.get(code).files.push({ ...file, label });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    files: group.files.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
  })).sort((a, b) => a.name.localeCompare(b.name));
}
