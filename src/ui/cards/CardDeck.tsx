import { useState } from 'react'

export type CardItem = {
  id: string
  title: string
  date: string
  description: string
}

type CardDeckProps = {
  cards: CardItem[]
}

export function CardDeck({ cards }: CardDeckProps) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  return (
    <ul className="card-deck" aria-label="AI 商用领域卡片">
      {cards.map((card, index) => {
        const isFlipped = Boolean(flipped[card.id])

        return (
          <li key={card.id}>
            <button
              type="button"
              className={`card-item ${isFlipped ? 'is-flipped' : ''}`}
              style={{ animationDelay: `${index * 90}ms` }}
              onClick={() => setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
            >
              <span className="card-face card-front" aria-hidden={isFlipped}>
                <strong>{card.title}</strong>
                <span>{card.date}</span>
                <small>点击翻转</small>
              </span>
              <span className="card-face card-back" aria-hidden={!isFlipped}>
                <strong>{card.title}</strong>
                <span>{card.date}</span>
                <p>{card.description}</p>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
