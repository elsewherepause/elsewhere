import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Landscape image with headline & quotes',
    images: [{ field: 'image1', label: 'Image (648x416)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'quote', label: 'Quote 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'quote2', label: 'Quote 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Three images with body text',
    images: [
      { field: 'image1', label: 'Main image (695x492)' },
      { field: 'image2', label: 'Lower left (487x575)' },
      { field: 'image3', label: 'Right portrait (193x354)' },
      { field: 'image4', label: 'Lower right (193x354)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Landscape with quote',
    images: [
      { field: 'image1', label: 'Image (684x520)' },
      { field: 'image2', label: 'Second Image (400x300)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'quote', label: 'Quote', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
      { field: 'body4', label: 'Body 4', multiline: true },
      { field: 'body5', label: 'Body 5', multiline: true },
      { field: 'body6', label: 'Body 6', multiline: true },
    ],
  },
  {
    desc: 'Two portraits with quote',
    images: [
      { field: 'image1', label: 'Left tall (499x616)' },
      { field: 'image2', label: 'Lower right (685x589)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
      { field: 'quote', label: 'Quote', multiline: true },
      { field: 'body4', label: 'Body 4', multiline: true },
    ],
  },
  {
    desc: 'Headline + landscape + body',
    images: [{ field: 'image1', label: 'Image (469x334)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Portrait + strip image',
    images: [
      { field: 'image1', label: 'Portrait (293x456)' },
      { field: 'image2', label: 'Landscape strip (469x178)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
    ],
  },
  {
    desc: 'Small portrait + wide landscape',
    images: [
      { field: 'image1', label: 'Small portrait (293x262)' },
      { field: 'image2', label: 'Wide landscape (688x589)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Closing text',
    images: [],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
      { field: 'body4', label: 'Body 4', multiline: true },
    ],
  },
]
