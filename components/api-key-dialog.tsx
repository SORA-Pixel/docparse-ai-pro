'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApiKey } from '@/hooks/use-api-key'

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const [draft, setDraft] = useState('')
  const [reveal, setReveal] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setDraft(apiKey)
      setReveal(false)
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, apiKey])

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    setApiKey(draft)
    onOpenChange(false)
  }

  const handleClear = () => {
    clearApiKey()
    setDraft('')
    onOpenChange(false)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false)
      }}
      className="m-auto w-full max-w-md rounded-xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      aria-labelledby={`${inputId}-title`}
    >
      <form onSubmit={handleSave} className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={`${inputId}-title`} className="text-lg font-semibold">
              Gemini API Key
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stored only in this browser&apos;s localStorage. It is sent directly to Google and never to
              our servers.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
            <X aria-hidden="true" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
          API key
        </label>
        <div className="relative">
          <input
            id={inputId}
            type={reveal ? 'text' : 'password'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="AIza..."
            autoComplete="off"
            spellCheck={false}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 font-mono text-sm outline-none ring-ring/40 transition focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={reveal ? 'Hide API key' : 'Show API key'}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Get a free key at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            aistudio.google.com/app/apikey
          </a>
          .
        </p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!apiKey}
            className="text-destructive hover:text-destructive"
          >
            Remove key
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!draft.trim()}>
              Save key
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
