'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Data type ────────────────────────────────────────────────────────────────

import { hasContent, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasPhotosView from './CanvasPhotosView'
import CanvasSidebar from './CanvasSidebar'
export type Template3Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', quote: 'sec1Quote', body2: 'sec1Body2', quote2: 'sec1Quote2', body3: 'sec1Body3' },
  { image1: 'sec2Image', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3', body4: 'sec2Body4' },
  { image1: 'sec3Image', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2' },
  { image1: 'sec4ImageTall', headline: 'sec4Headline', quote: 'sec4Quote', body1: 'sec4Body1', body2: 'sec4Body2' },
  { image2: 'sec5ImagePortrait', headline: 'sec5Headline', quote: 'sec5Quote', body3: 'sec5Body3', body4: 'sec5Body4' },
  { image1: 'sec6Image', headline: 'sec6Headline', quote: 'sec6Quote', body2: 'sec6Body2', body3: 'sec6Body3', body4: 'sec6Body4' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
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

// ─── Canvas constants (W=1512) ───────────────────────────────────────────────

const W = 1512

// Y where each pattern's topmost element begins (absolute in the original canvas)
const SECTION_STARTS = [1009, 1568, 2773, 3387, 4042, 4687, 5341]

// Vertical slot height of each pattern
const SECTION_HEIGHTS = [561, 900, 857, 1100, 658, 900, 600]

// Where content starts (top of first pattern's slot)
const CONTENT_TOP = 1009

// Bottom of the deepest element in each pattern at offset=0
const SECTION_CONTENT_BOTTOMS = [1570, 2220, 3630, 4250, 4700, 5370, 6100]

const F_NAV    = 0
const F_MARK   = 200
const FOOTER_HEIGHT = 560

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template3Layout({
  data: rawData,
  isEditing = false,
  onImageSelect,
}: {
  data: Partial<Template3Data>
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
    const pat = i % 7
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 7] + sectionOffset(lastIdx)
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
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
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
        for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
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
              {url ? <span style={{ color: '#fff', fontSize: 11 }}>Change</span> : <span>+ Image</span>}
            </div>
          )}
        </div>
        {cap && (
          <div style={{
            position: 'absolute', left: l + 31, top: t + h + 4,
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800,
            fontSize: 14, color: '#1c1c1c', textTransform: 'uppercase',
          }}>{cap}</div>
        )}
      </>
    )
  }

  function SecNum({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 28,
        color: '#ccc', textTransform: 'uppercase', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  function H2({ children, l, t, w = 421, size = 22 }: { children?: string; l: number; t: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: size,
        color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
        whiteSpace: 'pre-wrap',
      }}>{children}</div>
    )
  }

  function P({ children, l, t, w = 220, size = 14 }: { children?: string; l: number; t: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: size,
        color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children)}</div>
    )
  }


  return (
    <>
      <div
        ref={wrapperRef}
        style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{
          width: W, height: canvasH, position: 'relative', background: '#fff',
          transform: `scale(${scale})`, transformOrigin: 'top left',
          fontFamily: 'var(--font-sans, Montserrat)',
        }}>

          {/* ━━ TITLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div style={{
            position: 'absolute', left: 80, top: 139,
            fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 40,
            color: '#000', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap',
          }}>
            {renderInlineMarkdown(data.titleBold || 'Project Title')}
          </div>

          {/* ━━ HERO IMAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <ImgBox id={data.heroImage} si="hero" field="heroImage" l={80} t={197} w={1352} h={671} />

          {/* ━━ METADATA BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div style={{
            position: 'absolute', left: 80, top: 879, width: 795,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#ccc' }}>Location:</span>
              <span style={{ color: '#000' }}>{data.location || ''}</span>
            </div>
            <span style={{ color: '#ccc' }}>{data.coordinates || ''}</span>
            <div style={{ display: 'flex', gap: 11 }}>
              <span style={{ color: '#ccc' }}>Camera -</span>
              <span style={{ color: '#000' }}>{data.camera || ''}</span>
            </div>
          </div>

          {/* ━━ SECONDARY NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div style={{
            position: 'absolute', left: 0, top: 921, width: W,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, height: 75,
          }}>
            <span onClick={() => setViewMode('photos')} style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', color: viewMode === 'photos' ? '#1c1c1c' : '#ccc', cursor: 'pointer' }}>Photos</span>
            <div style={{ height: 31, width: 1, background: '#1c1c1c' }} />
            <span onClick={() => setViewMode('story')} style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', color: viewMode === 'story' ? '#1c1c1c' : '#ccc', cursor: 'pointer' }}>Story</span>
          </div>

          {viewMode === 'story' && (
            <>
              {activeSections.map((s, i) => {
                const off = sectionOffset(i)
                const num = String(i + 1).padStart(2, '0')
                const sk = String(i)
                const pat = i % 7
                switch (pat) {
                  case 0: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={250} t={1009 + off} w={590} h={540} />
                      <SecNum n={num} l={1400} t={1009 + off} />
                      <H2 l={880} t={1050 + off} w={550}>{s.headline}</H2>
                      <P l={880} t={1180 + off} w={550}>{s.quote}</P>
                      <P l={880} t={1290 + off} w={260}>{s.body1}</P>
                      <P l={1170} t={1290 + off} w={260}>{s.body2}</P>
                      <P l={880} t={1450 + off} w={550}>{s.body3}</P>
                    </React.Fragment>
                  )
                  case 1: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={770} t={1720 + off} />
                      <ImgBox id={s.image1} si={sk} field="image1" l={820} t={1640 + off} w={560} h={480} />
                      <H2 l={254} t={1760 + off} w={450}>{s.headline}</H2>
                      <P l={254} t={1880 + off} w={220}>{s.body1}</P>
                      <P l={503} t={1880 + off} w={220}>{s.body2}</P>
                      <P l={254} t={2100 + off} w={220}>{s.body3}</P>
                      <P l={503} t={2100 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 2: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={2773 + off} w={1126} h={500} />
                      <SecNum n={num} l={1350} t={3320 + off} />
                      <H2 l={810} t={3360 + off} w={500}>{s.headline}</H2>
                      <P l={810} t={3480 + off} w={220}>{s.body1}</P>
                      <P l={1060} t={3480 + off} w={220}>{s.body2}</P>
                    </React.Fragment>
                  )
                  case 3: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={3387 + off} w={520} h={620} />
                      <SecNum n={num} l={1350} t={3800 + off} />
                      <H2 l={810} t={3840 + off} w={500}>{s.headline}</H2>
                      <P l={810} t={3950 + off} w={458}>{s.quote}</P>
                      <P l={810} t={4100 + off} w={220}>{s.body1}</P>
                      <P l={1060} t={4100 + off} w={220}>{s.body2}</P>
                    </React.Fragment>
                  )
                  case 4: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image2} si={sk} field="image2" l={620} t={4042 + off} w={760} h={480} />
                      <SecNum n={num} l={500} t={4150 + off} />
                      <H2 l={260} t={4190 + off} w={340}>{s.headline}</H2>
                      <P l={260} t={4370 + off} w={340}>{s.quote}</P>
                      <P l={260} t={4550 + off} w={220}>{s.body3}</P>
                      <P l={510} t={4550 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 5: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={4687 + off} w={620} h={480} />
                      <SecNum n={num} l={1350} t={4800 + off} />
                      <H2 l={910} t={4840 + off} w={460}>{s.headline}</H2>
                      <P l={910} t={4970 + off} w={460}>{s.quote}</P>
                      <P l={254} t={5220 + off} w={220}>{s.body2}</P>
                      <P l={504} t={5220 + off} w={220}>{s.body3}</P>
                      <P l={754} t={5220 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 6: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={700} t={5341 + off} />
                      <ImgBox id={s.image1} si={sk} field="image1" l={780} t={5341 + off} w={600} h={450} />
                      <H2 l={254} t={5380 + off} w={500}>{s.headline}</H2>
                      <P l={254} t={5520 + off} w={220}>{s.body1}</P>
                      <P l={504} t={5520 + off} w={220}>{s.body2}</P>
                    </React.Fragment>
                  )
                  default: return null
                }
              })}

              <CanvasFooter
                footerY={footerY + F_NAV}
                markOffset={F_MARK}
                canvasWidth={W}
                nextProjectSlug={data.nextProjectSlug}
                destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []}
              />
            </>
          )}

        </div>
      </div>

      {viewMode === 'photos' && (
        <CanvasPhotosView imageIds={allImageIds} nextProject={data.nextProjectSlug ? { slug: data.nextProjectSlug, title: '' } : null} destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []} />
      )}

      {/* ━━ SIDEBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
