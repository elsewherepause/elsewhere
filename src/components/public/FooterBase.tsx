type Props = {
  rowClassName?: string
  rowStyle?: React.CSSProperties
  wordmarkHeight?: number
}

export default function FooterBase({ rowClassName, rowStyle, wordmarkHeight }: Props) {
  return (
    <>
      <img
        src="/t1-wordmark.svg"
        alt=".elsewhere"
        style={{ width: '88%', display: 'block', margin: '0 auto', ...(wordmarkHeight ? { height: wordmarkHeight } : {}) }}
      />
      <div
        className={rowClassName}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...rowStyle }}
      >
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="https://instagram.com/pause.elsewhere" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/t1-instagram.svg" alt="Instagram" width={20} height={20} style={{ display: 'block' }} />
          </a>
        </div>
        <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16, color: '#000' }}>
          @Copyright
        </span>
      </div>
    </>
  )
}
