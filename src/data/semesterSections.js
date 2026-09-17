import {
  academicCalendarSubjects,
  academicCalendarSubjects1,
  academicCalendarSubjectsTwoOne,
  academicCalendarSubjectsTwoTwo,
  syllabusSubjects1,
  syllabusSubjectsTwoOne,
  syllabusSubjectsTwoTwo,
  questionPaperSubjects,
  subjects,
  subjectsTwoOne,
  subjectsTwoTwo,
  syllabusSubjects,
  subjectsThreeOne,
  subjects1,
  subjectsFourTwo,
  labSubjects, timetableSubjects1, record, questionPaperSubjects1
} from '@/data/subjects';

export const semesterTabs = [
  { id: '2-1', label: '2-1' },
  { id: '2-2', label: '2-2' },
  { id: '3-1', label: '3-1' },
  { id: '3-2', label: '3-2' },
  { id: '4-1', label: '4-1' },
  { id: '4-2', label: '4-2' },
];

const semesterThreeOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjectsThreeOne,
  },
];

const semesterThreeTwoSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: syllabusSubjects,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjects,
  },

  {
    id: 'papers',
    label: 'QUESTION PAPERS',

    items: questionPaperSubjects,
  },
];

const semesterFourOneSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects1,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: syllabusSubjects1,
  },
  // {
  //   id: 'timetable',
  //   label: 'TIMETABLE',
  //   count: `${timetableSubjects1.length} files`,
  //   items: timetableSubjects1,
  // },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjects1,
  },

  {
    id: 'lab-manuals',
    label: 'LAB SUBJECTS',

    items: record,
  },
  {
    id: 'papers',
    label: 'QUESTION PAPERS',

    items: questionPaperSubjects1
  },
];

const semesterFourTwoSyllabus = [syllabusSubjects1[0]];

const semesterFourTwoSections = [
  {
    id: 'academic-calendar',
    label: 'ACADEMIC CALENDAR',

    items: academicCalendarSubjects1,
  },
  {
    id: 'syllabus',
    label: 'SYLLABUS',

    items: semesterFourTwoSyllabus,
  },
  {
    id: 'subjects',
    label: 'SUBJECTS',

    items: subjectsFourTwo,
  },
];

export const semesterSections = {
  '2-1': [
    {
      id: 'academic-calendar',
      label: 'ACADEMIC CALENDAR',

      items: academicCalendarSubjectsTwoOne,
    },
    {
      id: 'syllabus',
      label: 'SYLLABUS',

      items: syllabusSubjectsTwoOne,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',

      items: subjectsTwoOne,
    },
  ],
  '2-2': [
    {
      id: 'academic-calendar',
      label: 'ACADEMIC CALENDAR',

      items: academicCalendarSubjectsTwoTwo,
    },
    {
      id: 'syllabus',
      label: 'SYLLABUS',

      items: syllabusSubjectsTwoTwo,
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',

      items: subjectsTwoTwo,
    },
  ],
  '3-1': semesterThreeOneSections,
  '3-2': semesterThreeTwoSections,
  '4-1': semesterFourOneSections,
  '4-2': semesterFourTwoSections,
};

