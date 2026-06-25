import Link from 'next/link'
import TakeMeElsewhere from './TakeMeElsewhere'

type Props = {
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}

export default function SiteFooter({ nextProject, destinations = [] }: Props) {
  return (
    <footer className="pt-24 pb-10">
      <div className="relative mb-16 px-6 md:px-20" style={{ height: 20 }}>
        <TakeMeElsewhere
          destinations={destinations}
          className="absolute left-1/2 -translate-x-1/2 top-0 hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}
        />
        {nextProject && (
          <Link
            href={`/${nextProject.slug}`}
            className="absolute right-6 md:right-20 top-0 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}>
              Next project
            </span>
            <span style={{ color: '#1c1c1c', fontSize: 10 }}>▶</span>
          </Link>
        )}
      </div>

      <img
        src="/t1-wordmark.svg"
        alt=".elsewhere"
        className="w-full block"
      />

      <div className="flex items-center justify-between px-6 md:px-20 mt-16">
        <div className="flex items-center gap-10 text-[var(--color-ink)]">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-60 transition-opacity">
            <img src="/t1-instagram.svg" alt="Instagram" width={20} height={20} className="block" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="hover:opacity-60 transition-opacity">
            <img src="/t1-twitter.svg" alt="X / Twitter" width={20} height={20} className="block" />
          </a>
        </div>
        <p className="text-base text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans, Montserrat)' }}>@Copywrite</p>
      </div>
    </footer>
  )
}
