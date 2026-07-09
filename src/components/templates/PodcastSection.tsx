type Props = {
  urls: string[]
  compact?: boolean
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname !== 'open.spotify.com') return url
    const path = u.pathname.replace('/embed/', '/')
    return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`
  } catch {
    return url
  }
}

export default function PodcastSection({ urls, compact }: Props) {
  const valid = urls.filter(Boolean)
  if (valid.length === 0) return null

  return (
    <div style={{ background: '#fff', padding: compact ? '32px 24px' : '48px 88px' }}>
      {valid.map((url, i) => (
        <iframe
          key={i}
          src={toEmbedUrl(url)}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ display: 'block', marginTop: i > 0 ? 16 : 0 }}
        />
      ))}
    </div>
  )
}
