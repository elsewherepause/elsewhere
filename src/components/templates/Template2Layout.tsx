'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'

export type Template2Data = TemplateData

// Field mappings: section index → flat key mappings
const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', quote: 'sec1Quote', body1: 'sec1Body1', body2: 'sec1Body2', body3: 'sec1Body3', quote2: 'sec1Quote2' },
  { image1: 'sec2Image1', image2: 'sec2Image2', image3: 'sec2Image3', image4: 'sec2Image4', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3', quote: 'sec2Quote', body4: 'sec2Body4' },
  { image1: 'sec3Image', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2', quote: 'sec3Quote', body3: 'sec3Body3' },
  { image1: 'sec4Image', headline: 'sec4Headline', quote: 'sec4Quote', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3', body4: 'sec4Body4' },
  { image1: 'sec5Image', image2: 'sec5Image2', headline: 'sec5Headline', body1: 'sec5Body1', quote: 'sec5Quote', body2: 'sec5Body2', body3: 'sec5Body3' },
  { image1: 'sec6Image', image2: 'sec6Image2', headline: 'sec6Headline', body1: 'sec6Body1', body2: 'sec6Body2' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
  { image1: 'sec8Image', headline: 'sec8Headline', body1: 'sec8Body1', body2: 'sec8Body2', body3: 'sec8Body3', body4: 'sec8Body4' },
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

// ─── Canvas constants (W=1512, H=7446) ───────────────────────────────────────

const W = 1512
const H = 7600

const SECTION_STARTS = [1009, 1559, 2794, 3696, 4263, 5062, 5340, 5964]

const FOOTER_Y = 7042
const F_NAV = 0
const F_MARK = 200

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
  const sectionCount = rawData.sections?.length ?? 0
  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const SECTION_HEADINGS = [
    data.sec1Headline?.slice(0, 50) || 'Section 01',
    data.sec2Headline?.slice(0, 50) || 'Section 02',
    data.sec3Headline?.slice(0, 50) || 'Section 03',
    data.sec4Headline?.slice(0, 50) || 'Section 04',
    data.sec5Headline?.slice(0, 50) || 'Section 05',
    data.sec6Headline?.slice(0, 50) || 'Section 06',
    data.sec7Headline?.slice(0, 50) || 'Section 07',
    data.sec8Headline?.slice(0, 50) || 'Section 08',
  ]

  const allImageIds = [
    data.sec1Image, data.sec2Image1, data.sec2Image2, data.sec2Image3, data.sec2Image4,
    data.sec3Image, data.sec4Image, data.sec5Image, data.sec5Image2,
    data.sec6Image, data.sec6Image2, data.sec7Image, data.sec8Image,
  ].filter((id): id is string => !!id)

  const HEADER_END = 996
  const effectiveH = viewMode === 'photos' ? HEADER_END : H

  const handleScrollTo = useCallback((y: number) => {
    if (isEditing && wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: y * scale, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: y * scale, behavior: 'smooth' })
    }
  }, [isEditing, scale])

  const sidebarSections = SECTION_STARTS.map((y, i) => ({
    scrollY: y,
    headline: SECTION_HEADINGS[i],
  }))

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
      setSidebarVisible(pivotY >= SECTION_STARTS[0] && pivotY <= FOOTER_Y)
      let active = 0
      for (let i = 0; i < SECTION_STARTS.length; i++) {
        if (SECTION_STARTS[i] <= pivotY) active = i
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
        style={{ width: '100%', height: effectiveH * scale, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{
          width: W, height: effectiveH, position: 'relative', background: '#fff',
          transform: `scale(${scale})`, transformOrigin: 'top left',
          fontFamily: 'var(--font-sans, Montserrat)',
        }}>

          {/* ━━ TITLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div style={{
            position: 'absolute', left: 80, top: 139,
            fontFamily: 'var(--font-serif, DM Sans)', fontSize: 40,
            color: '#000', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap',
          }}>
            {(data.titleLight || data.titleBold) ? (
              <>
                <span style={{ fontWeight: 400 }}>{data.titleLight || ''}</span>
                <span style={{ fontWeight: 700 }}>{data.titleBold || ''}</span>
              </>
            ) : (
              <span style={{ fontWeight: 700, color: '#ccc' }}>Project Title</span>
            )}
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
          {sectionCount > 0 && <>
          <ImgBox id={data.sec1Image} si="0" field="image1" l={259} t={1009} w={648} h={416} />
          <SecNum n="01" l={1359} t={1009} />
          <div style={{ position: 'absolute', left: 928, top: 1050, width: 432, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <H2 w={432}>{data.sec1Headline}</H2>
            <P w={432}>{data.sec1Body1}</P>
            <Quote w={432}>{data.sec1Quote}</Quote>
            <P w={432}>{data.sec1Body2}</P>
            <Quote w={432}>{data.sec1Quote2}</Quote>
          </div>
          <div style={{ position: 'absolute', left: 928, top: 1425, width: 220 }}>
            <P w={220}>{data.sec1Body3}</P>
          </div>
          </>}

          {sectionCount > 1 && <>
          <ImgBox id={data.sec2Image1} si="1" field="image1" l={253} t={1569} w={695} h={492} />
          <SecNum n="02" l={1350} t={1560} />
          <H2 l={961} t={1697} w={215}>{data.sec2Headline}</H2>
          <P l={961} t={1766} w={220}>{data.sec2Body1}</P>
          <ImgBox id={data.sec2Image3} si="1" field="image3" l={1234} t={1962} w={193} h={354} />
          <P l={963} t={1962} w={220}>{data.sec2Body2}</P>
          <ImgBox id={data.sec2Image2} si="1" field="image2" l={253} t={2108} w={487} h={575} />
          <ImgBox id={data.sec2Image4} si="1" field="image4" l={991} t={2328} w={193} h={354} />
          <P l={754} t={2480} w={220}>{data.sec2Body3}</P>
          </>}

          {sectionCount > 2 && <>
          <SecNum n="03" l={683} t={2885} />
          <H2 l={253} t={2940} w={448}>{data.sec3Headline}</H2>
          <P l={253} t={3018} w={220}>{data.sec3Body1}</P>
          <div style={{ position: 'absolute', left: 253, top: 3111, width: 432, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <P w={432}>{data.sec3Body2}</P>
            <Quote w={432}>{data.sec3Quote}</Quote>
          </div>
          <P l={463} t={3262} w={220}>{data.sec3Body3}</P>
          <ImgBox id={data.sec3Image} si="2" field="image1" l={745} t={2773} w={684} h={520} />
          </>}

          {sectionCount > 3 && <>
          <ImgBox id={data.sec4Image} si="3" field="image1" l={248} t={3387} w={499} h={616} />
          <H2 l={763} t={3438} w={308}>{data.sec4Headline}</H2>
          <SecNum n="04" l={1181} t={3438} />
          <P l={763} t={3513} w={220}>{data.sec4Body1}</P>
          <P l={1012} t={3513} w={220}>{data.sec4Body2}</P>
          <div style={{ position: 'absolute', left: 763, top: 3723, width: 458, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <P w={458}>{data.sec4Body3}</P>
            <Quote w={458}>{data.sec4Quote}</Quote>
          </div>
          <P l={1012} t={3859} w={220}>{data.sec4Body4}</P>
          </>}

          {sectionCount > 4 && <>
          <SecNum n="05" l={678.6} t={4263.62} />
          <H2 l={258.58} t={4299.32} w={347.31}>{data.sec5Headline}</H2>
          <P l={258.58} t={4375} w={220}>{data.sec5Body1}</P>
          <P l={497.6} t={4375} w={220}>{data.sec5Body2}</P>
          <P l={258.58} t={4469.83} w={220}>{data.sec5Body3}</P>
          <ImgBox id={data.sec5Image} si="4" field="image1" l={744} t={4042.16} w={685} h={589} />
          <ImgBox id={data.sec5Image2} si="4" field="image2" l={258.58} t={4686.66} w={469} h={334} />
          </>}

          {sectionCount > 5 && <>
          <ImgBox id={data.sec6Image} si="5" field="image1" l={1132} t={5062.66} w={293} h={456} />
          <SecNum n="06" l={1075} t={5062.66} />
          <H2 l={884.36} t={5111.17} w={220}>{data.sec6Headline}</H2>
          <P l={884.36} t={5181.68} w={220}>{data.sec6Body1}</P>
          <P l={884.36} t={5364.66} w={220}>{data.sec6Body2}</P>
          <ImgBox id={data.sec6Image2} si="5" field="image2" l={1132} t={5615.92} w={293} h={262} />
          </>}

          {sectionCount > 6 && <>
          <ImgBox id={data.sec7Image} si="6" field="image1" l={258.58} t={5340.66} w={469} h={178} />
          <SecNum n="07" l={688.58} t={5534.99} />
          <H2 l={259.42} t={5574.21} w={467.34}>{data.sec7Headline}</H2>
          <P l={259.42} t={5615.92} w={220}>{data.sec7Body1}</P>
          <P l={498.44} t={5615.92} w={220}>{data.sec7Body2}</P>
          </>}

          {sectionCount > 7 && <>
          <ImgBox id={data.sec8Image} si="7" field="image1" l={259.42} t={5964.66} w={688} h={589} />
          <SecNum n="08" l={1387.58} t={6115.21} />
          <H2 l={958.42} t={6158.06} w={420.93}>{data.sec8Headline}</H2>
          <P l={958.42} t={6244.3} w={220}>{data.sec8Body1}</P>
          <P l={958.42} t={6378.61} w={220}>{data.sec8Body2}</P>
          <P l={1200.92} t={6244.3} w={220}>{data.sec8Body3}</P>
          <P l={1200.92} t={6413.11} w={220}>{data.sec8Body4}</P>
          </>}

          {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <CanvasFooter
            footerY={FOOTER_Y + F_NAV}
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
