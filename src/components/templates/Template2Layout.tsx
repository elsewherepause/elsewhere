'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { hasContent, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'

export type Template2Data = TemplateData

// Field mappings: section index → flat key mappings
const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', body3: 'sec1Body3' },
  { image1: 'sec2Image1', image2: 'sec2Image2', image3: 'sec2Image3', image4: 'sec2Image4', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3', quote: 'sec2Quote', body4: 'sec2Body4' },
  { image1: 'sec3Image', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2', body3: 'sec3Body3' },
  { image1: 'sec4Image', headline: 'sec4Headline', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3', body4: 'sec4Body4' },
  { image1: 'sec5Image', image2: 'sec5Image2', headline: 'sec5Headline', body1: 'sec5Body1', body2: 'sec5Body2' },
  { image1: 'sec6Image', image2: 'sec6Image2', headline: 'sec6Headline', body1: 'sec6Body1' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
  { image1: 'sec8Image', headline: 'sec8Headline', body1: 'sec8Body1', body3: 'sec8Body3' },
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

const W = 1512

const SECTION_STARTS = [1009, 1559, 2773, 3387, 4042, 5062, 5340, 5964]
const SECTION_HEIGHTS = [550, 1124, 639, 622, 979, 278, 656, 730]
const CONTENT_TOP = 1009
const SECTION_CONTENT_BOTTOMS = [1575, 2683, 3412, 4009, 5021, 5878, 5766, 6394]

const F_NAV = 0
const F_MARK = 200
const FOOTER_HEIGHT = 560

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template2Layout({
  data: rawData,
  isEditing = false,
  onImageSelect,
}: {
  data: Partial<Template2Data>
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

  function sectionOffset(i: number): number {
    const pat = i % 8
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 8]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 8] + sectionOffset(lastIdx)
    : CONTENT_TOP

  const allImageIds = activeSections.flatMap(s =>
    [s.image1, s.image2, s.image3, s.image4].filter((id): id is string => !!id)
  )

  const HEADER_END = 996
  const storyFooterY = lastContentBottom + 60
  const storyCanvasH = storyFooterY + FOOTER_HEIGHT
  const canvasH = viewMode === 'photos' ? HEADER_END : storyCanvasH
  const footerY = storyFooterY

  const handleScrollTo = useCallback((y: number) => {
    if (!wrapperRef.current) return
    const wrapperTop = wrapperRef.current.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: wrapperTop + y * scale, behavior: 'smooth' })
  }, [scale])

  const sidebarSections = activeSections.map((s, i) => {
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 8]
    return { scrollY: CONTENT_TOP + cumH, headline: s.headline }
  })

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
        for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 8]
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

  function H2({ children, l, t, w = 421, size = 22 }: { children?: string; l?: number; t?: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        ...(l !== undefined && t !== undefined ? { position: 'absolute', left: l, top: t } : { position: 'relative' }),
        width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: size,
        color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
        whiteSpace: 'pre-wrap',
      }}>{children}</div>
    )
  }

  function P({ children, l, t, w = 220, size = 14 }: { children?: string; l?: number; t?: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        ...(l !== undefined && t !== undefined ? { position: 'absolute', left: l, top: t } : { position: 'relative' }),
        width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: size,
        color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children)}</div>
    )
  }

  function Quote({ children, l, t, w = 395 }: { children?: string; l?: number; t?: number; w?: number }) {
    if (!children) return null
    return (
      <div style={{
        ...(l !== undefined && t !== undefined ? { position: 'absolute', left: l, top: t } : { position: 'relative' }),
        width: w
      }}>
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
            fontFamily: 'var(--font-serif, DM Sans)', fontSize: 40,
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
            <span
              onClick={() => setViewMode('photos')}
              style={{
                fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
                textTransform: 'uppercase', cursor: 'pointer',
                color: viewMode === 'photos' ? '#1c1c1c' : '#ccc',
              }}
            >Photos</span>
            <div style={{ height: 31, width: 1, background: '#1c1c1c' }} />
            <span
              onClick={() => setViewMode('story')}
              style={{
                fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
                textTransform: 'uppercase', cursor: 'pointer',
                color: viewMode === 'story' ? '#1c1c1c' : '#ccc',
              }}
            >Story</span>
          </div>

          {viewMode === 'story' && (
            <>
              {activeSections.map((s, i) => {
                const off = sectionOffset(i)
                const num = String(i + 1).padStart(2, '0')
                const sk = String(i)
                const pat = i % 8
                switch (pat) {
                  case 0: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={259} t={1009 + off} w={648} h={416} />
                      <SecNum n={num} l={1359} t={1009 + off} />
                      <div style={{ position: 'absolute', left: 928, top: 1050 + off, width: 432, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <H2 w={432}>{s.headline}</H2>
                        <P w={432}>{s.body1}</P>
                      </div>
                      <div style={{ position: 'absolute', left: 928, top: 1425 + off, width: 220 }}>
                        <P w={220}>{s.body3}</P>
                      </div>
                    </React.Fragment>
                  )
                  case 1: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={253} t={1569 + off} w={695} h={492} />
                      <SecNum n={num} l={1350} t={1560 + off} />
                      <H2 l={961} t={1697 + off} w={215}>{s.headline}</H2>
                      <P l={961} t={1766 + off} w={220}>{s.body1}</P>
                      <ImgBox id={s.image3} si={sk} field="image3" l={1234} t={1962 + off} w={193} h={354} />
                      <P l={963} t={1962 + off} w={220}>{s.body2}</P>
                      <ImgBox id={s.image2} si={sk} field="image2" l={253} t={2108 + off} w={487} h={575} />
                      <ImgBox id={s.image4} si={sk} field="image4" l={991} t={2328 + off} w={193} h={354} />
                      <P l={754} t={2480 + off} w={220}>{s.body3}</P>
                    </React.Fragment>
                  )
                  case 2: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={683} t={2885 + off} />
                      <H2 l={253} t={2940 + off} w={448}>{s.headline}</H2>
                      <P l={253} t={3018 + off} w={220}>{s.body1}</P>
                      <div style={{ position: 'absolute', left: 253, top: 3111 + off, width: 432 }}>
                        <P w={432}>{s.body2}</P>
                      </div>
                      <P l={463} t={3262 + off} w={220}>{s.body3}</P>
                      <ImgBox id={s.image1} si={sk} field="image1" l={745} t={2773 + off} w={684} h={520} />
                    </React.Fragment>
                  )
                  case 3: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={248} t={3387 + off} w={499} h={616} />
                      <H2 l={763} t={3438 + off} w={308}>{s.headline}</H2>
                      <SecNum n={num} l={1181} t={3438 + off} />
                      <P l={763} t={3513 + off} w={220}>{s.body1}</P>
                      <P l={1012} t={3513 + off} w={220}>{s.body2}</P>
                      <P l={763} t={3723 + off} w={458}>{s.body3}</P>
                      <P l={1012} t={3859 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 4: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={679} t={4264 + off} />
                      <H2 l={259} t={4299 + off} w={347}>{s.headline}</H2>
                      <P l={259} t={4375 + off} w={220}>{s.body1}</P>
                      <P l={498} t={4375 + off} w={220}>{s.body2}</P>
                      <ImgBox id={s.image1} si={sk} field="image1" l={744} t={4042 + off} w={685} h={589} />
                      <ImgBox id={s.image2} si={sk} field="image2" l={259} t={4687 + off} w={469} h={334} />
                    </React.Fragment>
                  )
                  case 5: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={1132} t={5063 + off} w={293} h={456} />
                      <SecNum n={num} l={1075} t={5063 + off} />
                      <H2 l={884} t={5111 + off} w={220}>{s.headline}</H2>
                      <P l={884} t={5182 + off} w={220}>{s.body1}</P>
                      <ImgBox id={s.image2} si={sk} field="image2" l={1132} t={5616 + off} w={293} h={262} />
                    </React.Fragment>
                  )
                  case 6: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={259} t={5341 + off} w={469} h={178} />
                      <SecNum n={num} l={689} t={5535 + off} />
                      <H2 l={259} t={5574 + off} w={467}>{s.headline}</H2>
                      <P l={259} t={5616 + off} w={220}>{s.body1}</P>
                      <P l={498} t={5616 + off} w={220}>{s.body2}</P>
                    </React.Fragment>
                  )
                  case 7: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={259} t={5965 + off} w={688} h={589} />
                      <SecNum n={num} l={1388} t={6115 + off} />
                      <H2 l={958} t={6158 + off} w={421}>{s.headline}</H2>
                      <P l={958} t={6244 + off} w={220}>{s.body1}</P>
                      <P l={1201} t={6244 + off} w={220}>{s.body3}</P>
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

      {/* ━━ SIDEBAR (public mode only) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
