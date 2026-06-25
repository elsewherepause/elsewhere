import Image from 'next/image'
import Link from 'next/link'
import { cloudinaryUrl, cloudinaryVideoUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import type { GalleryMediaType } from '@prisma/client'
import type { Note } from '@/actions/note.actions'

export type GalleryItemData = {
  id: string
  altText: string
  caption: string | null
  description: string | null
  mediaType: GalleryMediaType
  category: string | null
  image: { cloudinaryId: string; width: number; height: number }
}

function ArticleNote({ note, align = "left" }: { note?: Note; align?: "left" | "right" }) {
  if (note) {
    return (
      <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
          <span className="font-sans text-sm md:text-base font-normal text-[var(--color-ink)]">Notes |</span>
          <span className="font-sans text-sm md:text-base font-normal text-[#848484] uppercase">{note.readTime || '2 min read'}</span>
        </div>
        <Link 
          href={`/notes/${note.slug}`}
          className={`font-heading text-xl md:text-[28px] font-medium uppercase underline underline-offset-2 leading-tight hover:opacity-75 transition-opacity ${align === "right" ? "text-right" : "text-left"}`}
        >
          {note.title}
        </Link>
      </div>
    )
  }

  // Placeholder Note (for visual layout and matching template)
  return (
    <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
      <div className={`flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <span className="font-sans text-sm md:text-base font-normal text-[var(--color-ink)]">Notes |</span>
        <span className="font-sans text-sm md:text-base font-normal text-[#848484] uppercase">2 min read</span>
      </div>
      <p className={`font-heading text-xl md:text-[28px] font-medium uppercase underline underline-offset-2 leading-tight ${align === "right" ? "text-right" : "text-left"}`}>
        The story was quite clear, to me
      </p>
    </div>
  )
}

function EditorialTitle({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <h2 className={`font-heading text-xl md:text-[28px] font-medium uppercase leading-tight ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </h2>
  )
}

function EditorialText({
  title,
  desc,
  align = "left",
}: {
  title: string
  desc?: string | null
  align?: "left" | "right"
}) {
  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
      <EditorialTitle align={align}>{title}</EditorialTitle>
      {desc && (
        <p className={`font-sans text-sm md:text-base font-normal text-[var(--color-ink-muted)] leading-normal max-w-[360px] ${align === "right" ? "text-right" : "text-left"}`}>
          {desc}
        </p>
      )}
    </div>
  )
}

function MusicWidget() {
  return (
    <div className="mt-4 flex flex-col items-center gap-1">
      <svg width="160" height="118" viewBox="0 0 160 118" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <rect x="14.5156" y="-0.142334" width="119.266" height="117.958" fill="url(#mw-pattern)"/>
        <path d="M31.5597 59.8796L39.0391 55.2682V64.4911L31.5597 59.8796Z" fill="white"/>
        <path d="M29.8419 55.2682H32.1992V64.4911H29.8419V55.2682Z" fill="white"/>
        <path d="M78.5896 59.8796L69.707 54.4031V65.3562L78.5896 59.8796Z" fill="white"/>
        <path d="M116.738 59.8796L109.259 55.2682V64.4911L116.738 59.8796Z" fill="white"/>
        <path d="M118.456 55.2682H116.099V64.4911H118.456V55.2682Z" fill="white"/>
        <path d="M155.523 45.172C157.037 39.7107 153.838 34.0558 148.376 32.5415C142.915 31.0271 137.26 34.2267 135.746 39.688C134.232 45.1493 137.431 50.8042 142.892 52.3185C148.354 53.8329 154.009 50.6333 155.523 45.172Z" fill="#848484"/>
        <path d="M139.368 50.8182C134.744 47.3643 133.793 40.7926 137.247 36.1688C140.701 31.5451 147.272 30.5929 151.896 34.0468C156.52 37.5007 157.472 44.0725 154.018 48.6965C150.564 53.3205 143.992 54.2721 139.368 50.8182ZM151.65 34.3765C147.208 31.0586 140.895 31.9728 137.576 36.4151C134.258 40.8575 135.172 47.1707 139.614 50.4887C144.057 53.807 150.37 52.8926 153.688 48.4504C157.006 44.008 156.092 37.6948 151.65 34.3765Z" fill="#231F20"/>
        <path d="M151.075 49.3991C154.924 46.3947 155.608 40.8392 152.604 36.9905C149.599 33.1418 144.044 32.4574 140.195 35.4617C136.347 38.466 135.662 44.0215 138.666 47.8702C141.671 51.7189 147.226 52.4034 151.075 49.3991Z" fill="#231F20"/>
        <path d="M146.759 50.2128C151.056 49.5904 154.035 45.6025 153.412 41.3055C152.79 37.0085 148.802 34.0296 144.505 34.6519C140.208 35.2743 137.229 39.2622 137.851 43.5592C138.474 47.8562 142.462 50.8351 146.759 50.2128Z" fill="#848484"/>
        <path d="M103.382 86.1582L100.603 84.0828L108.787 73.1268C109.336 72.3917 110.123 71.869 111.013 71.6473L122.891 68.6884C123.801 68.4617 124.602 67.9204 125.152 67.1607L149.645 33.3252C150.377 32.3105 151.799 32.0926 152.801 32.8416C153.799 33.5866 153.997 35.0019 153.243 35.9926L127.034 70.4923C126.485 71.2141 125.707 71.7271 124.827 71.946L112.899 74.9176C112.009 75.1394 111.222 75.662 110.673 76.3972L103.382 86.1582Z" fill="#848484"/>
        <path d="M95.9147 96.8728L92.2528 94.1376C91.2792 93.4105 91.0777 92.0189 91.8048 91.0454L98.5021 82.0796C99.2292 81.1061 100.621 80.9046 101.594 81.6317L105.256 84.367C106.23 85.0941 106.431 86.4856 105.704 87.4591L99.0068 96.4249C98.2797 97.3985 96.8882 97.6002 95.9147 96.8728Z" fill="#474747"/>
        <path d="M148.941 48.6214C152.358 46.7952 153.647 42.5448 151.821 39.128C149.995 35.7111 145.744 34.4216 142.327 36.2478C138.911 38.074 137.621 42.3243 139.447 45.7412C141.273 49.1581 145.524 50.4476 148.941 48.6214Z" fill="black"/>
      </svg>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-sans text-[11px] uppercase text-[var(--color-ink)] text-center">Angel (feat. horace andy)</span>
        <span className="font-sans text-[11px] text-[var(--color-ink-muted)] text-center">Massive Attack . Mezzanine</span>
      </div>
    </div>
  )
}

function renderImage(item: GalleryItemData, aspectClass: string) {
  if (item.mediaType === 'VIDEO') {
    return (
      <div className={`relative w-full ${aspectClass} group`}>
        <video
          src={cloudinaryVideoUrl(item.image.cloudinaryId, { quality: 'auto' })}
          poster={cloudinaryVideoThumbnail(item.image.cloudinaryId, { width: 1200 })}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onMouseEnter={e => (e.target as HTMLVideoElement).play()}
          onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
        />
        <span className="absolute top-3 left-3 text-[11px] uppercase tracking-widest text-white bg-black/50 px-2 py-1 pointer-events-none">
          Video
        </span>
      </div>
    )
  }

  return (
    <div className={`relative w-full ${aspectClass}`}>
      <Image
        src={cloudinaryUrl(item.image.cloudinaryId, { width: 1200, crop: 'fill' })}
        alt={item.altText || ''}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}

function GalleryGroup({
  groupItems,
  note1,
  note2,
  gIndex,
}: {
  groupItems: GalleryItemData[]
  note1?: Note
  note2?: Note
  gIndex: number
}) {
  const flip = gIndex % 2 === 1
  const img0 = groupItems[0]
  const img1 = groupItems[1]
  const img2 = groupItems[2]
  const img3 = groupItems[3]
  const img4 = groupItems[4]
  const img5 = groupItems[5]
  const img6 = groupItems[6]
  const img7 = groupItems[7]

  return (
    <div className="space-y-16 md:space-y-24 lg:space-y-36">
      {/* Row 1: Article note + center portrait + text right */}
      {img0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          <div className="col-span-12 md:col-span-3 md:col-start-1 md:pt-4">
            <ArticleNote note={note1} align={flip ? 'right' : 'left'} />
          </div>
          <div className="col-span-12 md:col-span-3 md:col-start-5">
            {renderImage(img0, 'aspect-[274/376]')}
          </div>
          <div className={`col-span-12 md:col-span-4 md:col-start-9 md:pt-10 ${flip ? 'md:col-start-1 md:row-start-1' : ''}`}>
            <EditorialText
              title={img0.caption || 'Lorem ipsum'}
              desc={img0.description}
              align={flip ? 'right' : 'left'}
            />
          </div>
        </div>
      )}

      {/* Row 2: Portrait left + title + portrait right */}
      {(img1 || img2) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {img1 && (
            <div className="col-span-12 md:col-span-3 md:col-start-1">
              {renderImage(img1, 'aspect-[288/395]')}
            </div>
          )}
          <div className="col-span-12 md:col-span-5 md:col-start-4 flex flex-col justify-start md:pt-6">
            {img1 && (
              <EditorialTitle align="right">
                {img1.caption || 'Lorem ipsum dolor sit amet consectetur.'}
              </EditorialTitle>
            )}
          </div>
          {img2 && (
            <div className="col-span-12 md:col-span-3 md:col-start-10">
              {renderImage(img2, 'aspect-[288/395]')}
              {gIndex === 0 && (
                <div className="hidden xl:block mt-4">
                  <MusicWidget />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Row 3: Decorative Text block centered */}
      {groupItems.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 md:col-start-4">
            <EditorialText
              title="Lorem ipsum dolor sit amet consectetur."
              desc="Lorem ipsum dolor sit amet consectetur. dolor sit amet consectetur."
              align="left"
            />
          </div>
        </div>
      )}

      {/* Row 4: Title left + landscape right */}
      {img3 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
          <div className="col-span-12 md:col-span-3 md:col-start-2">
            <EditorialTitle align="right">
              {img3.caption || 'Lorem ipsum dolor sit amet consectetur.'}
            </EditorialTitle>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            {renderImage(img3, 'aspect-[520/298]')}
          </div>
        </div>
      )}

      {/* Row 5: Landscape left + title+desc + article note right + portrait right */}
      {(img4 || img5) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {img4 && (
            <div className="col-span-12 md:col-span-5 md:col-start-1">
              {renderImage(img4, 'aspect-[520/298]')}
            </div>
          )}
          <div className="col-span-12 md:col-span-3 md:col-start-7 md:pt-2">
            {img4 && (
              <EditorialText
                title={img4.caption || 'Lorem ipsum dolor sit amet consectetur.'}
                desc={img4.description}
                align="left"
              />
            )}
          </div>
          {img5 && (
            <div className="col-span-12 md:col-span-3 md:col-start-10">
              <ArticleNote note={note2} align="right" />
              <div className="mt-4">
                {renderImage(img5, 'aspect-[288/395]')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 6: Text+landscape left, title right+landscape right */}
      {(img6 || img7) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {img6 && (
            <div className="col-span-12 md:col-span-5 md:col-start-1 flex flex-col gap-6">
              {renderImage(img6, 'aspect-[469/240]')}
              <div className="flex justify-end">
                <EditorialText
                  title={img6.caption || 'Lorem ipsum dolor sit amet consectetur.'}
                  desc={img6.description}
                  align="right"
                />
              </div>
            </div>
          )}
          {img7 && (
            <div className="col-span-12 md:col-span-5 md:col-start-8 md:mt-20">
              <EditorialTitle align="left">
                {img7.caption || 'Lorem ipsum dolor sit amet consectetur.'}
              </EditorialTitle>
              <div className="mt-4">
                {renderImage(img7, 'aspect-[520/298]')}
              </div>
              {img7.description && (
                <div className="mt-4 flex justify-end">
                  <EditorialText
                    title={img7.caption || 'Lorem ipsum'}
                    desc={img7.description}
                    align="right"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GalleryGrid({ items, notes = [] }: { items: GalleryItemData[]; notes?: Note[] }) {
  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[var(--color-ink-faint)] tracking-widest uppercase">No images yet</p>
      </div>
    )
  }

  // Chunk items into groups of 8
  const groups: GalleryItemData[][] = []
  for (let i = 0; i < items.length; i += 8) {
    groups.push(items.slice(i, i + 8))
  }

  return (
    <div className="space-y-24 md:space-y-36 lg:space-y-48 pb-24">
      {groups.map((groupItems, gIndex) => {
        const note1 = notes[gIndex * 2]
        const note2 = notes[gIndex * 2 + 1]
        return (
          <GalleryGroup
            key={gIndex}
            groupItems={groupItems}
            note1={note1}
            note2={note2}
            gIndex={gIndex}
          />
        )
      })}
    </div>
  )
}
