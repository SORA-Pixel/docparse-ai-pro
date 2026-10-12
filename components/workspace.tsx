'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, FileText, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileDropzone } from '@/components/file-dropzone'
import { DocumentPreview } from '@/components/document-preview'
import { useApiKey } from '@/hooks/use-api-key'
import {
  GeminiError,
  TASKS,
  type TaskId,
  generateWithGemini,
  readFileAsBase64,
} from '@/lib/gemini'

interface GenerationResult {
  markdown: string
  taskId: TaskId
  fileName: string
  generatedAt: Date
}

interface ErrorState {
  title: string
  hint: string
}

type Stage = 'idle' | 'reading' | 'uploading' | 'done'

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  reading: 'Encoding file to Base64…',
  uploading: 'Analyzing document with Gemini… this can take up to a minute for long PDFs.',
  done: '',
}

export function Workspace() {
  const { apiKey, hasKey } = useApiKey()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<TaskId>('summary')
  const [customPrompt, setCustomPrompt] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState<ErrorState | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const task = TASKS.find((candidate) => candidate.id === taskId) ?? TASKS[0]
  const busy = stage === 'reading' || stage === 'uploading'
  const canGenerate = Boolean(file) && hasKey && !busy

  const handleGenerate = async () => {
    if (!file) return
    setError(null)
    try {
      setStage('reading')
      const base64Data = await readFileAsBase64(file)

      const promptText = customPrompt.trim()
        ? `${task.prompt}\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
        : task.prompt

      setStage('uploading')
      const markdown = await generateWithGemini({
        apiKey,
        mimeType: file.type,
        base64Data,
        promptText,
      })

      setResult({ markdown, taskId: task.id, fileName: file.name, generatedAt: new Date() })
      setStage('done')
    } catch (caught) {
      setStage('idle')
      if (caught instanceof GeminiError) {
        setError({ title: caught.message, hint: caught.hint })
      } else {
        setError({
          title: caught instanceof Error ? caught.message : 'Something went wrong.',
          hint: 'Try again with a different file. If the problem persists, refresh the page.',
        })
      }
    }
  }

  const resultTask = result ? TASKS.find((candidate) => candidate.id === result.taskId) ?? TASKS[0] : null

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-10">
      <aside className="print:hidden flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <section aria-labelledby="upload-heading" className="flex flex-col gap-3">
          <StepHeading step={1} id="upload-heading">
            Upload a document
          </StepHeading>
          <FileDropzone
            file={file}
            previewUrl={previewUrl}
            onFileChange={(next) => {
              setFile(next)
              setError(null)
            }}
            onInvalidFile={(message) =>
              setError({ title: message, hint: 'Supported formats: .pdf, .png, .jpg, .jpeg' })
            }
            disabled={busy}
          />
        </section>

        <section aria-labelledby="task-heading" className="flex flex-col gap-3">
          <StepHeading step={2} id="task-heading">
            Choose a task
          </StepHeading>
          <div role="radiogroup" aria-labelledby="task-heading" className="flex flex-col gap-2">
            {TASKS.map((candidate) => {
              const selected = candidate.id === taskId
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={busy}
                  onClick={() => setTaskId(candidate.id)}
                  className={[
                    'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                    selected
                      ? 'border-primary/60 bg-primary/5'
                      : 'border-border bg-card/40 hover:border-muted-foreground/40 hover:bg-card',
                    busy ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selected ? 'border-primary' : 'border-muted-foreground/50',
                    ].join(' ')}
                  >
                    {selected && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{candidate.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {candidate.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="prompt-heading" className="flex flex-col gap-3">
          <StepHeading step={3} id="prompt-heading" optional>
            Custom instructions
          </StepHeading>
          <textarea
            id="custom-prompt"
            aria-labelledby="prompt-heading"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
            disabled={busy}
            rows={3}
            placeholder="e.g. Focus on chapter 3, write for a first-year student, include formulas…"
            className="w-full resize-y rounded-xl border border-input bg-card/40 px-3.5 py-3 text-sm outline-none ring-ring/40 transition placeholder:text-muted-foreground/70 focus:ring-2 disabled:opacity-60"
          />
        </section>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={handleGenerate} disabled={!canGenerate} className="w-full">
            {busy ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            {busy ? 'Generating…' : `Generate ${task.shortLabel}`}
          </Button>
          {!hasKey && (
            <p className="text-center text-xs text-amber-400">
              Add your Gemini API key in Settings to enable generation.
            </p>
          )}
          {hasKey && !file && (
            <p className="text-center text-xs text-muted-foreground">Upload a file to get started.</p>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="print:hidden flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-destructive">{error.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.hint}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setError(null)}>
              <X aria-hidden="true" />
              <span className="sr-only">Dismiss error</span>
            </Button>
          </div>
        )}

        {busy && (
          <div
            role="status"
            aria-live="polite"
            className="print:hidden flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card/40 px-6 py-24 text-center"
          >
            <div className="relative flex size-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">{stage === 'reading' ? 'Preparing file' : 'Thinking'}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{STAGE_LABEL[stage]}</p>
            </div>
            <ProgressBar stage={stage} />
          </div>
        )}

        {!busy && result && resultTask && (
          <DocumentPreview
            markdown={result.markdown}
            task={resultTask}
            fileName={result.fileName}
            generatedAt={result.generatedAt}
          />
        )}

        {!busy && !result && (
          <div className="print:hidden flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/20 px-6 py-24 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="size-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-medium">Your document preview will appear here</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Upload a PDF or photo of your notes, pick a task, and DocParse will produce a
                print-ready study document.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StepHeading({
  step,
  id,
  optional,
  children,
}: {
  step: number
  id: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-sm font-semibold">
      <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
        {step}
      </span>
      {children}
      {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
    </h2>
  )
}

function ProgressBar({ stage }: { stage: Stage }) {
  const width = stage === 'reading' ? '25%' : '70%'
  return (
    <div className="h-1 w-56 overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
        style={{ width }}
      />
    </div>
  )
}
