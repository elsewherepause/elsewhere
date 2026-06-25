'use client'

import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'

type Props = {
  footerY: number
  markOffset: number
  canvasWidth: number
  nextProjectSlug?: string
  destinations?: { slug: string }[]
}

export default function CanvasFooter({ footerY, markOffset, canvasWidth, nextProjectSlug, destinations = [] }: Props) {
  return (
    <>
      <TakeMeElsewhere
        destinations={destinations}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: footerY,
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase',
        }}
      />
      {nextProjectSlug && (
        <a href={`/${nextProjectSlug}`} style={{
          position: 'absolute', right: 88, top: footerY,
          display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}>
            Next project
          </span>
          <span style={{ color: '#1c1c1c', fontSize: 10 }}>▶</span>
        </a>
      )}

      <img
        src="/t1-wordmark.svg"
        alt=".elsewhere"
        style={{ position: 'absolute', left: 0, top: footerY + markOffset, width: canvasWidth, height: 242, display: 'block' }}
      />

      <div style={{
        position: 'absolute', left: 88, top: footerY + markOffset + 290, width: canvasWidth - 176,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <img src="/t1-instagram.svg" alt="Instagram" width={20} height={20} style={{ display: 'block' }} />
          <img src="/t1-twitter.svg" alt="X / Twitter" width={20} height={20} style={{ display: 'block' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16, color: '#000' }}>
          @Copywrite
        </span>
      </div>
    </>
  )
}
