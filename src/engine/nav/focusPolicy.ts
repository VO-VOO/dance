export function focusPageLandmark(pageIndex: number) {
  window.requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(`[data-page-index="${pageIndex}"]`)
    target?.focus()
  })
}
