'use client'

import { useId, useRef, useState } from 'react'
import { FileText, ImageIcon, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/gemini'

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const ACCEPT_ATTR = '.pdf,.png,.jpg,.jpeg'
const MAX_BYTES = 20 * 1024 * 1024

interface FileDropzoneProps {
  file: File | null
  previewUrl: string | null
  onFileChange: (file: File | null) => void
  onInvalidFile: (message: string) => void
  disabled?: boolean
}

export function FileDropzone({ file, previewUrl, onFileChange, onInvalidFile, disabled }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      onInvalidFile(`"${candidate.name}" is not supported. Upload a PDF, PNG, or JPEG file.`)
      return
    }
    if (candidate.size > MAX_BYTES) {
      onInvalidFile(`"${candidate.name}" is ${formatBytes(candidate.size)}. Files must be under 20 MB.`)
      return
    }
    onFileChange(candidate)
  }

  if (file) {
    const isImage = file.type.startsWith('image/')
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {isImage && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
          ) : (
            <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.type === 'application/pdf' ? 'PDF document' : file.type.replace('image/', '').toUpperCase() + ' image'}{' '}
            · {formatBytes(file.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onFileChange(null)}
          disabled={disabled}
        >
          <X aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    )
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (disabled) return
        acceptFile(event.dataTransfer.files?.[0])
      }}
      className={[
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card/40 hover:border-muted-foreground/40 hover:bg-card',
        disabled ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UploadCloud className="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium">
          Drop a file here or <span className="text-primary underline underline-offset-2">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, or JPEG · up to 20 MB</p>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          acceptFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </label>
  )
}
