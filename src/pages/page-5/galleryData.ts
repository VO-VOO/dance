import { parse } from 'yaml'

import type { ImageStackItem } from '../../ui/gallery/ImageStack'

import descriptionRaw from '../../../image/description.yaml?raw'

type GalleryYamlRow = {
  主标题?: unknown
  介绍文字?: unknown
  对应文件?: unknown
  位置?: unknown
}

const imageModules = import.meta.glob('../../../image/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const imageByFilename = new Map(
  Object.entries(imageModules).map(([path, url]) => [toBaseName(path), url]),
)

function toBaseName(value: string) {
  const normalized = value.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  return lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1)
}

function toStringField(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`[page-5] invalid or missing field: ${fieldName}`)
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
    throw new Error('[page-5] description.yaml must be a YAML array')
  }

  return parsed as GalleryYamlRow[]
}

function resolveImageUrl(fileValue: string) {
  const fileName = toBaseName(fileValue)
  const imageUrl = imageByFilename.get(fileName)

  if (!imageUrl) {
    throw new Error(`[page-5] image file not found in image/: ${fileValue}`)
  }

  return imageUrl
}

export function buildGalleryItems() {
  const rows = parseRows(descriptionRaw)

  return rows
    .slice()
    .sort((left, right) => toOrder(left.位置) - toOrder(right.位置))
    .map((row, index): ImageStackItem => {
      const title = toStringField(row.主标题, '主标题')
      const description = toStringField(row.介绍文字, '介绍文字')
      const file = toStringField(row.对应文件, '对应文件')

      return {
        id: `gallery-${index + 1}`,
        title,
        description,
        imageSrc: resolveImageUrl(file),
      }
    })
}

export const galleryItems = buildGalleryItems()
export const galleryLaneCount = Math.max(galleryItems.length, 1)
