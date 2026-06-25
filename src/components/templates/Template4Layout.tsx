'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'

export type Template4Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', quote: 'sec1Quote', body2: 'sec1Body2', quote2: 'sec1Quote2', body3: 'sec1Body3' },
  { image1: 'sec2Image', image2: 'sec2ImageB', image3: 'sec2ImageC', image4: 'sec3ImageSmall', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3' },
  { image1: 'sec3Image', image2: 'sec3ImageB', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2', quote: 'sec3Quote', body3: 'sec3Body3', body4: 'sec3Body4', body5: 'sec3Body5', body6: 'sec3Body6' },
  { image1: 'sec4ImageTall', image2: 'sec4Image', headline: 'sec4Headline', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3', quote: 'sec4Quote', body4: 'sec4Body4' },
  { image1: 'sec5Image', headline: 'sec5Headline', body1: 'sec5Body1', body2: 'sec5Body2', body3: 'sec5Body3' },
  { image1: 'sec6Image', image2: 'sec6ImageB', headline: 'sec6Headline', body1: 'sec6Body1' },
  { image1: 'sec7Image', image2: 'sec7ImageWide', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2', body3: 'sec7Body3' },
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

const W = 1504
const H = 9200
const SECTION_STARTS = [1009, 2037, 3694, 4247, 5478, 6277, 6749, 7734]
const FOOTER_Y = 8288

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
  const sectionCount = rawData.sections?.length ?? 0

  const allImageIds = [
    data.sec1Image, data.sec2Image, data.sec2ImageB, data.sec2ImageC,
    data.sec3ImageSmall, data.sec3Image, data.sec3ImageB,
    data.sec4ImageTall, data.sec4Image, data.sec5Image,
    data.sec6Image, data.sec6ImageB, data.sec7Image, data.sec7ImageWide,
  ].filter((id): id is string => !!id)

  const HEADER_END = 996

  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const effectiveH = viewMode === 'photos' ? HEADER_END : H

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

  function ImgBox({ id, si, field, l, t, w, h }: {
    id?: string; si: string; field: string; l: number; t: number; w: number; h: number
  }) {
    const url = imgUrl(id)
    return (
      <div
        style={{
          position: 'absolute', left: l, top: t, width: w, height: h,
          overflow: 'hidden', background: id ? undefined : '#e8e8e8',
          cursor: isEditing ? 'pointer' : undefined,
        }}
        onClick={isEditing ? () => onImageSelect?.(si, field) : undefined}
      >
        {url && <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
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
    )
  }

  function SecNum({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 28,
        color: '#ccc', textTransform: 'uppercase',
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
      }}>{children}</div>
    )
  }

  function P({ children, l, t, w = 220 }: { children?: string; l: number; t: number; w?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 14,
        color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children)}</div>
    )
  }

  function Quote({ children, l, t, w = 432 }: { children?: string; l: number; t: number; w?: number }) {
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
      <div ref={wrapperRef} style={{ width: '100%', height: effectiveH * scale, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: W, height: effectiveH, position: 'relative', background: '#fff',
          transform: `scale(${scale})`, transformOrigin: 'top left',
          fontFamily: 'var(--font-sans, Montserrat)',
        }}>

          {/* ━━ TITLE */}
          <div style={{
            position: 'absolute', left: 80, top: 139,
            fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 700, fontSize: 40,
            color: '#000', textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap',
          }}>
            {data.titleBold || 'Project Title'}
          </div>

          {/* ━━ HERO */}
          <ImgBox id={data.heroImage} si="hero" field="heroImage" l={80} t={197} w={1352} h={671} />

          {/* ━━ METADATA */}
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

          {/* ━━ SECONDARY NAV */}
          <div style={{
            position: 'absolute', left: 0, top: 921, width: W,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, height: 75,
          }}>
            <span
              onClick={() => setViewMode('photos')}
              style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', color: viewMode === 'photos' ? '#1c1c1c' : '#ccc', cursor: 'pointer' }}
            >Photos</span>
            <div style={{ height: 31, width: 1, background: '#1c1c1c' }} />
            <span
              onClick={() => setViewMode('story')}
              style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', color: viewMode === 'story' ? '#1c1c1c' : '#ccc', cursor: 'pointer' }}
            >Story</span>
          </div>

          {viewMode === 'story' && (
            <>
              {/* ━━━━ SECTION 1 — image left, text right */}
              {sectionCount > 0 && <>
              <ImgBox id={data.sec1Image} si="0" field="image1" l={254} t={1012} w={691} h={554} />
              <SecNum n="01" l={1332} t={1009} />
              <H2 l={964.33} t={1239.12} w={398.58}>{data.sec1Headline}</H2>
              <P l={964.33} t={1364.48} w={220}>{data.sec1Body1}</P>
              <P l={1212.49} t={1364.48} w={220}>{data.sec1Body2}</P>
              </>}
              {/* ━━━━ SECTION 2 — images + text */}
              {sectionCount > 1 && <>
              <ImgBox id={data.sec2Image} si="1" field="image1" l={252} t={1676} w={463} h={454} />
              <SecNum n="02" l={1320} t={1676} />
              <H2 l={730} t={1740} w={466}>{data.sec2Headline}</H2>
              <P l={730} t={1840} w={300}>{data.sec2Body1}</P>
              <P l={1050} t={1840} w={300}>{data.sec2Body2}</P>
              <ImgBox id={data.sec2ImageC} si="1" field="image3" l={1213} t={2025} w={223} h={115} />
              <ImgBox id={data.sec2ImageB} si="1" field="image2" l={733} t={2160} w={462} h={317} />
              <P l={1213} t={2170} w={223}>{data.sec2Body3}</P>
              </>}

              {/* ━━━━ SECTION 3 — landscape + text */}
              {sectionCount > 2 && <>
              <ImgBox id={data.sec3Image} si="2" field="image1" l={254} t={2556} w={331} h={671} />
              <SecNum n="03" l={1051} t={2567.13} />
              <H2 l={621} t={2617.37} w={452.64}>{data.sec3Headline}</H2>
              <P l={621} t={2758.5} w={224}>{data.sec3Body1}</P>
              <P l={621} t={2989.73} w={224}>{data.sec3Body2}</P>
              <Quote l={1086} t={3096.73} w={324}>{data.sec3Quote}</Quote>
              <P l={862} t={2757.5} w={224}>{data.sec3Body3}</P>
              <P l={862} t={2900} w={224}>{data.sec3Body4}</P>
              </>}

              {/* ━━━━ SECTION 4 — two portraits + text */}
              {sectionCount > 3 && <>
              <ImgBox id={data.sec4ImageTall} si="3" field="image1" l={248} t={4197} w={499} h={616} />
              <SecNum n="04" l={1181} t={4247} />
              <H2 l={763} t={4247} w={308}>{data.sec4Headline}</H2>
              <P l={763} t={4323} w={220}>{data.sec4Body1}</P>
              <P l={1011} t={4323} w={220}>{data.sec4Body2}</P>
              <P l={763} t={4533} w={392}>{data.sec4Body3}</P>
              <Quote l={1086} t={3096.73} w={324}>{data.sec4Quote}</Quote>
              <P l={862} t={2873.73} w={224}>{data.sec4Body4}</P>
              <ImgBox id={data.sec4Image} si="3" field="image2" l={744} t={4852} w={685} h={589} />
              </>}

              {/* ━━━━ SECTION 5 — headline + image + text */}
              {sectionCount > 4 && <>
              <SecNum n="05" l={679} t={5478} />
              <H2 l={259} t={5514} w={347}>{data.sec5Headline}</H2>
              <P l={259} t={5589} w={220}>{data.sec5Body1}</P>
              <P l={498} t={5589} w={220}>{data.sec5Body2}</P>
              <P l={259} t={5684} w={220}>{data.sec5Body3}</P>
              <ImgBox id={data.sec5Image} si="4" field="image1" l={258} t={5901} w={469} h={334} />
              </>}

              {/* ━━━━ SECTION 6 — portrait + strip + text */}
              {sectionCount > 5 && <>
              <SecNum n="06" l={1070} t={6277} />
              <ImgBox id={data.sec6Image} si="5" field="image1" l={1132} t={6277} w={293} h={456} />
              <H2 l={884} t={6326} w={220}>{data.sec6Headline}</H2>
              <P l={884} t={6396} w={220}>{data.sec6Body1}</P>
              <ImgBox id={data.sec6ImageB} si="5" field="image2" l={258} t={6555} w={469} h={178} />
              </>}

              {/* ━━━━ SECTION 7 — portrait + wide + text */}
              {sectionCount > 6 && <>
              <SecNum n="07" l={689} t={6749} />
              <P l={884} t={6579} w={220}>{data.sec7Body3}</P>
              <H2 l={260} t={6789} w={467}>{data.sec7Headline}</H2>
              <ImgBox id={data.sec7Image} si="6" field="image1" l={1132} t={6830} w={293} h={262} />
              <P l={260} t={6830} w={220}>{data.sec7Body1}</P>
              <P l={499} t={6830} w={220}>{data.sec7Body2}</P>
              <ImgBox id={data.sec7ImageWide} si="6" field="image2" l={259} t={7584} w={688} h={589} />
              </>}

              {/* ━━━━ SECTION 8 — closing text */}
              {sectionCount > 7 && <>
              <SecNum n="08" l={1387} t={7734} />
              <H2 l={958} t={7777} w={421}>{data.sec8Headline}</H2>
              <P l={958} t={7864} w={220}>{data.sec8Body1}</P>
              <P l={1201} t={7864} w={220}>{data.sec8Body2}</P>
              <P l={958} t={7998} w={220}>{data.sec8Body3}</P>
              <P l={1201} t={8032} w={220}>{data.sec8Body4}</P>
              </>}

              {/* ━━ FOOTER */}
              <CanvasFooter
                footerY={FOOTER_Y}
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
        <CanvasPhotosView imageIds={allImageIds} nextProject={data.nextProjectSlug ? { slug: data.nextProjectSlug, title: '' } : null} destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []} />
      )}

      {/* ━━ SIDEBAR */}
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
