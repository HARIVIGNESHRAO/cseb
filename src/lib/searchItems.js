import { semesterSections } from '@/data/semesterSections';

const categoryLabels = {
  calendar: 'Academic Calendar',
  syllabus: 'Syllabus',
  timetable: 'Timetable',
  theory: 'Subject',
  lab: 'Lab',
  record: 'Record',
  'question-paper': 'Question Paper',
};

export function normalizeSearchValue(value) {
  return value.toLowerCase().trim();
}

export function buildSearchItems() {
  return Object.entries(semesterSections).flatMap(([semester, sections]) => {
    const subjects = [...new Map(sections.flatMap((section) => section.items).map((subject) => [subject.id, subject])).values()];
    return subjects.flatMap((subject) => {
    const subjectLabel = categoryLabels[subject.category] || 'Subject';
    const subjectText = [
      subject.code,
      subject.name,
      subject.desc,
      subject.category,
      subjectLabel,
    ]
      .filter(Boolean)
      .join(' ');

    const subjectItem = {
      id: `${semester}-${subject.id}`,
      semester,
      title: subject.name,
      meta: `${semester} · ${subject.code} · ${subjectLabel}`,
      href: `/subject/${subject.id}`,
      color: subject.color,
      icon: subject.icon,
      searchText: normalizeSearchValue(subjectText),
    };

    const unitItems = subject.units.map((unit) => {
      const resourceText = Array.isArray(unit.resources)
        ? unit.resources
            .map((resource) =>
              [resource.name, resource.topic, resource.fileName].filter(Boolean).join(' ')
            )
            .join(' ')
        : '';

      const unitText = [
        subject.code,
        subject.name,
        subject.category,
        subjectLabel,
        unit.name,
        unit.topic,
        unit.topics,
        resourceText,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: `${semester}-${subject.id}-${unit.id}`,
        semester,
        title: unit.topic || unit.name,
        meta: `${semester} · ${subject.code} · ${unit.name}`,
        href: `/subject/${subject.id}/${unit.id}`,
        color: subject.color,
        icon: subject.icon,
        searchText: normalizeSearchValue(unitText),
      };
    });

    return [subjectItem, ...unitItems];
    });
  });
}

export function filterSearchItems(items, query, semester, scope = 'current') {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return [];
  return items.filter((item) =>
    (scope === 'all' || item.semester === semester) && item.searchText.includes(normalizedQuery)
  );
}
