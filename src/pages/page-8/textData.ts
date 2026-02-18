import { parse } from 'yaml'

import sourceRaw from '../../../page-8.yaml?raw'

type Page8YamlRow = {
  原文?: unknown
  译文?: unknown
  底部注释?: unknown
  位置?: unknown
}

export type Page8TextPair = {
  origin: string
  translation: string
  source: string
}

function toStringField(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`[page-8] invalid or missing field: ${fieldName}`)
  }

  return value.trim()
}

function toOrder(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return Number.MAX_SAFE_INTEGER
}

function parseRows(raw: string) {
  const parsed = parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error('[page-8] page-8.yaml must be a YAML array')
  }

  return parsed as Page8YamlRow[]
}

export function buildPage8TextPairs() {
  const rows = parseRows(sourceRaw)

  return rows
    .slice()
    .sort((left, right) => toOrder(left.位置) - toOrder(right.位置))
    .map((row): Page8TextPair => ({
      origin: toStringField(row.原文, '原文'),
      translation: toStringField(row.译文, '译文'),
      source: toStringField(row.底部注释, '底部注释'),
    }))
}

export const page8TextPairs = buildPage8TextPairs()
export const page8LaneCount = Math.max(page8TextPairs.length, 1)
