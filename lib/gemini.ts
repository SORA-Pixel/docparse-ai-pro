export const API_KEY_STORAGE_KEY = 'gemini_api_key'
export const GEMINI_MODEL = 'gemini-3.8-flash'

export type TaskId = 'summary' | 'flashcards' | 'quiz'

export interface TaskDefinition {
  id: TaskId
  label: string
  shortLabel: string
  description: string
  prompt: string
}

export const TASKS: TaskDefinition[] = [
  {
    id: 'summary',
    label: 'Executive Summary & Study Notes',
    shortLabel: 'Summary',
    description: 'Structured overview, key concepts, and takeaways.',
    prompt: `You are an expert academic analyst. Analyze the attached document and produce a structured study guide in Markdown with these sections:

# Executive Summary
A concise 3-5 sentence overview of the document's purpose and conclusions.

## Key Concepts
A bulleted list of the most important ideas, each with a one-line explanation.

## Detailed Study Notes
Organized by the document's own sections or themes, using ### subheadings. Use bullet points, bold key terms, and tables where helpful.

## Important Definitions
A table with columns: Term | Definition.

## Key Takeaways
A numbered list of 5-8 points the reader must remember.

Be precise, faithful to the source, and do not invent facts that are not in the document.`,
  },
  {
    id: 'flashcards',
    label: 'Exam Flashcards & Q&A',
    shortLabel: 'Flashcards',
    description: 'Question-and-answer cards for active recall.',
    prompt: `You are an expert tutor. Read the attached document and create 15-20 exam-style flashcards in Markdown.

Format each card exactly like this:

### Card N
**Q:** The question
**A:** A clear, complete answer (1-3 sentences)

Group cards under ## headings by topic. Cover definitions, cause-and-effect relationships, processes, comparisons, and application questions. Prioritize the content most likely to appear on an exam. Use only information present in the document.`,
  },
  {
    id: 'quiz',
    label: 'Multiple Choice Practice Quiz',
    shortLabel: 'Quiz',
    description: 'Timed-exam style MCQs with an answer key.',
    prompt: `You are an exam setter. Based on the attached document, write a 10-question multiple choice practice quiz in Markdown.

# Practice Quiz

For each question use this format:

### Question N
The question text.

- A) option
- B) option
- C) option
- D) option

After all questions, add:

## Answer Key
A table with columns: Question | Correct Answer | Explanation.

Questions should range from recall to application and analysis. Exactly one option must be correct. Avoid "all of the above". Use only information from the document.`,
  },
]

export interface GeminiRequest {
  apiKey: string
  mimeType: string
  base64Data: string
  promptText: string
}

export class GeminiError extends Error {
  status: number
  hint: string

  constructor(message: string, status: number, hint: string) {
    super(message)
    this.name = 'GeminiError'
    this.status = status
    this.hint = hint
  }
}

function hintForStatus(status: number, message: string): string {
  if (status === 400) {
    if (/api key/i.test(message)) {
      return 'The API key appears to be malformed. Open settings and paste a key from Google AI Studio.'
    }
    return 'The request was rejected. Try a smaller file or a different file type.'
  }
  if (status === 401 || status === 403) {
    return 'Your API key was rejected or lacks permission. Generate a new key at aistudio.google.com/app/apikey and update it in settings.'
  }
  if (status === 404) {
    return `The model "${GEMINI_MODEL}" was not found. Check that your key has access to this model.`
  }
  if (status === 413) {
    return 'The file is too large for the API. Try a smaller PDF or compress the image.'
  }
  if (status === 429) {
    return 'You have hit the rate limit or quota. Wait a minute and try again, or check your quota in Google AI Studio.'
  }
  if (status >= 500) {
    return 'Google servers returned an error. This is usually temporary, so retry in a few seconds.'
  }
  return 'Check your network connection and try again.'
}

export async function generateWithGemini({
  apiKey,
  mimeType,
  base64Data,
  promptText,
}: GeminiRequest): Promise<string> {
  if (!apiKey) {
    throw new GeminiError(
      'No API key configured.',
      0,
      'Click the key icon in the header and paste your Gemini API key to get started.',
    )
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new GeminiError(
      'Could not reach the Gemini API.',
      0,
      'Check your internet connection. If you are behind a firewall, generativelanguage.googleapis.com must be reachable.',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message: string =
      payload?.error?.message ?? `Request failed with status ${response.status}.`
    throw new GeminiError(message, response.status, hintForStatus(response.status, message))
  }

  const candidate = payload?.candidates?.[0]
  const text: string | undefined = candidate?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? '')
    .join('')

  if (!text) {
    const reason = candidate?.finishReason ?? payload?.promptFeedback?.blockReason
    throw new GeminiError(
      reason ? `The model returned no content (${reason}).` : 'The model returned an empty response.',
      response.status,
      'The content may have been blocked by safety filters. Try a different document or adjust your prompt.',
    )
  }

  return text
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Unexpected file read result.'))
        return
      }
      // Strip the "data:<mime>;base64," header so only raw Base64 reaches the API.
      const cleanBase64 = result.split(',')[1]
      if (!cleanBase64) {
        reject(new Error('Could not extract file data.'))
        return
      }
      resolve(cleanBase64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
