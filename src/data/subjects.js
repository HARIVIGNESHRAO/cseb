const createLabUnits = (titles) =>
  titles.map((title, index) => {
    const fileNumber = index + 1;

    return {
      id: `pdf${fileNumber}`,
      name: title,
      topic: title,
      topics: '',
      pdfFile: `${fileNumber}`,
    };
  });

const cpLabTitles = ['Lab'];

const ccLabTitles = [
  'EC2',
  'Elastic Block Storage',
  'EFS',
  'S3',
  'VPC',
  'VPC Bastion',
  'Lambda',
  'SNS SQS',
  'Load Balancer',
  'Elastic Beanstalk',
  'LEX',
  'IAM Users',
  'IAM Roles',
];

const csLabTitles = [
  'Basic Firewall Configuration',
  'Password Strength Testing using Python',
  'Analyzing Phishing Emails',
  'Packet Sniffing and Network Traffic Analysis',
  'SQL Injection Attack – Cyber Security Lab Experiment',
  'Finding & Exploiting XSS Vulnerabilities using DVWA on Kali Linux',
  'Testing Authentication Weaknesses and Session Management Using Kali Linux & DVWA',
  'Testing IoT Device Security (Default Passwords & Open Ports)',
  'Analysing Android App Permissions and Mobile Traffic',
  'Web Application Vulnerability Scanning with OWASP ZAP',
  'Creating and Analyzing Disk Images Using dc3dd and Autopsy (Alternative to FTK Imager)',
  'Network Forensics Using Wireshark',
  'Log File Analysis for Incident Detection Lab',
  'Privacy Audit of Popular Apps (Desktop WhatsApp) and Websites (Facebook) & Data Breach Case Study Analysis',
  'Conducting a Security Audit and Risk Assessment',
  'Cloud Security Configuration Lab – AWS Free Tier',
];

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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
      { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
      {
        id: 'codes',
        name: 'Codes',
        topic: 'Code Files',
        topics: 'Download Rabbitmq.zip and view Elasticsearch PDF',
        resources: [
          {
            id: 'rabbitmq',
            name: 'Rabbitmq',
            topic: 'Rabbitmq ZIP File',
            fileName: 'Rabbitmq.zip',
            fileUrl: '/pdfs/mwt/Rabbitmq.zip',
            canPreview: false,
          },
          {
            id: 'elasticsearch',
            name: 'Elasticsearch',
            topic: 'Elasticsearch PDF',
            fileName: 'elasticsearch.pdf',
            fileUrl: '/pdfs/mwt/elasticsearch.pdf',
            canPreview: true,
          },
        ],
      },
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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
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
      { id: 'unit1', name: 'Unit 1', topic: '', topics: '' },
      { id: 'unit2', name: 'Unit 2', topic: '', topics: '' },
       { id: 'unit3', name: 'Unit 3', topic: '', topics: '' },
      { id: 'unit4', name: 'Unit 4', topic: '', topics: '' },
      { id: 'unit5', name: 'Unit 5', topic: '', topics: '' },
    ],
  },
];

export const academicCalendarSubjects = [
  {
    id: 'academic-calendar',
    code: 'CAL',
    name: 'Academic Calendar',
    desc: '',
    category: 'calendar',
    pdfDir: 'calendar',
    color: '#14B8A6',
    bg: 'rgba(20,184,166,0.15)',
    icon: '📘',
    units: [
      {
        id: 'calendar',
        name: 'Calendar',
        topic: 'Academic Calendar PDF',
        topics: '',
        pdfFile: '1',
      },
    ],
  },
];

export const syllabusSubjects = [
  {
    id: 'all-subjects-syllabus',
    code: 'ALL SY',
    name: 'All Subjects Syllabus PDF Excluding IOT and CS',
    desc: '',
    category: 'syllabus',
    pdfDir: 'sy',
    color: '#4F8EF7',
    bg: 'rgba(79,142,247,0.15)',
    icon: '📄',
    units: [
      {
        id: 'syllabus',
        name: 'Syllabus',
        topic: 'All Subjects Syllabus PDF Excluding IOT and CS',
        topics: '',
        pdfFile: '1',
      },
    ],
  },
  {
    id: 'iot-syllabus',
    code: 'IOT SY',
    name: 'Internet of Things Syllabus',
    desc: '',
    category: 'syllabus',
    pdfDir: 'sy',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    icon: '📄',
    units: [
      {
        id: 'syllabus',
        name: 'Syllabus',
        topic: 'Internet of Things Syllabus PDF',
        topics: '',
        pdfFile: '2',
      },
    ],
  },
];

