import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Image left, text right',
    images: [{ field: 'image1', label: 'Image — left (648x416)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body — intro line', multiline: true },
      { field: 'quote', label: 'Quote 1', multiline: true },
      { field: 'body2', label: 'Body — between quotes', multiline: true },
      { field: 'quote2', label: 'Quote 2', multiline: true },
      { field: 'body3', label: 'Body — closing', multiline: true },
    ],
  },
  {
    desc: 'Images only (no text)',
    images: [
      { field: 'image1', label: 'Tall portrait (695x492)' },
      { field: 'image2', label: 'Smaller portrait (487x575)' },
      { field: 'image3', label: 'Small right (193x354)' },
    ],
    texts: [],
  },
  {
    desc: 'Landscape image, text left',
    images: [
      { field: 'image1', label: 'Small right (193x354)' },
      { field: 'image2', label: 'Landscape (684x520)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'quote', label: 'Quote', multiline: true },
      { field: 'body3', label: 'Body 3 — closing', multiline: true },
    ],
  },
  {
    desc: 'Portraits, soil text',
    images: [
      { field: 'image1', label: 'Tall portrait left (499x616)' },
      { field: 'image2', label: 'Portrait right (685x589)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
      { field: 'quote', label: 'Quote', multiline: true },
    ],
  },
  {
    desc: 'Two headlines + image',
    images: [{ field: 'image1', label: 'Landscape (469x334)' }],
    texts: [
      { field: 'headline', label: 'Headline 1', multiline: false },
      { field: 'body1', label: 'Body 1 — right column', multiline: true },
      { field: 'headline2', label: 'Headline 2', multiline: false },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — below image left', multiline: true },
      { field: 'body4', label: 'Body 4 — below image right', multiline: true },
    ],
  },
  {
    desc: 'Portrait + wide body',
    images: [
      { field: 'image1', label: 'Portrait right (293x456)' },
      { field: 'image2', label: 'Small strip (469x178)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1 — right column', multiline: true },
      { field: 'body2', label: 'Body 2 — wide', multiline: true },
    ],
  },
  {
    desc: 'Rains / climate text',
    images: [
      { field: 'image1', label: 'Small portrait (293x262)' },
      { field: 'image2', label: 'Large landscape (688x589)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — left column', multiline: true },
      { field: 'body4', label: 'Body 4 — right column', multiline: true },
      { field: 'body5', label: 'Body 5 — below image left', multiline: true },
      { field: 'body6', label: 'Body 6 — below image right', multiline: true },
    ],
  },
  {
    desc: 'Closing text',
    images: [],
    texts: [
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — left column', multiline: true },
      { field: 'body4', label: 'Body 4 — right column', multiline: true },
    ],
  },
]
