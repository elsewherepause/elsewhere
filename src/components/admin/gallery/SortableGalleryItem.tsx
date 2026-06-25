'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { deleteGalleryImage, updateGalleryImage } from '@/actions/gallery.actions'
import { cloudinaryUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import type { GalleryImage, MediaAsset } from '@prisma/client'

type Item = GalleryImage & { image: MediaAsset }

type Props = {
  item: Item
  onDeleted: (id: string) => void
  onUpdated: (id: string, data: Partial<Item>) => void
}

export default function SortableGalleryItem({ item, onDeleted, onUpdated }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [saving, startSave] = useTransition()
  const [form, setForm] = useState({
    altText: item.altText,
    caption: item.caption ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    mediaType: item.mediaType,
    published: item.published,
  })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  async function handleDelete() {
    if (!confirm('Delete this gallery image?')) return
    await deleteGalleryImage(item.id)
    onDeleted(item.id)
  }

  function handleSave() {
    startSave(async () => {
      await updateGalleryImage(item.id, form)
      onUpdated(item.id, form)
    })
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[var(--color-border)] rounded">
      <div className="flex items-center px-3 py-2.5 gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors flex-shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <div className="relative w-12 h-12 flex-shrink-0 bg-[var(--color-admin-bg)] overflow-hidden">
          <Image
            src={item.mediaType === 'VIDEO'
              ? cloudinaryVideoThumbnail(item.image.cloudinaryId, { width: 100, height: 100 })
              : cloudinaryUrl(item.image.cloudinaryId, { width: 100, height: 100, crop: 'fill' })}
            alt={item.altText}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="text-sm font-medium truncate">{item.caption || item.altText || 'Untitled'}</div>
          <div className="text-xs text-[var(--color-ink-muted)] mt-0.5 flex items-center gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${item.published ? 'bg-green-500' : 'bg-[var(--color-ink-faint)]'}`} />
            {item.published ? 'Published' : 'Hidden'}
            {item.category && <span>· {item.category}</span>}
            <span>· {item.mediaType === 'VIDEO' ? 'Video' : 'Photo'}</span>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDelete}
            className="text-xs text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[var(--color-ink-muted)] text-sm leading-none"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] p-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
              Alt Text *
            </label>
            <input
              className="field-input"
              value={form.altText}
              onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
              Caption
            </label>
            <input
              className="field-input"
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              placeholder="Short title shown next to the image"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
              Description
            </label>
            <textarea
              className="field-input min-h-20"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
                Category
              </label>
              <input
                className="field-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Culture, Adventure"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
                Type
              </label>
              <select
                className="field-input"
                value={form.mediaType}
                onChange={(e) => setForm((f) => ({ ...f, mediaType: e.target.value as Item['mediaType'] }))}
              >
                <option value="PHOTO">Photo</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Published
          </label>

          <button
            onClick={handleSave}
            disabled={saving || !form.altText.trim()}
            className="px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
