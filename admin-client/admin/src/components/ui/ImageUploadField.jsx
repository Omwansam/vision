import { ImageIcon, Upload, X } from 'lucide-react'
import { mediaUrl } from '@/lib/mediaUrl'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

export function ImageUploadField({
  label = 'Photo',
  hint = 'JPEG, PNG, GIF, or WebP up to 10 MB.',
  file,
  previewSrc,
  onFileChange,
  onClearFile,
  existingUrl = '',
  onExistingUrlChange,
  allowUrlFallback = true,
  urlPlaceholder = 'https://… (optional fallback)',
}) {
  const displaySrc = previewSrc || (existingUrl && !file ? mediaUrl(existingUrl) : '')

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-6">
        {file || existingUrl || displaySrc ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {displaySrc ? (
                <img src={displaySrc} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {file ? (
                <>
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB — uploads on save
                  </p>
                  <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onClearFile}>
                    <X className="h-4 w-4" />
                    Remove selection
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Current image saved on server</p>
              )}
            </div>
            <label className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">
              <Upload className="h-4 w-4" />
              Replace
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const next = e.target.files?.[0]
                  if (next) onFileChange(next)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload a photo</p>
              <p className="mt-1 text-xs text-muted-foreground">From your device — stored on the server</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={(e) => {
                const next = e.target.files?.[0]
                if (next) onFileChange(next)
              }}
            />
          </label>
        )}

        {allowUrlFallback && !file && onExistingUrlChange && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Or external URL
            </p>
            <Input value={existingUrl} onChange={(e) => onExistingUrlChange(e.target.value)} placeholder={urlPlaceholder} />
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
