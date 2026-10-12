# DocParse AI Pro 🚀

An AI-powered document intelligence and study assistant built for the **All U Can Do With AI** hackathon. **DocParse AI Pro** transforms complex, multi-page PDFs, textbook scans, and study photos into structured executive summaries, actionable study guides, exam flashcards, and interactive practice quizzes in seconds.

---

## ✨ Key Features

- **Multimodal Document Processing:** Upload text-heavy PDFs, scanned documents, diagrams, or textbook photos (`.pdf`, `.png`, `.jpg`, `.jpeg`).
- **Dynamic AI Generation Tasks:**
  - **Executive Summary & Study Notes:** Generates structured breakdowns, key takeaways, and bulleted concepts.
  - **Exam Flashcards & Q&A:** Creates quick-study flashcard pairs for rapid revision.
  - **Multiple Choice Quizzes:** Produces practice questions with immediate answer validation.
- **Formatted PDF Report Preview:** Renders output into a clean, printable document layout with 1-click Markdown copying and direct print-to-PDF support.
- **Client-Side Key Management:** Enter your Google Gemini API key safely in the app header; it persists securely in your browser's `localStorage`.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, `shadcn/ui`
- **AI Engine:** Google Gemini 3.8 Flash (`gemini-3.8-flash`) via direct client-side multimodal REST payload execution
- **Deployment:** Vercel

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
   cd YOUR_REPO_NAME
