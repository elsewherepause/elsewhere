'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'

const CANVAS_W = 3200
const CANVAS_H = 900
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const SLOTS = [
  { l: 80,    t: 160, w: 280, h: 140 },
  { l: 80,    t: 440, w: 260, h: 260 },
  { l: 480,   t: 560, w: 190, h: 260 },
  { l: 600,   t: 300, w: 160, h: 200 },
  { l: 900,   t: 150, w: 380, h: 220 },
  { l: 1120,  t: 480, w: 220, h: 280 },
  { l: 1550,  t: 270, w: 340, h: 200 },
  { l: 1680,  t: 590, w: 300, h: 180 },
  { l: 2150,  t: 180, w: 200, h: 340 },
  { l: 2450,  t: 520, w: 320, h: 230 },
  { l: 2850,  t: 150, w: 250, h: 240 },
]

const CATEGORIES = ['CULTURE', 'ADVENTURE'] as const
type Category = typeof CATEGORIES[number]

export type HomeProject = {
  slug: string
  title: string
  heroImageId: string | null
  category?: Category | null
}

export default function HomeCanvas({ projects, destinations = [] }: { projects: HomeProject[]; destinations?: { slug: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<Category>>(new Set())

  useEffect(() => {
    const update = () => setScale(window.innerHeight / CANVAS_H)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = scrollRef.current
    if (!el) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  function toggleFilter(cat: Category) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const filtered = useMemo(() => {
    if (activeFilters.size === 0) return projects
    return projects.filter(p => p.category && activeFilters.has(p.category))
  }, [projects, activeFilters])

  const font = 'Montserrat, sans-serif'

  return (
    <div
      ref={scrollRef}
      className="w-screen h-screen overflow-x-auto overflow-y-hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div style={{
        width: CANVAS_W * scale,
        height: CANVAS_H * scale,
      }}>
        <div style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: 'relative',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: '#fff',
        }}>

          {/* ── Filter bar ── */}
          <div style={{ position: 'absolute', left: 80, top: 100, display: 'flex', alignItems: 'center', gap: 48 }}>
            <p
              onClick={() => setFilterOpen(v => !v)}
              style={{
                fontFamily: font, fontSize: 16, textTransform: 'uppercase', margin: 0,
                cursor: 'pointer',
                fontWeight: filterOpen ? 700 : 400,
                color: filterOpen ? '#1c1c1c' : '#ccc',
                transition: 'color 0.2s, font-weight 0.2s',
              }}
            >
              filter
            </p>

            {filterOpen && (
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                {CATEGORIES.map(cat => {
                  const isActive = activeFilters.has(cat)
                  return (
                    <p
                      key={cat}
                      onClick={() => toggleFilter(cat)}
                      style={{
                        fontFamily: font, fontSize: 16, textTransform: 'uppercase', margin: 0,
                        cursor: 'pointer',
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? '#1c1c1c' : '#ccc',
                        transition: 'color 0.2s, font-weight 0.2s',
                      }}
                    >
                      {cat}
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Photo slots ── */}
          {SLOTS.map((slot, i) => {
            const project = filtered[i]
            if (!project) return null

            const imgId = project.heroImageId
            const url = imgId && CLOUD
              ? `https://res.cloudinary.com/${CLOUD}/image/upload/w_${slot.w * 2},h_${slot.h * 2},c_fill,q_auto,f_auto/${imgId}`
              : null

            return (
              <Link
                key={i}
                href={`/${project.slug}`}
                style={{
                  position: 'absolute', left: slot.l, top: slot.t,
                  width: slot.w, height: slot.h,
                  overflow: 'hidden', background: 'transparent',
                  display: 'block', textDecoration: 'none',
                }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </Link>
            )
          })}

        </div>
      </div>

      {/* ── Take me elsewhere CTA (fixed center) ── */}
      <TakeMeElsewhere
        destinations={destinations}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 40,
          transform: 'translateX(-50%)',
          fontFamily: font,
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#ccc',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      />
    </div>
  )
}
