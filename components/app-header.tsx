'use client'

import { useState } from 'react'
import { FileSearch, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApiKeyDialog } from '@/components/api-key-dialog'
import { useApiKey } from '@/hooks/use-api-key'
import { GEMINI_MODEL } from '@/lib/gemini'

export function AppHeader() {
  const { hasKey } = useApiKey()
  const [open, setOpen] = useState(false)

  return (
    <header className="print:hidden sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileSearch className="size-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-semibold tracking-tight">DocParse AI Pro</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Document intelligence powered by {GEMINI_MODEL}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            role="status"
            className={
              hasKey
                ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400'
                : 'inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400'
            }
          >
            <span
              className={
                hasKey
                  ? 'size-1.5 rounded-full bg-emerald-400'
                  : 'size-1.5 animate-pulse rounded-full bg-amber-400'
              }
              aria-hidden="true"
            />
            {hasKey ? 'API Key Connected' : 'Key Missing'}
          </span>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <KeyRound aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>
      <ApiKeyDialog open={open} onOpenChange={setOpen} />
    </header>
  )
}
