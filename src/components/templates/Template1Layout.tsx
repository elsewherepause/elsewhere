'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { hasContent, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'

export type T1Section = Section
export type Template1Data = TemplateData

// ─── Canvas constants ─────────────────────────────────────────────────────────

const W = 1512

// Y where each pattern's topmost element begins (absolute in the original 8900px canvas)
const SECTION_STARTS = [1012, 1587, 2062, 3280, 3923, 4548, 5193, 6038, 6471, 7152, 7823]

// Vertical slot height of each pattern (start[i+1] - start[i]; last pattern ends at footer y=8357)
const SECTION_HEIGHTS = [575, 475, 1218, 643, 625, 645, 845, 433, 681, 671, 534]

// Where content starts (top of first pattern's slot)
const CONTENT_TOP = 1012

// Bottom of the deepest element (image + caption, or text) in each pattern at offset=0
// Used to place the footer below the actual last element, not just the slot boundary
const SECTION_CONTENT_BOTTOMS = [1560, 2300, 3250, 3860, 4520, 5160, 6030, 6410, 7070, 7740, 8320]

// Footer internal offsets relative to footer start y (original positions: 8357, 8555, 8797)
const F_NAV  = 0    // "Take me elsewhere" row
const F_MARK = 198  // wordmark SVG
const F_SOC  = 440  // social bar
const FOOTER_HEIGHT = 560

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  data: Partial<Template1Data>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template1Layout({ data, isEditing, onImageSelect }: Props) {
  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current
      if (!el) return
      const avail = el.parentElement?.clientWidth ?? window.innerWidth
      setScale(avail / W)
    }
    update()
    const ro = new ResizeObserver(update)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  // Normalize: support legacy s01-s11 keys from old data saved before this refactor
  const rawData = data as Partial<Template1Data> & Record<string, unknown>
  const sections: T1Section[] = rawData.sections
    ?? (['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11'] as const)
        .map(k => rawData[k] as T1Section | undefined)
        .filter((s): s is T1Section => !!s)

  // In public mode only render sections that have content
  const activeSections = isEditing
    ? sections
    : sections.filter(s => hasContent(s))

  // Cumulative Y offset per section index
  function sectionOffset(i: number): number {
    const pat = i % 11
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 11]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 11] + sectionOffset(lastIdx)
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
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 11]
    return { scrollY: CONTENT_TOP + cumH, headline: s.headline }
  })

  // Track which section is in the viewport (public mode only)
  useEffect(() => {
    if (isEditing || activeSections.length === 0) return
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return
      const canvasTop = el.getBoundingClientRect().top
      const pivotY = (window.innerHeight * 0.4 - canvasTop) / scale

      // Footer start: deepest content of last section + gap
      const lastI = activeSections.length - 1
      let cumOff = 0
      for (let j = 0; j < lastI; j++) cumOff += SECTION_HEIGHTS[j % 11]
      const fY = lastI >= 0
        ? SECTION_CONTENT_BOTTOMS[lastI % 11] + ((CONTENT_TOP + cumOff) - SECTION_STARTS[lastI % 11]) + 60
        : CONTENT_TOP

      // Sidebar only visible while pivot is inside the sections zone
      setSidebarVisible(pivotY >= CONTENT_TOP && pivotY <= fY)

      let active = 0
      let cumH2 = 0
      for (let i = 0; i < activeSections.length; i++) {
        if (CONTENT_TOP + cumH2 <= pivotY) active = i
        cumH2 += SECTION_HEIGHTS[i % 11]
      }
      setActiveIdx(active)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeSections.length, scale, isEditing])

  const d = data
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const imgUrl = (id?: string) =>
    id && cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${id}` : ''

  // ─── Sub-components ───────────────────────────────────────────────────────

  function ImgBox({ id, sk, field, l, t, w, h, cap }: {
    id?: string; sk: string; field: string
    l: number; t: number; w: number; h: number
    cap?: string
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
          onClick={isEditing ? () => onImageSelect?.(sk, field) : undefined}
        >
          {url && <img src={url} alt={cap || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          {isEditing && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#888', fontFamily: 'var(--font-sans, Montserrat)',
                transition: 'background 0.15s',
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
            fontSize: 14, color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
          }}>
            {cap}
          </div>
        )}
      </>
    )
  }

  function Num({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400,
        fontSize: 28, color: '#ccc', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  function H2({ children, l, t, w = 421 }: { children?: string; l: number; t: number; w?: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500,
        fontSize: 22, color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
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

  // ─── Section renderer — pattern cycles every 11 ──────────────────────────

  function renderSection(s: T1Section, i: number) {
    const pat = i % 11
    const off = sectionOffset(i)
    const num = String(i + 1).padStart(2, '0')
    const sk = String(i)

    switch (pat) {
      case 0: return (
        <React.Fragment key={i}>
          <Num n={num} l={1404} t={1203 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={254} t={1012 + off} w={691} h={520} />
          <H2 l={964} t={1239 + off} w={399}>{s.headline}</H2>
          <P l={964} t={1364 + off}>{s.body1}</P>
          <P l={1212} t={1364 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 1: return (
        <React.Fragment key={i}>
          <Num n={num} l={923} t={1587 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={253} t={1604 + off} w={469} h={311} />
          <ImgBox id={s.image2} sk={sk} field="image2" cap={s.caption2} l={996} t={1916 + off} w={193} h={354} />
          <H2 l={738} t={1651 + off}>{s.headline}</H2>
          <P l={738} t={1720 + off}>{s.body1}</P>
          <P l={1212} t={1916 + off}>{s.body3}</P>
        </React.Fragment>
      )
      case 2: return (
        <React.Fragment key={i}>
          <Num n={num} l={686} t={2898 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={254} t={2062 + off} w={494} h={575} />
          <ImgBox id={s.image2} sk={sk} field="image2" cap={s.caption2} l={996} t={2283 + off} w={193} h={354} />
          <ImgBox id={s.image3} sk={sk} field="image3" cap={s.caption3} l={748} t={2702 + off} w={684} h={520} />
          <H2 l={254} t={2953 + off} w={421}>{s.headline}</H2>
          <P l={254} t={3038 + off}>{s.body1}</P>
          <P l={503} t={3038 + off}>{s.body2}</P>
          <P l={766} t={2380 + off}>{s.body4}</P>
        </React.Fragment>
      )
      case 3: return (
        <React.Fragment key={i}>
          <Num n={num} l={1014} t={3416 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={248} t={3280 + off} w={499} h={554} />
          <H2 l={766} t={3434 + off} w={248}>{s.headline}</H2>
          <P l={766} t={3519 + off}>{s.body1}</P>
          <P l={1005} t={3519 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 4: return (
        <React.Fragment key={i}>
          <Num n={num} l={756} t={3923 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={254} t={3923 + off} w={478} h={575} />
          <ImgBox id={s.image2} sk={sk} field="image2" cap={s.caption2} l={1006} t={4043 + off} w={193} h={354} />
          <H2 l={756} t={3975 + off} w={220}>{s.headline}</H2>
          <P l={756} t={4100 + off} w={220}>{s.body1}</P>
          <P l={1211} t={4260 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 5: return (
        <React.Fragment key={i}>
          <Num n={num} l={685} t={4732 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={732} t={4548 + off} w={694} h={589} />
          <H2 l={254} t={4775 + off} w={421}>{s.headline}</H2>
          <P l={254} t={4881 + off}>{s.body1}</P>
          <P l={493} t={4881 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 6: return (
        <React.Fragment key={i}>
          <Num n={num} l={1070} t={5578 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={253} t={5193 + off} w={469} h={334} />
          <ImgBox id={s.image2} sk={sk} field="image2" cap={s.caption2} l={1133} t={5569 + off} w={293} h={456} />
          <ImgBox id={s.image3} sk={sk} field="image3" cap={s.caption3} l={253} t={5847 + off} w={469} h={178} />
          <H2 l={883} t={5626 + off} w={220}>{s.headline}</H2>
          <P l={883} t={5720 + off}>{s.body1}</P>
          <P l={883} t={5954 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 7: return (
        <React.Fragment key={i}>
          <Num n={num} l={686} t={6038 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={1133} t={6117 + off} w={293} h={262} />
          <H2 l={254} t={6081 + off} w={467}>{s.headline}</H2>
          <P l={254} t={6187 + off}>{s.body1}</P>
          <P l={493} t={6187 + off}>{s.body2}</P>
          <P l={254} t={6330 + off}>{s.body3}</P>
        </React.Fragment>
      )
      case 8: return (
        <React.Fragment key={i}>
          <Num n={num} l={1388} t={6490 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={254} t={6471 + off} w={688} h={589} />
          <H2 l={957} t={6533 + off} w={421}>{s.headline}</H2>
          <P l={957} t={6619 + off}>{s.body1}</P>
          <P l={1196} t={6619 + off}>{s.body2}</P>
          <P l={957} t={6785 + off}>{s.body3}</P>
        </React.Fragment>
      )
      case 9: return (
        <React.Fragment key={i}>
          <Num n={num} l={1229} t={7152 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={254} t={7152 + off} w={484} h={575} />
          <H2 l={754} t={7210 + off} w={504}>{s.headline}</H2>
          <P l={754} t={7351 + off}>{s.body1}</P>
          <P l={998} t={7351 + off}>{s.body2}</P>
          <P l={754} t={7396 + off}>{s.body3}</P>
        </React.Fragment>
      )
      case 10: return (
        <React.Fragment key={i}>
          <Num n={num} l={1233} t={7830 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" cap={s.caption1} l={512} t={7823 + off} w={227} h={487} />
          <H2 l={787} t={7895 + off}>{s.headline}</H2>
          <P l={787} t={7988 + off}>{s.body1}</P>
          <P l={1031} t={7988 + off}>{s.body2}</P>
          <P l={787} t={8158 + off}>{s.body3}</P>
        </React.Fragment>
      )
      default: return null
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        width: W, height: canvasH,
        position: 'relative', background: '#fff',
        transform: `scale(${scale})`, transformOrigin: 'top left',
        fontFamily: 'var(--font-sans, Montserrat)',
      }}>

        {/* ━━━ TITLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          position: 'absolute', left: 80, top: 139,
          fontFamily: 'var(--font-serif, DM Sans)', fontSize: 40,
          color: '#000', textTransform: 'uppercase', lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}>
          {(() => {
            const title = d?.titleBold || 'Project Title';
            const splitIdx = title.indexOf(',');
            if (splitIdx === -1) return <span style={{ fontWeight: 700 }}>{title}</span>;
            return (
              <>
                <span style={{ fontWeight: 700 }}>{title.substring(0, splitIdx + 1)}</span>
                <span style={{ fontWeight: 400 }}>{title.substring(splitIdx + 1)}</span>
              </>
            );
          })()}
        </div>

        {/* ━━━ HERO IMAGE — 1352 × 671 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <ImgBox id={d?.heroImage} sk="hero" field="heroImage" l={80} t={197} w={1352} h={671} />

        {/* ━━━ METADATA BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          position: 'absolute', left: 80, top: 879,
          width: 795, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16,
          lineHeight: 'normal',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#ccc' }}>Location:</span>
            <span style={{ color: '#000' }}>{d?.location || '—'}</span>
          </div>
          <span style={{ color: '#ccc' }}>{d?.coordinates || '—'}</span>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <span style={{ color: '#ccc' }}>Camera -</span>
            <span style={{ color: '#000' }}>{d?.camera || '—'}</span>
          </div>
        </div>

        {/* ━━━ SECONDARY NAV (Photos / Story) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          position: 'absolute', left: 0, top: 921, width: W,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, height: 75,
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

        {/* ━━━ STORY CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === 'story' && (
          <>
            {activeSections.map((s, i) => renderSection(s, i))}
            <CanvasFooter
              footerY={footerY + F_NAV}
              markOffset={F_MARK}
              canvasWidth={W}
              nextProjectSlug={d?.nextProjectSlug}
              destinations={(d as Record<string, unknown>)?.destinations as { slug: string }[] ?? []}
            />
          </>
        )}

      </div>
    </div>

    {viewMode === 'photos' && (
      <CanvasPhotosView imageIds={allImageIds} nextProject={d?.nextProjectSlug ? { slug: d.nextProjectSlug, title: '' } : null} destinations={(d as Record<string, unknown>)?.destinations as { slug: string }[] ?? []} />
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
