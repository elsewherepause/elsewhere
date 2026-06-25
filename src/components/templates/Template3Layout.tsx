'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Data type ────────────────────────────────────────────────────────────────

import { type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasPhotosView from './CanvasPhotosView'
import CanvasSidebar from './CanvasSidebar'
export type Template3Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', quote: 'sec1Quote', body2: 'sec1Body2', quote2: 'sec1Quote2', body3: 'sec1Body3' },
  { image1: 'sec2Image', image2: 'sec2ImageB', image3: 'sec2ImageC' },
  { image1: 'sec3ImageSmall', image2: 'sec3Image', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2', quote: 'sec3Quote', body3: 'sec3Body3' },
  { image1: 'sec4ImageTall', image2: 'sec4Image', headline: 'sec4Headline', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3', quote: 'sec4Quote' },
  { image1: 'sec5Image', headline: 'sec5Headline', body1: 'sec5Body1', headline2: 'sec5Headline2', body2: 'sec5Body2', body3: 'sec5Body3', body4: 'sec5Body4' },
  { image1: 'sec6Image', image2: 'sec6ImageB', headline: 'sec6Headline', body1: 'sec6Body1', body2: 'sec6Body2' },
  { image1: 'sec7Image', image2: 'sec7ImageWide', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2', body3: 'sec7Body3', body4: 'sec7Body4', body5: 'sec7Body5', body6: 'sec7Body6' },
  { headline: 'sec8Headline', body1: 'sec8Body1', body2: 'sec8Body2', body3: 'sec8Body3', body4: 'sec8Body4' },
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

// ─── Canvas constants (W=1512, H=7176) ───────────────────────────────────────

const W = 1512
const H = 7360

const SECTION_STARTS = [1009, 1568, 2773, 3387, 4042, 4687, 5341, 5965]

const FOOTER_Y = 6805
const F_NAV    = 0
const F_MARK   = 200

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
  const sectionCount = rawData.sections?.length ?? 0
  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const allImageIds = [
    data.sec1Image, data.sec2Image, data.sec2ImageB, data.sec2ImageC,
    data.sec3ImageSmall, data.sec3Image, data.sec4ImageTall, data.sec4Image,
    data.sec5Image, data.sec6Image, data.sec6ImageB, data.sec7Image, data.sec7ImageWide,
  ].filter((id): id is string => !!id)

  const HEADER_END = 996
  const effectiveH = viewMode === 'photos' ? HEADER_END : H

  const SECTION_HEADINGS = [
    data.sec1Headline?.slice(0, 50) || 'Section 01',
    'Section 02',
    data.sec3Headline?.slice(0, 50) || 'Section 03',
    data.sec4Headline?.slice(0, 50) || 'Section 04',
    data.sec5Headline?.slice(0, 50) || 'Section 05',
    data.sec6Headline?.slice(0, 50) || 'Section 06',
    data.sec7Headline?.slice(0, 50) || 'Section 07',
    data.sec8Headline?.slice(0, 50) || 'Section 08',
  ]

  const sidebarSections = SECTION_STARTS.map((y, i) => ({
    scrollY: y,
    headline: SECTION_HEADINGS[i],
  }))

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

  function H2({ children, l, t, w = 421, size = 22 }: { children?: string; l: number; t: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: size,
        color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
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
            fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 700, fontSize: 40,
            color: '#000', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap',
          }}>
            {data.titleBold || 'Project Title'}
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
              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 1 — image left, text right
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 0 && <>
              <ImgBox id={data.sec1Image} si="0" field="image1" l={80} t={1009} w={760} h={540} />
              <SecNum n="01" l={1400} t={1009} />
              <H2 l={880} t={1050} w={550}>{data.sec1Headline}</H2>
              <Quote l={880} t={1180} w={550}>{data.sec1Quote}</Quote>
              <P l={880} t={1290} w={260}>{data.sec1Body1}</P>
              <P l={1170} t={1290} w={260}>{data.sec1Body2}</P>
              <P l={880} t={1450} w={550}>{data.sec1Body3}</P>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 2 — multiple portraits (image-only)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 1 && <>
              <SecNum n="02" l={1150} t={1632} />
              <ImgBox id={data.sec2Image} si="1" field="image1" l={254} t={1568} w={695} h={492} />
              <ImgBox id={data.sec2ImageC} si="1" field="image3" l={1240} t={1962} w={193} h={354} />
              <ImgBox id={data.sec2ImageB} si="1" field="image2" l={254} t={2107} w={487} h={575} />
              <ImgBox id={data.sec3ImageSmall} si="2" field="image1" l={995} t={2328} w={193} h={354} />
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 3 — landscape image, text left
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 2 && <>
              <ImgBox id={data.sec3Image} si="2" field="image2" l={748} t={2773} w={684} h={520} />
              <SecNum n="03" l={686} t={2885} />
              <H2 l={255} t={2940} w={448}>{data.sec3Headline}</H2>
              <P l={255} t={3060} w={220}>{data.sec3Body1}</P>
              <P l={255} t={3111} w={432}>{data.sec3Body2}</P>
              <Quote l={255} t={3150} w={432}>{data.sec3Quote}</Quote>
              <P l={476} t={3264} w={220}>{data.sec3Body3}</P>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 4 — portraits, text
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 3 && <>
              <ImgBox id={data.sec4ImageTall} si="3" field="image1" l={248} t={3387} w={499} h={616} />
              <SecNum n="04" l={1187} t={3438} />
              <H2 l={766} t={3438} w={308}>{data.sec4Headline}</H2>
              <P l={766} t={3513} w={220}>{data.sec4Body1}</P>
              <P l={1017} t={3513} w={220}>{data.sec4Body2}</P>
              <ImgBox id={data.sec4Image} si="3" field="image2" l={748} t={4042} w={685} h={589} />
              <P l={766} t={3723} w={220}>{data.sec4Body3}</P>
              <Quote l={766} t={3800} w={458}>{data.sec4Quote}</Quote>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 5 — text + image
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 4 && <>
              <SecNum n="05" l={682} t={4264} />
              <H2 l={260} t={4299} w={347}>{data.sec5Headline}</H2>
              <P l={963} t={4300} w={220}>{data.sec5Body1}</P>
              <H2 l={963} t={4440} w={215}>{data.sec5Headline2}</H2>
              <P l={963} t={4527} w={220}>{data.sec5Body2}</P>
              <ImgBox id={data.sec5Image} si="4" field="image1" l={260} t={4687} w={469} h={334} />
              <P l={260} t={5069} w={220}>{data.sec5Body3}</P>
              <P l={260} t={5169} w={220}>{data.sec5Body4}</P>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 6 — portraits + text
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 5 && <>
              <SecNum n="06" l={1075} t={5063} />
              <ImgBox id={data.sec6Image} si="5" field="image1" l={1139} t={5063} w={293} h={456} />
              <H2 l={260} t={5063} w={220}>{data.sec6Headline}</H2>
              <P l={889} t={5063} w={220}>{data.sec6Body1}</P>
              <ImgBox id={data.sec6ImageB} si="5" field="image2" l={260} t={5341} w={469} h={178} />
              <P l={260} t={5169} w={600}>{data.sec6Body2}</P>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 7 — portraits + text
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 6 && <>
              <SecNum n="07" l={692} t={5535} />
              <ImgBox id={data.sec7Image} si="6" field="image1" l={1139} t={5616} w={293} h={262} />
              <H2 l={261} t={5574} w={467}>{data.sec7Headline}</H2>
              <P l={260} t={5640} w={220}>{data.sec7Body1}</P>
              <P l={519} t={5640} w={220}>{data.sec7Body2}</P>
              <P l={260} t={5810} w={220}>{data.sec7Body3}</P>
              <P l={815} t={5810} w={220}>{data.sec7Body4}</P>
              <ImgBox id={data.sec7ImageWide} si="6" field="image2" l={261} t={5965} w={688} h={589} />
              <P l={260} t={6594} w={220}>{data.sec7Body5}</P>
              <P l={519} t={6594} w={220}>{data.sec7Body6}</P>
              </>}

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  SECTION 8 — text + conclusion
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              {sectionCount > 7 && <>
              <SecNum n="08" l={1394} t={6115} />
              <H2 l={963} t={6158} w={421}>{data.sec8Headline}</H2>
              <P l={963} t={6243} w={220}>{data.sec8Body1}</P>
              <P l={1210} t={6243} w={220}>{data.sec8Body2}</P>
              <P l={963} t={6445} w={220}>{data.sec8Body3}</P>
              <P l={1210} t={6445} w={220}>{data.sec8Body4}</P>
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
