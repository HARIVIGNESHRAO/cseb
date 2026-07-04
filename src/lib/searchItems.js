import { allSubjects } from '@/data/subjects';

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
  return allSubjects.flatMap((subject) => {
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
      id: subject.id,
      title: subject.name,
      meta: `${subject.code} · ${subjectLabel}`,
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
        id: `${subject.id}-${unit.id}`,
        title: unit.topic || unit.name,
        meta: `${subject.code} · ${unit.name}`,
        href: `/subject/${subject.id}/${unit.id}`,
        color: subject.color,
        icon: subject.icon,
        searchText: normalizeSearchValue(unitText),
      };
    });

    return [subjectItem, ...unitItems];
  });
}
