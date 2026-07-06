'use client'

import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'
import FooterBase from '@/components/public/FooterBase'

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

      <div style={{ position: 'absolute', left: 0, top: footerY + markOffset, width: canvasWidth }}>
        <FooterBase
          wordmarkHeight={242}
          rowStyle={{ marginTop: 48, paddingLeft: 88, paddingRight: 88 }}
        />
      </div>
    </>
  )
}
