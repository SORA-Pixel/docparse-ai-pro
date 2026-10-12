'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy, FileSearch, Printer, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GEMINI_MODEL, type TaskDefinition } from '@/lib/gemini'

interface DocumentPreviewProps {
  markdown: string
  task: TaskDefinition
  fileName: string
  generatedAt: Date
}

export function DocumentPreview({ markdown, task, fileName, generatedAt }: DocumentPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = markdown.trim().split(/\s+/).length
  const dateLabel = generatedAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <section aria-label="Generated document" className="flex flex-col gap-4">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Document preview</h2>
          <p className="text-xs text-muted-foreground">Formatted for A4 printing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print / Download PDF
          </Button>
        </div>
      </div>

      <div className="print:p-0 overflow-x-auto rounded-xl bg-neutral-950/60 p-3 sm:p-6 print:bg-white">
        <article
          id="printable-document"
          className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-sm bg-white text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] print:max-w-none print:rounded-none print:shadow-none"
        >
          <header className="bg-neutral-900 px-8 py-7 text-white sm:px-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                <FileSearch className="size-3.5" aria-hidden="true" />
                DocParse AI Pro
              </div>
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
                {task.shortLabel}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{task.label}</h1>
            <p className="mt-1.5 text-sm text-neutral-400">
              Generated from <span className="text-neutral-200">{fileName}</span>
            </p>
          </header>

          <div className="grid grid-cols-2 gap-px border-b border-neutral-200 bg-neutral-200 sm:grid-cols-4">
            <MetaCard label="Source" value={fileName} />
            <MetaCard label="Generated" value={dateLabel} />
            <MetaCard label="Model" value={GEMINI_MODEL} />
            <MetaCard label="Length" value={`${wordCount.toLocaleString()} words`} />
          </div>

          <div className="document-body px-8 py-8 sm:px-12 sm:py-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>

          <footer className="flex items-center justify-between border-t border-neutral-200 px-8 py-4 text-[11px] text-neutral-500 sm:px-12">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3" aria-hidden="true" />
              AI-generated content. Verify against the original source.
            </span>
            <span>DocParse AI Pro</span>
          </footer>
        </article>
      </div>
    </section>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 px-5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-neutral-800" title={value}>
        {value}
      </p>
    </div>
  )
}
