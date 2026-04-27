# CSE-B Study Portal

A Next.js study portal for B.Tech CSE Section B students.

## Subjects Included
- **CP** — C Programming
- **CC** — Cloud Computing
- **MWT** — Mobile & Wireless Technology
- **IoT** — Internet of Things
- **CS** — Cyber Security
- **IPR** — Intellectual Property Rights

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Add Your PDFs

Place your PDF files in the `public/pdfs/` folder like this:

```
public/
  pdfs/
    cp/
      unit1.pdf
      unit2.pdf
      unit3.pdf
      unit4.pdf
      unit5.pdf
    cc/
      unit1.pdf
      unit2.pdf
      unit3.pdf
      unit4.pdf
      unit5.pdf
    mwt/
      unit1.pdf ... unit5.pdf
    iot/
      unit1.pdf ... unit5.pdf
    cs/
      unit1.pdf ... unit5.pdf
    ipr/
      unit1.pdf ... unit5.pdf
```

The file names **must** match exactly: `unit1.pdf`, `unit2.pdf`, `unit3.pdf`, `unit4.pdf`, `unit5.pdf`

---

## Project Structure

```
src/
  app/
    page.js                          ← Home page (subjects grid)
    page.module.css
    globals.css
    layout.js
    subject/
      [subjectId]/
        page.js                      ← Units list for a subject
        subject.module.css
        [unitId]/
          page.js                    ← PDF viewer for a unit
          unit.module.css
  components/
    PdfViewer.js                     ← PDF iframe viewer (client component)
    PdfViewer.module.css
  data/
    subjects.js                      ← All subject & unit data (edit here)
public/
  pdfs/                              ← Put your PDF files here
```

---

## Customizing Subjects or Units

Edit `src/data/subjects.js` to:
- Change subject names, descriptions, colors
- Add/remove units
- Update unit topics

---

## Build for Production

```bash
npm run build
npm start
```

Or deploy to **Vercel** (recommended):
```bash
npx vercel
```
