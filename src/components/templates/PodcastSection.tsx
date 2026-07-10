'use client'

import { useEffect, useRef } from 'react'
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider'

type Props = {
  urls: string[]
  compact?: boolean
}

type SpotifyPlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean } }
type SpotifyController = {
  addListener: (event: 'playback_update', cb: (e: SpotifyPlaybackUpdate) => void) => void
}
type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void
    SpotifyIframeAPILoaded?: boolean
  }
}

const SPOTIFY_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

function loadSpotifyIframeApi(onReady: (api: SpotifyIFrameAPI) => void) {
  const prevReady = window.onSpotifyIframeApiReady
  window.onSpotifyIframeApiReady = (api) => {
    prevReady?.(api)
    onReady(api)
  }

  if (document.querySelector(`script[src="${SPOTIFY_API_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = SPOTIFY_API_SRC
  script.async = true
  document.body.appendChild(script)
}

function toSpotifyUri(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== 'open.spotify.com') return null
    const [type, id] = u.pathname.replace(/^\/embed\//, '/').split('/').filter(Boolean)
    if (!type || !id) return null
    return `spotify:${type}:${id}`
  } catch {
    return null
  }
}

function PodcastEmbed({ url, marginTop, onPlay }: { url: string; marginTop: number; onPlay: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uri = toSpotifyUri(url)
    const el = containerRef.current
    if (!uri || !el) return

    let cancelled = false
    loadSpotifyIframeApi((api) => {
      if (cancelled) return
      api.createController(el, { uri, width: '100%', height: 152 }, (controller) => {
        controller.addListener('playback_update', (e) => {
          if (!e.data.isPaused) onPlay()
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [url, onPlay])

  return <div ref={containerRef} style={{ marginTop }} />
}

export default function PodcastSection({ urls, compact }: Props) {
  const valid = urls.filter(Boolean)
  const { requestPause } = useMusicPlayer()
  if (valid.length === 0) return null

  return (
    <div style={{ background: '#fff', padding: compact ? '32px 24px' : '48px 88px 48px 250px' }}>
      {valid.map((url, i) => (
        <PodcastEmbed key={url} url={url} marginTop={i > 0 ? 16 : 0} onPlay={requestPause} />
      ))}
    </div>
  )
}
