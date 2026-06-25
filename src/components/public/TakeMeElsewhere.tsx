'use client'

import { useRouter, usePathname } from 'next/navigation'

type Props = {
  destinations: { slug: string }[]
  className?: string
  style?: React.CSSProperties
}

export default function TakeMeElsewhere({ destinations, className, style }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function go() {
    const others = destinations.filter(d => `/${d.slug}` !== pathname)
    if (others.length === 0) return
    const pick = others[Math.floor(Math.random() * others.length)]
    router.push(`/${pick.slug}`)
  }

  return (
    <span onClick={go} className={className} style={{ cursor: 'pointer', ...style }}>
      Take me elsewhere
    </span>
  )
}
