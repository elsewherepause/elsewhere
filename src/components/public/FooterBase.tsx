type Props = {
  rowClassName?: string
  rowStyle?: React.CSSProperties
  wordmarkHeight?: number
  // Multiplies the icon size / copyright font size, and the default row margin,
  // row padding, and bottom padding below. Leave at 1 (default) when this component
  // renders inside an ancestor `transform: scale()` — that already scales these
  // fixed px values visually. Pass the canvas scale factor explicitly when rendering
  // outside any such transform (see CanvasFooter).
  scale?: number
  // Overrides the default 40 * scale bottom padding (e.g. mobile's tighter spacing).
  paddingBottom?: number
}

export default function FooterBase({ rowClassName, rowStyle, wordmarkHeight, scale = 1, paddingBottom }: Props) {
  return (
    <div style={{ paddingBottom: paddingBottom ?? 40 * scale }}>
      <img
        src="/t1-wordmark.svg"
        alt=".elsewhere"
        style={{ width: '88%', display: 'block', margin: '0 auto', ...(wordmarkHeight ? { height: wordmarkHeight } : {}) }}
      />
      <div
        className={rowClassName}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 48 * scale, paddingLeft: 88 * scale, paddingRight: 88 * scale,
          ...rowStyle,
        }}
      >
        <div style={{ display: 'flex', gap: 40 * scale, alignItems: 'center' }}>
          <a href="https://instagram.com/pause.elsewhere" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/t1-instagram.svg" alt="Instagram" width={20 * scale} height={20 * scale} style={{ display: 'block' }} />
          </a>
        </div>
        <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16 * scale, color: '#000' }}>
          @Copyright
        </span>
      </div>
    </div>
  )
}
