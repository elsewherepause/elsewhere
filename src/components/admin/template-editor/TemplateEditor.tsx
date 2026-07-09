'use client'

import { useState, useRef, useTransition, type ComponentType } from 'react'
import Link from 'next/link'
import { updateProject, publishProject, unpublishProject } from '@/actions/project.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { SLOT_PATTERN } from '@/lib/homepage-slots'
import type { Project, MediaAsset } from '@prisma/client'
import { inputCls, textareaCls, hasContent, type ImageAdjust, type Section, type TemplateData, type Pattern, DEFAULT_ADJUST } from './shared'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }

function ImageAdjustControl({
  cloudName, imageId, label, adj, onPick, onAdjust, cropSlots,
}: {
  cloudName: string
  imageId?: string
  label: string
  adj: ImageAdjust
  onPick: () => void
  onAdjust: (adj: ImageAdjust) => void
  cropSlots?: { w: number; h: number }[]
}) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const url = imageId ? `https://res.cloudinary.com/${cloudName}/image/upload/w_240,q_auto,f_auto/${imageId}` : ''

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX, startY = e.clientY
    let moved = false

    function onMove(me: MouseEvent) {
      if (!moved && (Math.abs(me.clientX - startX) > 4 || Math.abs(me.clientY - startY) > 4)) moved = true
      if (moved && thumbRef.current) {
        const rect = thumbRef.current.getBoundingClientRect()
        const x = Math.round(Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100)))
        const y = Math.round(Math.max(0, Math.min(100, ((me.clientY - rect.top) / rect.height) * 100)))
        onAdjust({ ...adj, x, y })
      }
    }
    function onUp() {
      if (!moved) onPick()
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-gray-400">{label}</label>
      <div
        ref={thumbRef}
        className="w-full relative overflow-hidden border border-dashed border-gray-200 bg-gray-50"
        style={{ aspectRatio: '16/9', cursor: url ? 'crosshair' : 'pointer' }}
        onMouseDown={url ? handleMouseDown : undefined}
        onClick={!url ? onPick : undefined}
      >
        {url ? (
          <>
            <img
              src={url} alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${adj.x}% ${adj.y}%`, display: 'block', userSelect: 'none', pointerEvents: 'none' }}
            />
            {cropSlots && (() => {
              const T = 16 / 9
              return cropSlots.map((slot, idx) => {
                const R = slot.w / slot.h
                const cropW = R >= T ? 100 : (R / T) * 100
                const cropH = R >= T ? (T / R) * 100 : 100
                return (
                  <div key={idx} style={{
                    position: 'absolute',
                    left: `${adj.x - cropW / 2}%`,
                    top: `${adj.y - cropH / 2}%`,
                    width: `${cropW}%`,
                    height: `${cropH}%`,
                    border: '1px dashed rgba(255,255,255,0.55)',
                    boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                  }} />
                )
              })
            })()}
            <div style={{ position: 'absolute', left: `${adj.x}%`, top: `${adj.y}%`, transform: 'translate(-50%,-50%)', width: 10, height: 10, border: '2px solid white', borderRadius: '50%', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 2, pointerEvents: 'none', userSelect: 'none' }}>drag · click to change</div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1">
            <span className="text-lg">+</span>
            <span className="text-[10px]">Add image</span>
          </div>
        )}
      </div>
      {url && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 mr-1">Zoom</span>
          <button onClick={() => onAdjust({ ...adj, zoom: Math.max(0.1, Math.round((adj.zoom - 0.1) * 10) / 10) })} className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-black transition-colors text-xs leading-none">−</button>
          <input
            type="number"
            step="0.01"
            min="0.1"
            max="3"
            value={adj.zoom.toFixed(2)}
            onChange={e => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onAdjust({ ...adj, zoom: Math.min(3, Math.max(0.1, Math.round(v * 100) / 100)) })
            }}
            onBlur={e => {
              const v = parseFloat(e.target.value)
              if (isNaN(v)) onAdjust({ ...adj, zoom: 1 })
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className="w-12 text-[10px] text-gray-500 text-center tabular-nums border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-black"
          />
          <button onClick={() => onAdjust({ ...adj, zoom: Math.min(3, Math.round((adj.zoom + 0.1) * 10) / 10) })} className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-black transition-colors text-xs leading-none">+</button>
          {(adj.x !== 50 || adj.y !== 50 || adj.zoom !== 1) && (
            <button onClick={() => onAdjust({ x: 50, y: 50, zoom: 1 })} className="ml-auto text-[10px] text-gray-300 hover:text-gray-600 transition-colors">reset</button>
          )}
        </div>
      )}
    </div>
  )
}

function SectionAccordion({
  index, patternCount, patterns, isOpen, sData, onToggle, onImagePick, onAdjustChange, onFieldChange, onRemove,
}: {
  index: number
  patternCount: number
  patterns: Pattern[]
  isOpen: boolean
  sData: Partial<Section>
  onToggle: () => void
  onImagePick: (field: string) => void
  onAdjustChange: (field: string, adj: ImageAdjust) => void
  onFieldChange: (field: string, value: string) => void
  onRemove: () => void
}) {
  const pat = patterns[index % patternCount]
  const filled = pat.images.filter(i => sData[i.field]).length
    + pat.texts.filter(t => sData[t.field as keyof Section]).length
  const total = pat.images.length + pat.texts.length
  const num = String(index + 1).padStart(2, '0')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <div className="border-b border-gray-100">
      <button
        className="w-full flex items-center justify-between py-3 text-left group"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-widest text-black">Section {num}</span>
          <span className="ml-2 text-[10px] text-gray-400 truncate">{pat.desc}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-[10px] text-gray-400">{filled}/{total}</span>
          <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="pb-4 space-y-4">
          {pat.images.map(img => {
            const id = sData[img.field] as string | undefined
            const adjField = (img.field + 'Adjust') as keyof Section
            const adj = (sData[adjField] as ImageAdjust | undefined) ?? DEFAULT_ADJUST
            return (
              <ImageAdjustControl
                key={img.field}
                cloudName={cloudName ?? ''}
                imageId={id}
                label={img.label}
                adj={adj}
                onPick={() => onImagePick(img.field)}
                onAdjust={a => onAdjustChange(img.field + 'Adjust', a)}
              />
            )
          })}

          {pat.texts.map(txt => (
            <div key={txt.field} className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400">{txt.label}</label>
              {txt.multiline ? (
                <textarea
                  value={(sData[txt.field as keyof Section] as string) || ''}
                  onChange={e => onFieldChange(txt.field, e.target.value)}
                  className={textareaCls}
                  rows={4}
                />
              ) : (
                <input
                  type="text"
                  value={(sData[txt.field as keyof Section] as string) || ''}
                  onChange={e => onFieldChange(txt.field, e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          ))}

          <button
            onClick={onRemove}
            className="text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
          >
            Remove section
          </button>
        </div>
      )}
    </div>
  )
}

type LayoutProps = {
  data: Partial<TemplateData>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}

type Props = {
  project: FullProject
  patterns: Pattern[]
  Layout: ComponentType<LayoutProps>
  showTitleLight?: boolean
  homepageSlot?: { w: number; h: number } | null
}

export default function TemplateEditor({ project, patterns, Layout, showTitleLight, homepageSlot }: Props) {
  const patternCount = patterns.length

  const [title, setTitle] = useState(project.title)
  const [slug, setSlug] = useState(project.slug)
  const [category, setCategory] = useState<'CULTURE' | 'ADVENTURE' | ''>(
    (project as Record<string, unknown>).category as 'CULTURE' | 'ADVENTURE' | '' ?? ''
  )
  const [templateData, setTemplateData] = useState<Partial<TemplateData>>(() => {
    const raw = project.templateData
      ? (typeof project.templateData === 'string'
          ? JSON.parse(project.templateData)
          : (project.templateData as Record<string, unknown>))
      : {}
    if (raw.sections) return raw as Partial<TemplateData>
    return { ...raw, sections: [] }
  })

  const [openSection, setOpenSection] = useState<string | null>('meta')
  const [pickerTarget, setPickerTarget] = useState<string | null>(null)
  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  function wrapSelection(marker: string) {
    const el = lastFocusedRef.current
    if (!el) return
    if (!(el instanceof HTMLTextAreaElement) && !el.dataset.formattable) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const val = el.value
    const selected = val.slice(start, end)
    if (!selected) return
    const wrapped = `${marker}${selected}${marker}`
    const next = val.slice(0, start) + wrapped + val.slice(end)
    const nativeSet = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value'
    )?.set
    nativeSet?.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
    el.setSelectionRange(start + marker.length, end + marker.length)
  }

  const sections = templateData.sections ?? []

  function setSection(index: number, field: string, value: unknown) {
    setTemplateData(prev => {
      const secs = [...(prev.sections ?? [])]
      secs[index] = { ...(secs[index] ?? {}), [field]: value }
      return { ...prev, sections: secs }
    })
  }

  function addSection() {
    setTemplateData(prev => ({
      ...prev,
      sections: [...(prev.sections ?? []), {}],
    }))
    setOpenSection(`section-${sections.length}`)
  }

  function removeSection(index: number) {
    setTemplateData(prev => {
      const secs = [...(prev.sections ?? [])]
      secs.splice(index, 1)
      return { ...prev, sections: secs }
    })
    setOpenSection(null)
  }

  function setMeta(field: keyof TemplateData, value: unknown) {
    setTemplateData(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    startSave(async () => {
      const res = await updateProject(project.id, { title, slug, templateData, category: category || null })
      if (res?.error) setError(res.error)
      else { setError(null); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    })
  }

  function handlePublishToggle() {
    startPublish(async () => {
      if (project.published) await unpublishProject(project.id)
      else await publishProject(project.id)
    })
  }

  function openPicker(sectionKey: string, field: string) {
    setPickerTarget(`${sectionKey}.${field}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="w-80 flex-shrink-0 border-r border-gray-100 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-black transition-colors">
              ← Projects
            </Link>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
              project.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {project.published ? 'Published' : 'Draft'}
            </span>
          </div>

          {error && <p className="text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded mb-2">{error}</p>}
          {saved && <p className="text-[11px] text-green-600 bg-green-50 px-2 py-1 rounded mb-2">Saved</p>}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={handlePublishToggle} disabled={publishing}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest border transition-colors disabled:opacity-40 ${
                project.published
                  ? 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  : 'border-green-500 text-green-600 hover:bg-green-50'
              }`}>
              {publishing ? '…' : project.published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
          {project.published && (
            <Link href={`/${project.slug}`} target="_blank"
              className="mt-2 block text-center text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              View live ↗
            </Link>
          )}

          {/* ── Bold / Italic toolbar ── */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 mr-2">Format</span>
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); wrapSelection('**') }}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700"
              title="Bold — wrap selection with **"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); wrapSelection('*') }}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors text-sm italic text-gray-700"
              title="Italic — wrap selection with *"
            >
              I
            </button>
            <span className="text-[9px] text-gray-300 ml-2">Select text first</span>
          </div>
        </div>

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="flex-1 px-5 py-4 overflow-y-auto" onFocusCapture={e => {
          const t = e.target
          if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
            lastFocusedRef.current = t
          }
        }}>
          {/* Meta */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between py-3 text-left"
              onClick={() => setOpenSection(openSection === 'meta' ? null : 'meta')}>
              <span className="text-xs font-medium uppercase tracking-widest text-black">Project Info</span>
              <span className="text-gray-400 text-xs">{openSection === 'meta' ? '▲' : '▼'}</span>
            </button>

            {openSection === 'meta' && (
              <div className="pb-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Project Title (internal)</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="My Project" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">URL Slug</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} className={`${inputCls} font-mono text-xs`} placeholder="my-project" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as 'CULTURE' | 'ADVENTURE' | '')}
                    className={`${inputCls} bg-transparent`}
                  >
                    <option value="">None</option>
                    <option value="CULTURE">Culture</option>
                    <option value="ADVENTURE">Adventure</option>
                  </select>
                </div>
                {showTitleLight && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400">Title — light part</label>
                    <input value={(templateData.titleLight as string) || ''} onChange={e => setMeta('titleLight', e.target.value)} className={inputCls} placeholder="The Culture in " />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Title</label>
                  <input data-formattable="" value={(templateData.titleBold as string) || ''} onChange={e => setMeta('titleBold', e.target.value)} className={inputCls} placeholder="Project Title" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Location</label>
                  <input value={(templateData.location as string) || ''} onChange={e => setMeta('location', e.target.value)} className={inputCls} placeholder="City, State" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">GPS Coordinates</label>
                  <input value={(templateData.coordinates as string) || ''} onChange={e => setMeta('coordinates', e.target.value)} className={inputCls} placeholder="12.97°N, 77.59°E" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Camera</label>
                  <input value={(templateData.camera as string) || ''} onChange={e => setMeta('camera', e.target.value)} className={inputCls} placeholder="Camera model" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Podcast Episodes (Spotify)</label>
                  {((templateData.podcastSpotifyUrls as string[]) || []).map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={url}
                        onChange={e => {
                          const urls = [...((templateData.podcastSpotifyUrls as string[]) || [])]
                          urls[i] = e.target.value
                          setMeta('podcastSpotifyUrls', urls)
                        }}
                        className={inputCls}
                        placeholder="https://open.spotify.com/episode/..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const urls = [...((templateData.podcastSpotifyUrls as string[]) || [])]
                          urls.splice(i, 1)
                          setMeta('podcastSpotifyUrls', urls)
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors text-sm flex-shrink-0"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const urls = [...((templateData.podcastSpotifyUrls as string[]) || []), '']
                      setMeta('podcastSpotifyUrls', urls)
                    }}
                    className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
                  >+ Add podcast link</button>
                </div>
                <ImageAdjustControl
                  cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''}
                  imageId={templateData.heroImage}
                  label="Hero Image (1352×671)"
                  adj={(templateData.heroImageAdjust as ImageAdjust | undefined) ?? DEFAULT_ADJUST}
                  onPick={() => openPicker('hero', 'heroImage')}
                  onAdjust={a => setMeta('heroImageAdjust', a)}
                />
                {templateData.heroImage && (
                  <ImageAdjustControl
                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''}
                    imageId={templateData.heroImage}
                    label="Homepage Canvas Crop"
                    adj={(templateData.homepageHeroAdjust as ImageAdjust | undefined) ?? DEFAULT_ADJUST}
                    onPick={() => openPicker('hero', 'heroImage')}
                    onAdjust={a => setMeta('homepageHeroAdjust', a)}
                    cropSlots={homepageSlot ? [homepageSlot] : undefined}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sections */}
          {sections.map((_, i) => (
            <SectionAccordion
              key={i}
              index={i}
              patternCount={patternCount}
              patterns={patterns}
              isOpen={openSection === `section-${i}`}
              sData={sections[i] ?? {}}
              onToggle={() => setOpenSection(openSection === `section-${i}` ? null : `section-${i}`)}
              onImagePick={field => openPicker(String(i), field)}
              onAdjustChange={(field, adj) => setSection(i, field, adj)}
              onFieldChange={(field, value) => setSection(i, field, value)}
              onRemove={() => removeSection(i)}
            />
          ))}

          <div className="pt-4 pb-6">
            <button onClick={addSection}
              className="w-full py-3 border border-dashed border-gray-300 text-[10px] uppercase tracking-widest text-gray-500 hover:border-black hover:text-black transition-colors">
              + Add Section {String(sections.length + 1).padStart(2, '0')}
              {sections.length > 0 && (
                <span className="ml-2 text-gray-400 normal-case tracking-normal">
                  — {patterns[sections.length % patternCount].desc}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-white shadow-xl min-h-screen">
          <Layout
            data={templateData}
            isEditing
            onImageSelect={(sk, field) => openPicker(sk, field)}
          />
        </div>
      </main>

      {pickerTarget && (
        <MediaPicker
          onSelect={asset => {
            if (!pickerTarget) return
            const [sk, field] = pickerTarget.split('.')
            if (sk === 'hero') {
              setMeta('heroImage', asset.cloudinaryId)
            } else {
              setSection(parseInt(sk, 10), field, asset.cloudinaryId)
            }
            setPickerTarget(null)
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}
