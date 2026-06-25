'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { GalleryMediaType } from '@prisma/client'

const GalleryImageSchema = z.object({
  altText: z.string().min(1),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  mediaType: z.enum(['PHOTO', 'VIDEO']),
  published: z.boolean(),
})

export type GalleryImageInput = z.infer<typeof GalleryImageSchema>

export async function getGalleryImages() {
  await requireAdmin()
  return prisma.galleryImage.findMany({
    include: { image: true },
    orderBy: { order: 'asc' },
  })
}

export async function createGalleryImage(imageId: string) {
  await requireAdmin()

  const last = await prisma.galleryImage.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const item = await prisma.galleryImage.create({
    data: {
      imageId,
      altText: '',
      order: (last?.order ?? -1) + 1,
    },
    include: { image: true },
  })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return item
}

export async function updateGalleryImage(id: string, data: GalleryImageInput) {
  await requireAdmin()
  const parsed = GalleryImageSchema.parse(data)

  await prisma.galleryImage.update({
    where: { id },
    data: {
      altText: parsed.altText,
      caption: parsed.caption?.trim() || null,
      description: parsed.description?.trim() || null,
      category: parsed.category?.trim() || null,
      mediaType: parsed.mediaType as GalleryMediaType,
      published: parsed.published,
    },
  })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin()
  await prisma.galleryImage.delete({ where: { id } })
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

export async function reorderGalleryImages(orderedIds: string[]) {
  await requireAdmin()

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryImage.update({ where: { id }, data: { order: index } })
    )
  )

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}
