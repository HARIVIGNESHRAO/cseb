const topics = [
  ['Deep Learning Interview Questions', 'deep-learning/deep-learning-interview-questions'],
  ['Machine Learning Interview Questions', 'machine-learning/machine-learning-interview-questions'],
  ['OOPs Interview Questions', 'interview-prep/oops-interview-questions'],
  ['Java Interview Questions', 'java/java-interview-questions'],
  ['Python Interview Questions', 'python/python-interview-questions'],
  ['Data Science Coding Interview Questions', 'data-science/data-science-coding-interview-questions'],
  ['Generative AI Interview Questions & Answers', 'artificial-intelligence/generative-ai-interview-question-with-answer'],
  ['Agentic AI Interview Questions & Answers', 'artificial-intelligence/top-agentic-ai-interview-questions-and-answers'],
  ['MLOps Interview Questions: Basic to Advanced', 'machine-learning/comprehensive-mlops-interview-questions-from-basic-to-advanced'],
  ['SQL Interview Questions', 'sql/sql-interview-questions'],
  ['DBMS Interview Questions', 'dbms/commonly-asked-dbms-interview-questions'],
  ['Web API Interview Questions & Answers', 'interview-experiences/web-api-interview-questions-and-answers'],
  ['JavaScript Interview Questions', 'javascript/javascript-interview-questions'],
  ['React Interview Questions', 'reactjs/react-interview-questions'],
  ['Advanced NLP Interview Questions', 'nlp/advanced-natural-language-processing-interview-question'],
  ['Artificial Intelligence Interview Questions & Answers', 'artificial-intelligence/artificial-intelligenceai-interview-questions-and-answers'],
  ['AWS Interview Questions', 'cloud-computing/aws-interview-questions'],
  ['Git Interview Questions & Answers', 'git/git-interview-questions-and-answers'],
  ['Docker Interview Questions', 'devops/docker-interview-questions'],
  ['What Are LLM Parameters?', 'artificial-intelligence/what-are-llm-parameters'],
  ['Knowledge Graphs for RAG', 'artificial-intelligence/knowledge-graphs-for-rag'],
  ['DevOps Interview Questions', 'devops/devops-interview-questions'],
  ['Full Stack Developer Interview Questions & Answers', 'html/full-stack-developer-interview-questions-and-answers'],
  ['Data Science Interview Questions & Answers', 'data-science/data-science-interview-questions-and-answers'],
  ['Software Testing Interview Questions', 'software-testing/software-testing-interview-questions'],
  ['Data Analyst Interview Questions & Answers', 'data-analysis/data-analyst-interview-questions-and-answers'],
  ['Pandas Interview Questions', 'pandas/pandas-interview-questions'],
  ['NumPy Interview Questions', 'numpy/numpy-interview-questions'],
  ['What Are AI Guardrails?', 'artificial-intelligence/what-are-ai-guardrails'],
  ['Computer Networks Interview Questions', 'computer-networks/commonly-asked-computer-networks-interview-questions-set-1'],
  ['Operating Systems Interview Questions', 'operating-systems/operating-systems-interview-questions'],
  ['Aptitude Puzzles', 'aptitude/puzzles'],
  ['Convert Unstructured Data to Structured Data Using Python', 'python/how-to-convert-unstructured-data-to-structured-data-using-python'],
];

export const interviewResources = topics.map(([title, path]) => ({
  title,
  href: `https://www.geeksforgeeks.org/${path}/`,
  source: 'GeeksforGeeks',
}));

// The supplied signed URL could not be opened to confirm its document title.
interviewResources.splice(9, 0, {
  title: 'Interview Preparation — LinkedIn PDF',
  href: 'https://media.licdn.com/dms/document/media/v2/D4E1FAQENWoIXZU3iZA/feedshare-document-url-metadata-scrapper-pdf/B4EZsJLCu4KgA0-/0/1765385451070?e=1783749600&v=beta&t=d2iTgQIQkbEl3a84vk0GpAlw2135j8r4GgIfCaYxrgw',
  source: 'LinkedIn · PDF',
  note: 'This link may have expired. A replacement link may be needed.',
});
