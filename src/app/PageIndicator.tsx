type PageIndicatorProps = {
  current: number
  total: number
}

export function PageIndicator({ current, total }: PageIndicatorProps) {
  return (
    <div className="page-indicator" aria-live="polite" aria-atomic="true">
      <span className="page-indicator-current">{String(current).padStart(2, '0')}</span>
      <span className="page-indicator-sep">/</span>
      <span className="page-indicator-total">{String(total).padStart(2, '0')}</span>
    </div>
  )
}
