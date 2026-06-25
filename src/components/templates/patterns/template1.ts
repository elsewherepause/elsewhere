import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Large landscape + 2-column text',
    images: [{ field: 'image1', label: 'Main image (691x520)' }],
    texts: [
      { field: 'caption1', label: 'Image caption / subject name', multiline: false },
      { field: 'headline', label: 'Headline (bold, uppercase)', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Landscape strip + small portrait + text',
    images: [
      { field: 'image1', label: 'Landscape strip (469x311)' },
      { field: 'image2', label: 'Small portrait (193x354)' },
    ],
    texts: [
      { field: 'caption1', label: 'Caption — landscape', multiline: false },
      { field: 'caption2', label: 'Caption — portrait', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text', multiline: true },
    ],
  },
  {
    desc: 'Tall portrait + small portrait + large landscape',
    images: [
      { field: 'image1', label: 'Tall portrait — left (494x575)' },
      { field: 'image2', label: 'Small portrait — right (193x354)' },
      { field: 'image3', label: 'Large landscape — lower right (684x520)' },
    ],
    texts: [
      { field: 'caption1', label: 'Caption — tall portrait', multiline: false },
      { field: 'caption2', label: 'Caption — small portrait', multiline: false },
      { field: 'caption3', label: 'Caption — large landscape', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Portrait + headline + 2-column body',
    images: [{ field: 'image1', label: 'Portrait — left (499x554)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Tall portrait + small portrait + side text',
    images: [
      { field: 'image1', label: 'Tall portrait — left (478x575)' },
      { field: 'image2', label: 'Small portrait — right (193x354)' },
    ],
    texts: [
      { field: 'caption1', label: 'Caption — tall portrait', multiline: false },
      { field: 'caption2', label: 'Caption — small portrait', multiline: false },
      { field: 'body1', label: 'Body text (far right)', multiline: true },
    ],
  },
  {
    desc: 'Large landscape right + headline + 2-column body left',
    images: [{ field: 'image1', label: 'Large landscape — right (694x589)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: '2 landscape strips + tall portrait + text',
    images: [
      { field: 'image1', label: 'Top landscape strip — left (469x334)' },
      { field: 'image2', label: 'Tall portrait — far right (293x456)' },
      { field: 'image3', label: 'Bottom landscape strip — left (469x178)' },
    ],
    texts: [
      { field: 'caption1', label: 'Caption — top strip', multiline: false },
      { field: 'caption2', label: 'Caption — tall portrait', multiline: false },
      { field: 'caption3', label: 'Caption — bottom strip', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — top', multiline: true },
      { field: 'body2', label: 'Body text — bottom', multiline: true },
    ],
  },
  {
    desc: 'Small portrait right + headline + 3 body blocks',
    images: [{ field: 'image1', label: 'Small portrait — far right (293x262)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
      { field: 'body3', label: 'Body text — full width below', multiline: true },
    ],
  },
  {
    desc: 'Large landscape + text panel (headline + 3 blocks)',
    images: [{ field: 'image1', label: 'Large landscape — left (688x589)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
      { field: 'body3', label: 'Body text — below', multiline: true },
    ],
  },
  {
    desc: 'Portrait + text panel (headline + 3 blocks)',
    images: [{ field: 'image1', label: 'Portrait — left (484x575)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
      { field: 'body3', label: 'Body text — below', multiline: true },
    ],
  },
  {
    desc: 'Narrow portrait + headline + 2-column text',
    images: [{ field: 'image1', label: 'Narrow portrait — center (227x487)' }],
    texts: [
      { field: 'caption1', label: 'Image caption', multiline: false },
      { field: 'headline', label: 'Headline', multiline: false },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
      { field: 'body3', label: 'Body text — below', multiline: true },
    ],
  },
]
