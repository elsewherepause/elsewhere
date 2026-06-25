'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { createGalleryImage, reorderGalleryImages } from '@/actions/gallery.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import SortableGalleryItem from './SortableGalleryItem'
import type { GalleryImage, MediaAsset } from '@prisma/client'

type Item = GalleryImage & { image: MediaAsset }

export default function GalleryAdminClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    setItems(reordered)
    await reorderGalleryImages(reordered.map((i) => i.id))
  }

  async function handleAddImage(asset: MediaAsset) {
    setAdding(true)
    const item = await createGalleryImage(asset.id)
    setItems((prev) => [...prev, { ...item, image: asset }])
    setAdding(false)
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleUpdated(id: string, data: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  return (
    <div className="space-y-2 max-w-3xl">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableGalleryItem
              key={item.id}
              item={item}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-[var(--color-border)] py-10 text-center text-sm text-[var(--color-ink-muted)]">
          No gallery images yet. Add one below.
        </div>
      )}

      <button
        onClick={() => setPickerOpen(true)}
        disabled={adding}
        className="w-full py-2.5 border border-dashed border-[var(--color-border)] text-xs uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-40"
      >
        {adding ? 'Adding…' : '+ Add Image / Video'}
      </button>

      {pickerOpen && (
        <MediaPicker
          onSelect={(asset) => { handleAddImage(asset); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