export const timetableSubjects = [
  {
    id: 'mid-timetable',
    code: 'MID',
    name: 'Mid Timetable',
    desc: '',
    category: 'timetable',
    pdfDir: 'mid',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.15)',
    icon: '🗓️',
    units: [
      {
        id: 'theory',
        name: 'Theory',
        topic: 'Mid Theory Timetable',
        topics: '',
        pdfFile: '1',
      },
      {
        id: 'lab',
        name: 'Lab',
        topic: 'Mid Lab Timetable',
        topics: '',
        pdfFile: '2',
      },
    ],
  },
  {
    id: 'sem-timetable',
    code: 'SEM',
    name: 'Semester Timetable',
    desc: '',
    category: 'timetable',
    pdfDir: 'sem',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.15)',
    icon: '📅',
    units: [
      {
        id: 'timetable',
        name: 'Timetable',
        topic: 'Semester Timetable PDF',
        topics: '',
        pdfFile: '1',
      },
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
    units: createLabUnits(cpLabTitles),
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
    units: [
      ...createLabUnits(ccLabTitles),
      {
        id: 'sample-doc',
        name: 'Sample Doc',
        topic: 'Sample Doc',
        topics: '',
        pdfFile: 'sample',
      },
    ],
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
    units: createLabUnits(csLabTitles),
  },
];

export const recordSubjects = [
  {
    id: 'cp-record',
    code: 'CP RECORD',
    name: 'Competitive Programming Record',
    desc: '',
    category: 'record',
    pdfDir: 'cp',
    color: '#4F8EF7',
    bg: 'rgba(79,142,247,0.15)',
    icon: '⚙️',
    units: [
      {
        id: 'record',
        name: 'Record',
        topic: 'Record PDF',
        topics: '',
        pdfFile: '22',
      },
    ],
  },
  {
    id: 'cc-record',
    code: 'CC RECORD',
    name: 'Cloud Computing Record',
    desc: '',
    category: 'record',
    pdfDir: 'cc',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.15)',
    icon: '☁️',
    units: [
      {
        id: 'record',
        name: 'Record',
        topic: 'Record PDF',
        topics: '',
        pdfUrl: 'https://drive.google.com/file/d/1hIsEG_u8fdkuQpMd8gSxG-dIlwYf2sdR/preview',
        openUrl:
          'https://drive.google.com/file/d/1hIsEG_u8fdkuQpMd8gSxG-dIlwYf2sdR/view?usp=sharing',
        downloadUrl:
          'https://drive.google.com/uc?export=download&id=1hIsEG_u8fdkuQpMd8gSxG-dIlwYf2sdR',
      },
    ],
  },
];

export const questionPaperSubjects = [
  {
    id: 'mid-question-paper',
    code: 'MID QP',
    name: 'Mid Question Papers',
    desc: '',
    category: 'question-paper',
    pdfDir: 'mid',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.15)',
    icon: '📝',
    units: [
      {
        id: 'question-paper',
        name: 'Question Papers',
        topic: 'Mid Question Papers PDF',
        topics: '',
        pdfFile: '3',
      },
    ],
  },
  {
    id: 'sem-question-paper',
    code: 'SEM QP',
    name: 'Semester Question Papers',
    desc: '',
    category: 'question-paper',
    pdfDir: 'iot',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    icon: '📝',
    units: [
      {
        id: 'question-paper',
        name: 'Question Papers',
        topic: 'IoT Question Papers PDF',
        topics: '',
        pdfFile: 'q',
      },
    ],
  },
];

export const allSubjects = [
  ...academicCalendarSubjects,
  ...syllabusSubjects,
  ...timetableSubjects,
  ...subjects,
  ...labSubjects,
  ...recordSubjects,
  ...questionPaperSubjects,
];
