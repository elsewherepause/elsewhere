import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import { getNextProject } from '@/lib/utils/next-project'
import { getAllDestinations } from '@/lib/utils/random-destination'
import { cloudinaryUrl, cloudinaryBlur } from '@/lib/utils/cloudinary-url'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = await prisma.note.findUnique({
    where: { slug, published: true },
  })
  if (!note) return {}
  return {
    title: note.title,
    alternates: { canonical: `/notes/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const notes = await prisma.note.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return notes.map((n: { slug: string }) => ({ slug: n.slug }))
  } catch {
    return []
  }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = await prisma.note.findUnique({
    where: { slug, published: true },
    include: {
      headerImage: true,
      footerImage: true,
    },
  })

  if (!note) notFound()

  const [nextProject, destinations] = await Promise.all([
    getNextProject(),
    getAllDestinations(),
  ])

  return (
    <>
      <SiteNav />
      <article className="mx-auto px-6 pt-24 md:pt-36 pb-16" style={{ maxWidth: 640 }}>

        {note.headerImage && (
          <div className="flex justify-center mb-10">
            <div className="w-48 md:w-56">
              <Image
                src={cloudinaryUrl(note.headerImage.cloudinaryId, { width: 600, quality: 'auto' })}
                alt={note.headerImage.altText ?? note.title}
                width={note.headerImage.width}
                height={note.headerImage.height}
                className="w-full h-auto"
                placeholder="blur"
                blurDataURL={cloudinaryBlur(note.headerImage.cloudinaryId)}
                priority
              />
            </div>
          </div>
        )}

        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="font-sans text-sm font-medium text-[var(--color-ink)]">Notes</span>
            <span className="font-sans text-sm text-[#848484]">|</span>
            <span className="font-sans text-sm uppercase text-[#848484]">{note.readTime}</span>
          </div>
          <h1
            className="text-xl md:text-2xl font-medium leading-snug tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {note.title}
          </h1>
        </header>

        <div
          className="font-sans text-base leading-[1.8] text-[var(--color-ink)] text-center space-y-8"
          style={{ fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {note.footerImage && (
          <div className="mt-12">
            <Image
              src={cloudinaryUrl(note.footerImage.cloudinaryId, { width: 1200, quality: 'auto' })}
              alt={note.footerImage.altText ?? ''}
              width={note.footerImage.width}
              height={note.footerImage.height}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL={cloudinaryBlur(note.footerImage.cloudinaryId)}
            />
          </div>
        )}

      </article>
      <SiteFooter nextProject={nextProject} destinations={destinations} />
    </>
  )
}
