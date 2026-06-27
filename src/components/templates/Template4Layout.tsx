'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { hasContent, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'
export type Template4Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', body2: 'sec1Body2' },
  { image1: 'sec2Image', image2: 'sec2ImageB', image3: 'sec2ImageC', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3' },
  { image1: 'sec3Image', image2: 'sec3ImageB', headline: 'sec3Headline', body1: 'sec3Body1', body3: 'sec3Body3', body5: 'sec3Body5' },
  { image1: 'sec4ImageTall', image2: 'sec4Image', image3: 'sec4ImageC', headline: 'sec4Headline', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3' },
  { image1: 'sec5Image', image2: 'sec5ImageB', headline: 'sec5Headline', body1: 'sec5Body1', body2: 'sec5Body2' },
  { image1: 'sec6Image', image2: 'sec6ImageB', headline: 'sec6Headline', body1: 'sec6Body1', body2: 'sec6Body2' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
  { image1: 'sec9Image', image2: 'sec9ImageB', image3: 'sec9ImageC', headline: 'sec9Headline', body1: 'sec9Body1', body2: 'sec9Body2', body3: 'sec9Body3', body4: 'sec9Body4' },
  { image1: 'sec10Image', image2: 'sec10ImageB', headline: 'sec10Headline', body1: 'sec10Body1', body2: 'sec10Body2', body3: 'sec10Body3' },
  { image1: 'sec11Image', image2: 'sec11ImageB', headline: 'sec11Headline', body1: 'sec11Body1', body2: 'sec11Body2' },
]

function sectionsToFlat(sections: Section[]): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {}
  for (let i = 0; i < sections.length && i < FIELD_MAPS.length; i++) {
    const s = sections[i]
    const map = FIELD_MAPS[i % FIELD_MAPS.length]
    for (const [sectionKey, flatKey] of Object.entries(map)) {
      const val = s[sectionKey as keyof Section]
      if (val) flat[flatKey] = val
    }
  }
  return flat
}

// ─── Canvas constants ─────────────────────────────────────────────────────────

const W = 1504

// Y where each pattern's topmost element begins
const SECTION_STARTS = [1009, 1676, 2556, 3797, 5478, 6277, 6749, 8500, 9800, 10800]

// Vertical slot height of each pattern
const SECTION_HEIGHTS = [667, 801, 814, 873, 832, 823, 500, 1000, 900, 850]

// Where content starts
const CONTENT_TOP = 1009

// Bottom of the deepest element in each pattern at offset=0
const SECTION_CONTENT_BOTTOMS = [1566, 2477, 3270, 4670, 6280, 7030, 7129, 9760, 10600, 11650]

const FOOTER_HEIGHT = 560

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template4Layout({
  data: rawData,
  isEditing = false,
  onImageSelect,
}: {
  data: Partial<Template4Data>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}) {
  const flat = rawData.sections ? sectionsToFlat(rawData.sections) : {}
  const data = { ...rawData, ...flat } as Record<string, string | undefined>
  const rawSections = rawData.sections ?? []
  const activeSections = isEditing
    ? rawSections
    : rawSections.filter(s => hasContent(s))

  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Cumulative Y offset per section index
  function sectionOffset(i: number): number {
    const pat = i % 10
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 10] + sectionOffset(lastIdx)
    : CONTENT_TOP

  const allImageIds = activeSections.flatMap(s =>
    [s.image1, s.image2, s.image3, s.image4].filter((id): id is string => !!id)
  )

  const HEADER_END = 996
  const storyFooterY = lastContentBottom + 60
  const storyCanvasH = storyFooterY + FOOTER_HEIGHT
  const canvasH = viewMode === 'photos' ? HEADER_END : storyCanvasH
  const footerY = storyFooterY

  const sidebarSections = activeSections.map((s, i) => {
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
    return { scrollY: CONTENT_TOP + cumH, headline: s.headline }
  })

  const handleScrollTo = useCallback((y: number) => {
    if (!wrapperRef.current) return
    const wrapperTop = wrapperRef.current.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: wrapperTop + y * scale, behavior: 'smooth' })
  }, [scale])

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current
      if (!el) return
      setScale((el.parentElement?.clientWidth ?? window.innerWidth) / W)
    }
    update()
    const ro = new ResizeObserver(update)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (isEditing) return
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return
      const canvasTop = el.getBoundingClientRect().top
      const pivotY = (window.innerHeight * 0.4 - canvasTop) / scale
      setSidebarVisible(pivotY >= CONTENT_TOP && pivotY <= lastContentBottom)
      let active = 0
      for (let i = 0; i < activeSections.length; i++) {
        let cumH = 0
        for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
        if (CONTENT_TOP + cumH <= pivotY) active = i
      }
      setActiveIdx(active)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scale, isEditing])

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const imgUrl = (id?: string) =>
    id && cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${id}` : ''

  function ImgBox({ id, si, field, l, t, w, h, cap }: {
    id?: string; si: string; field: string; l: number; t: number; w: number; h: number; cap?: string
  }) {
    const url = imgUrl(id)
    return (
      <>
        <div
          style={{
            position: 'absolute', left: l, top: t, width: w, height: h,
            overflow: 'hidden', background: id ? undefined : '#e8e8e8',
            cursor: isEditing ? 'pointer' : undefined,
          }}
          onClick={isEditing ? () => onImageSelect?.(si, field) : undefined}
        >
          {url && <img src={url} alt={cap || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          {isEditing && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#888', fontFamily: 'var(--font-sans, Montserrat)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)')}
            >
              {!url && '+ Image'}
              {url && <span style={{ opacity: 0 }}>Change</span>}
            </div>
          )}
        </div>
        {isEditing && url && (
          <span style={{
            position: 'absolute', left: l + w - 38, top: t + 6,
            background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '2px 6px',
            fontSize: 10, cursor: 'pointer', color: '#333', zIndex: 2,
          }} onClick={() => onImageSelect?.(si, field)}>Change</span>
        )}
      </>
    )
  }

  function SecNum({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 22,
        color: '#ccc', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  function H2({ children, l, t, w = 421 }: { children?: string; l: number; t: number; w?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: 22,
        color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
        whiteSpace: 'pre-wrap',
      }}>{children}</div>
    )
  }

  function P({ children, l, t, w = 220 }: { children?: string; l: number; t: number; w?: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400,
        fontSize: 14, color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children || '')}</div>
    )
  }

  function Quote({ children, l, t, w = 220 }: { children?: string; l: number; t: number; w?: number }) {
    if (!children) return null
    return (
      <div style={{ position: 'absolute', left: l, top: t, width: w }}>
        <svg width="30" height="26" viewBox="0 0 29.773 25.235" style={{ display: 'block', marginBottom: 8 }}>
          <path d="M0 25.235h12.95L19.427 0H6.477L0 25.235zm16.824 0H29.773L29.773 0H16.824L16.824 25.235z" fill="#1c1c1c" />
        </svg>
        <div style={{
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 14,
          color: '#505050', lineHeight: 'normal', textAlign: 'justify',
        }}>{children}</div>
      </div>
    )
  }

  // ─── Render sections ────────────────────────────────────────────────────────

  function renderSection(s: Section, i: number) {
    const off = sectionOffset(i)
    const num = String(i + 1).padStart(2, '0')
    const sk = String(i)
    const pat = i % 10

    switch (pat) {
      case 0: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={1012 + off} w={691} h={554} />
          <SecNum n={num} l={1332} t={1009 + off} />
          <H2 l={964} t={1239 + off} w={399}>{s.headline}</H2>
          <P l={964} t={1364 + off} w={220}>{s.body1}</P>
          <P l={1212} t={1364 + off} w={220}>{s.body2}</P>
        </React.Fragment>
      )
      case 1: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={252} t={1676 + off} w={463} h={454} />
          <SecNum n={num} l={1320} t={1676 + off} />
          <H2 l={730} t={1740 + off} w={466}>{s.headline}</H2>
          <P l={730} t={1840 + off} w={300}>{s.body1}</P>
          <P l={1050} t={1840 + off} w={300}>{s.body2}</P>
          <ImgBox id={s.image3} si={sk} field="image3" l={1213} t={2025 + off} w={223} h={115} />
          <ImgBox id={s.image2} si={sk} field="image2" l={733} t={2160 + off} w={462} h={317} />
          <P l={1213} t={2170 + off} w={223}>{s.body3}</P>
        </React.Fragment>
      )
      case 2: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={2556 + off} w={331} h={671} />
          <SecNum n={num} l={1051} t={2567 + off} />
          <H2 l={621} t={2617 + off} w={453}>{s.headline}</H2>
          <P l={621} t={2758 + off} w={224}>{s.body1}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={1140} t={2758 + off} w={250} h={300} />
          <P l={862} t={2758 + off} w={224}>{s.body3}</P>
          <P l={1140} t={3070 + off} w={250}>{s.body5}</P>
        </React.Fragment>
      )
      case 3: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={3797 + off} w={400} h={380} />
          <SecNum n={num} l={1100} t={3797 + off} />
          <H2 l={700} t={3840 + off} w={480}>{s.headline}</H2>
          <P l={700} t={4000 + off} w={220}>{s.body1}</P>
          <P l={950} t={4000 + off} w={220}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={960} t={4200 + off} w={300} h={200} />
          <ImgBox id={s.image3} si={sk} field="image3" l={254} t={4280 + off} w={420} h={200} />
          <P l={960} t={4420 + off} w={250}>{s.body3}</P>
        </React.Fragment>
      )
      case 4: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={5478 + off} w={300} h={550} />
          <SecNum n={num} l={1020} t={5520 + off} />
          <H2 l={580} t={5520 + off} w={400}>{s.headline}</H2>
          <P l={580} t={5650 + off} w={220}>{s.body1}</P>
          <P l={820} t={5650 + off} w={220}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={1100} t={5780 + off} w={280} h={500} />
        </React.Fragment>
      )
      case 5: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={6277 + off} w={450} h={400} />
          <SecNum n={num} l={1200} t={6277 + off} />
          <H2 l={740} t={6320 + off} w={500}>{s.headline}</H2>
          <P l={740} t={6460 + off} w={220}>{s.body1}</P>
          <P l={990} t={6460 + off} w={220}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={740} t={6750 + off} w={500} h={280} />
        </React.Fragment>
      )
      case 6: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={6749 + off} w={530} h={380} />
          <SecNum n={num} l={1200} t={6749 + off} />
          <H2 l={820} t={6790 + off} w={500}>{s.headline}</H2>
          <P l={820} t={6930 + off} w={220}>{s.body1}</P>
          <P l={1070} t={6930 + off} w={220}>{s.body2}</P>
        </React.Fragment>
      )
      case 7: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={650} t={8500 + off} w={730} h={380} />
          <SecNum n={num} l={560} t={8510 + off} />
          <H2 l={254} t={8550 + off} w={380}>{s.headline}</H2>
          <P l={254} t={8700 + off} w={180}>{s.body1}</P>
          <P l={460} t={8700 + off} w={180}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={254} t={8950 + off} w={200} h={300} />
          <P l={480} t={8960 + off} w={200}>{s.body3}</P>
          <ImgBox id={s.image3} si={sk} field="image3" l={680} t={9100 + off} w={460} h={260} />
          <P l={1180} t={9110 + off} w={200}>{s.body4}</P>
        </React.Fragment>
      )
      case 8: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={9800 + off} w={400} h={500} />
          <SecNum n={num} l={1200} t={9800 + off} />
          <H2 l={690} t={9840 + off} w={500}>{s.headline}</H2>
          <P l={690} t={10000 + off} w={220}>{s.body1}</P>
          <P l={940} t={10000 + off} w={220}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={820} t={10350 + off} w={300} h={250} />
          <P l={1140} t={10350 + off} w={200}>{s.body3}</P>
        </React.Fragment>
      )
      case 9: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={10800 + off} w={400} h={550} />
          <SecNum n={num} l={1200} t={10800 + off} />
          <H2 l={690} t={10840 + off} w={550}>{s.headline}</H2>
          <P l={690} t={11000 + off} w={220}>{s.body1}</P>
          <P l={940} t={11000 + off} w={220}>{s.body2}</P>
          <ImgBox id={s.image2} si={sk} field="image2" l={800} t={11350 + off} w={500} h={300} />
        </React.Fragment>
      )
      default: return null
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div ref={wrapperRef} style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: W, height: canvasH, position: 'relative', background: '#fff',
          transform: `scale(${scale})`, transformOrigin: 'top left',
          fontFamily: 'var(--font-sans, Montserrat)',
        }}>

          {/* ━━ TITLE */}
          <div style={{
            position: 'absolute', left: 80, top: 139,
            fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 40,
            color: '#000', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap',
          }}>
            {renderInlineMarkdown(data.titleBold || 'Project Title')}
          </div>

          {/* ━━ HERO */}
          <ImgBox id={data.heroImage} si="hero" field="heroImage" l={80} t={197} w={1352} h={671} />

          {/* ━━ METADATA BAR */}
          <div style={{
            position: 'absolute', left: 80, top: 879, width: 795,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16, lineHeight: 'normal',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#ccc' }}>Location:</span>
              <span style={{ color: '#000' }}>{data.location || ''}</span>
            </div>
            <span style={{ color: '#ccc' }}>{data.coordinates || ''}</span>
            <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <span style={{ color: '#ccc' }}>Camera -</span>
              <span style={{ color: '#000' }}>{data.camera || ''}</span>
            </div>
          </div>

          {/* ━━ SECONDARY NAV */}
          <div style={{
            position: 'absolute', left: 0, top: 921, width: W,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, height: 75,
          }}>
            <span onClick={() => setViewMode('photos')} style={{
              fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
              textTransform: 'uppercase', cursor: 'pointer',
              color: viewMode === 'photos' ? '#1c1c1c' : '#ccc',
            }}>Photos</span>
            <div style={{ height: 31, width: 1, background: '#1c1c1c' }} />
            <span onClick={() => setViewMode('story')} style={{
              fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
              textTransform: 'uppercase', cursor: 'pointer',
              color: viewMode === 'story' ? '#1c1c1c' : '#ccc',
            }}>Story</span>
          </div>

          {/* ━━ STORY CONTENT */}
          {viewMode === 'story' && (
            <>
              {activeSections.map((s, i) => renderSection(s, i))}
              <CanvasFooter
                footerY={footerY}
                markOffset={136}
                canvasWidth={W}
                nextProjectSlug={data.nextProjectSlug}
                destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []}
              />
            </>
          )}

        </div>
      </div>

      {viewMode === 'photos' && (
        <CanvasPhotosView
          imageIds={allImageIds}
          nextProject={data.nextProjectSlug ? { slug: data.nextProjectSlug, title: '' } : null}
          destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []}
        />
      )}

      {!isEditing && viewMode === 'story' && (
        <CanvasSidebar
          visible={sidebarVisible}
          activeIdx={activeIdx}
          sections={sidebarSections}
          scale={scale}
          onScrollTo={handleScrollTo}
        />
      )}
    </>
  )
}
