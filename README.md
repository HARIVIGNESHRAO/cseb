# CSE Study Portal

A Next.js study portal for B.Tech CSE students, with semester resources, lab materials, question papers, and interview preparation.

**Website:** [csesalaar.vercel.app](https://csesalaar.vercel.app/)

## Features

- Semester selection from **2-1 through 4-2**, with the selected semester remembered in the browser.
- Subject notes, academic calendars, syllabi, question paper collections, and lab resources, depending on the semester.
- Responsive sidebar and sticky navigation, with sidebar highlighting that follows the visible homepage section.
- Search across study materials, plus voice search in browsers that support it.
- Local and externally hosted PDFs, individual downloads, and ZIP downloads for theory subjects.
- Lab demonstration videos and experiment-specific notices for SDC and STM.
- **Interview Questions & Answers:** one homepage card available across all semesters opens a dedicated page with 34 external resources. Sidebar and navbar links scroll to the homepage card.
- **Ask AI** inside the PDF viewer: ChatGPT, Claude, Gemini, Grok, NotebookLM, Adobe Acrobat AI, and ChatPDF, with a copyable message containing the current PDF URL.
- Light/dark themes, feedback submission, visit counting, and exam countdowns.

Ask AI opens external services; it is not a built-in AI chat. ChatGPT and Claude links include a prepared prompt, while other tools use the copied message. Service behavior can vary, and users may need to upload the PDF if the service cannot read its URL. No AI API key is required by this integration.

## Local setup

Use a Node.js version compatible with the installed Next.js 14 release and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000). If you already have `.env.local`, keep it and add only missing settings.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SHEETS_FEEDBACK_URL` | Google Apps Script endpoint used by the feedback API. |
| `GOOGLE_SHEETS_VISITS_URL` | Google Apps Script endpoint used for persistent visit tracking. |

The study resources work without these integrations. Feedback submission reports a configuration error without its endpoint. Visit tracking falls back to `/tmp/cseb-portal-visits.json`; this is temporary storage and is not a durable, shared counter on serverless hosting.

Keep deployment URLs and other private settings in `.env.local` or your hosting provider's environment settings, not in source files.

## Updating study materials

Edit [src/data/subjects.js](src/data/subjects.js) for subject names, colors, categories, units, PDFs, and videos. Each subject needs a unique `id`, and each unit ID must be unique within its subject because IDs form the page URLs.

Semester-to-resource mappings live in [HomeSemesterTabs.js](src/components/HomeSemesterTabs.js). When adding a new subject, include it in the appropriate semester array and ensure it is included in `allSubjects` for subject and unit routes.

### Local PDFs

The PDF path is constructed as:

```text
public/pdfs/<subject.pdfDir or subject.id>/<unit.pdfFile or unit.id>.pdf
```

For example, a subject with `pdfDir: 'stm'` and a unit with `pdfFile: 'unit1'` uses `public/pdfs/stm/unit1.pdf`. Use the base filename without `.pdf` for local `pdfFile` values.

```js
{
  id: 'unit1',
  name: 'Unit 1',
  pdfFile: 'unit1',
}
```

Local asset URLs receive a file modification version through `src/lib/pdfAssets.js` to help updated PDFs load despite long cache lifetimes.

### External PDFs

Set `pdfUrl` to the full PDF URL. Existing entries also support a full HTTP(S) URL in `pdfFile`.

```js
{
  id: 'unit1',
  name: 'Unit 1',
  pdfUrl: 'https://example.com/notes.pdf',
}
```

Optional `openUrl` and `downloadUrl` override the opening and downloading destinations. Use stable public URLs; signed links can expire.

### Lab videos

```js
{
  id: 'video1',
  name: 'Lab Demonstration Video',
  topic: 'Experiments 1–3',
  type: 'youtube',
  videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
}
```

Experiment alerts are configured in `src/app/subject/[subjectId]/[unitId]/page.js`. The homepage lab announcement is in `HomeSemesterTabs.js` and uses a versioned localStorage key so each announcement appears once per browser. Change that key only when publishing a new announcement intended for previous visitors too.

## Interview preparation

Edit [src/data/interviewResources.js](src/data/interviewResources.js) to add or update resource headings and URLs. The homepage count and dedicated page are generated from this data.

- Homepage card: `src/components/InterviewResources.js`
- Resources page: `/interview-questions`
- Destination layout: reuses the subject-page styles and numbered resource rows.

The supplied LinkedIn PDF link could not be verified and is marked as potentially expired; replace it with a stable URL when available.

## Project structure

```text
src/
  app/
    page.js                         Homepage
    interview-questions/page.js     Interview resource list
    subject/[subjectId]/
      page.js                       Subject resource list
      [unitId]/page.js               Individual resource/video page
    api/
      feedback/route.js             Feedback integration
      visits/route.js               Visit tracking
  components/
    HomeSemesterTabs.js             Semester selection and resource cards
    Navbar.js                       Desktop/mobile sidebar and scroll highlighting
    HomeStickyNav.js                Sticky navigation and search
    HomeSearch.js                   Homepage search
    InterviewResources.js          Placement preparation card
    PdfViewer.js                    PDF actions, Ask AI, and video playback
    DownloadAllButton.js            ZIP downloads
    HomeFeedbackForm.js             Feedback form
  data/
    subjects.js                    Subjects, units, documents, and videos
    interviewResources.js          Interview preparation links
  lib/
    pdfAssets.js                   PDF paths, versioning, and download helpers
public/
  pdfs/                            Locally hosted PDFs
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run clean` | Remove the generated `.next` directory. |
| `npm run lint` | Run Next.js linting; initial ESLint configuration may be required. |

## Production deployment

```bash
npm run build
npm start
```

For Vercel, import the Git repository as a Next.js project and configure the environment variables above. Redeploy after changing resource data, local PDFs, or environment settings. The API routes require a server-capable deployment rather than a static-only file host.
