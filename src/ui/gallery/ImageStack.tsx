export type ImageStackItem = {
  id: string
  title: string
  description: string
  imageSrc: string
}

type ImageStackProps = {
  items: ImageStackItem[]
  activeIndex: number
}

export function ImageStack({ items, activeIndex }: ImageStackProps) {
  const visible = [
    items[activeIndex],
    items[activeIndex + 1],
    items[activeIndex + 2],
    items[activeIndex + 3],
  ].filter(Boolean)

  return (
    <section className="image-stack" aria-label="图库堆叠视图">
      {visible.map((item, index) => {
        const isActive = index === 0
        return (
          <figure key={item.id} className={`stack-layer ${isActive ? 'is-active' : ''}`}>
            <img src={item.imageSrc} alt={item.title} loading={isActive ? 'eager' : 'lazy'} />
          </figure>
        )
      })}
      <div className="stack-caption" aria-live="polite">
        <h3>{items[activeIndex]?.title ?? ''}</h3>
        <p>{items[activeIndex]?.description ?? ''}</p>
      </div>
    </section>
  )
}
