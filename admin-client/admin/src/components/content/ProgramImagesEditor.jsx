import { useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2, Upload } from 'lucide-react'
import { mediaUrl } from '@/lib/mediaUrl'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Input'

function makeKey() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ProgramImagesEditor({ images, onChange, label = 'Carousel images' }) {
  const previewUrls = useMemo(() => {
    const map = new Map()
    for (const item of images) {
      if (item.file) {
        map.set(item.key, URL.createObjectURL(item.file))
      }
    }
    return map
  }, [images])

  useEffect(() => {
    return () => {
      for (const url of previewUrls.values()) {
        URL.revokeObjectURL(url)
      }
    }
  }, [previewUrls])

  const move = (index, direction) => {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const remove = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    onChange([
      ...images,
      ...files.map((file) => ({ key: makeKey(), url: '', file })),
    ])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>{label}</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Multiple photos shown in the carousel on the public Programs page.
          </p>
        </div>
        <label className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">
          <Plus className="h-4 w-4" />
          Add photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No carousel images yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add one or more photos for the program slideshow.</p>
          <label className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            Upload photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((item, index) => {
            const preview = previewUrls.get(item.key) || (item.url ? mediaUrl(item.url) : '')
            return (
              <div
                key={item.key}
                className="flex flex-col gap-3 rounded-xl border border-border bg-muted/10 p-4 sm:flex-row sm:items-center"
              >
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {item.file ? item.file.name : `Image ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.file ? 'Uploads when you save the program' : item.url}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove image" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
