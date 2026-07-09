'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type MusicPlayerContextValue = {
  hasStarted: boolean
  start: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // Deferred only when the very first page loaded is the video landing page ('/') —
  // any other entry point (direct link to /home, /about, a project, etc.) starts right away,
  // matching the previous per-page behavior.
  const [hasStarted, setHasStarted] = useState(() => pathname !== '/')

  const start = useCallback(() => setHasStarted(true), [])

  return (
    <MusicPlayerContext.Provider value={{ hasStarted, start }}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
  return ctx
}
