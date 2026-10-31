export const SEMESTER_ROLLOVER = Date.parse('2026-11-20T14:00:00+05:30');

export function getSemesterDefaults(now = Date.now()) {
  const nextSemester = now >= SEMESTER_ROLLOVER;
  return {
    semester: nextSemester ? '4-2' : '4-1',
    storageKey: nextSemester ? 'cseb-selected-semester-4-2' : 'cseb-selected-semester',
  };
}
