const createLabUnits = (count = 13) =>
  Array.from({ length: count }, (_, index) => {
    const fileNumber = index + 1;

    return {
      id: `pdf${fileNumber}`,
      name: `PDF ${fileNumber}`,
      topic: `Lab File ${fileNumber}`,
      topics: '',
      pdfFile: `${fileNumber}`,
    };
  });

export const subjects = [
  {
    id: 'cp',
    code: 'CP',
    name: 'Competitive Programming',
    desc: '',
    category: 'theory',
    pdfDir: 'cp',
    color: '#4F8EF7',
    bg: 'rgba(79,142,247,0.15)',
    icon: '⚙️',
    units: [
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
  {
    id: 'cc',
    code: 'CC',
    name: 'Cloud Computing',
    desc: '',
    category: 'theory',
    pdfDir: 'cc',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.15)',
    icon: '☁️',
    units: [
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
  {
    id: 'mwt',
    code: 'MWT',
    name: 'Middleware Technologies',
    desc: '',
    category: 'theory',
    pdfDir: 'mwt',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.15)',
    icon: '📡',
    units: [
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
  {
    id: 'iot',
    code: 'IoT',
    name: 'Internet of Things',
    desc: '',
    category: 'theory',
    pdfDir: 'iot',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    icon: '🔌',
    units: [
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
  {
    id: 'cs',
    code: 'CS',
    name: 'Cyber Security',
    desc: '',
    category: 'theory',
    pdfDir: 'cs',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
    icon: '🔒',
    units: [
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
  {
    id: 'ipr',
    code: 'IPR',
    name: 'Intellectual Property Rights',
    desc: '',
    category: 'theory',
    pdfDir: 'ipr',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.15)',
    icon: '⚖️',
    units: [
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
];

export const labSubjects = [
  {
    id: 'cp-lab',
    code: 'CP LAB',
    name: 'Competitive Programming Lab',
    desc: '',
    category: 'lab',
    pdfDir: 'cp',
    color: '#4F8EF7',
    bg: 'rgba(79,142,247,0.15)',
    icon: '⚙️',
    units: createLabUnits(1),
  },
  {
    id: 'cc-lab',
    code: 'CC LAB',
    name: 'Cloud Computing Lab',
    desc: '',
    category: 'lab',
    pdfDir: 'cc',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.15)',
    icon: '☁️',
    units: createLabUnits(),
  },
  {
    id: 'cs-lab',
    code: 'CS LAB',
    name: 'Cyber Security Lab',
    desc: '',
    category: 'lab',
    pdfDir: 'cs',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
    icon: '🔒',
    units: createLabUnits(),
  },
];

export const allSubjects = [...subjects, ...labSubjects];
