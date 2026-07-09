'use client'

import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'
import FooterBase from '@/components/public/FooterBase'

type Props = {
  nextProjectSlug?: string
  destinations?: { slug: string }[]
}

export default function CanvasFooter({ nextProjectSlug, destinations = [] }: Props) {
  return (
    <div style={{ background: '#fff' }}>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 88px 0',
      }}>
        <TakeMeElsewhere
          destinations={destinations}
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700,
            fontSize: 16, color: '#ccc', textTransform: 'uppercase',
          }}
        />
        {nextProjectSlug && (
          <a href={`/${nextProjectSlug}`} style={{
            position: 'absolute', right: 88,
            display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
          }}>
            <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}>
              Next project
            </span>
            <span style={{ color: '#1c1c1c', fontSize: 10 }}>▶</span>
          </a>
        )}
      </div>
      <FooterBase
        wordmarkHeight={242}
        rowStyle={{ marginTop: 48, paddingLeft: 88, paddingRight: 88 }}
      />
    </div>
  )
}
