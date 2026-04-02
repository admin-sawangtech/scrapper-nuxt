import { describe, it, expect, afterEach } from 'vitest'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { ScrapeData } from '../../server/utils/types'
import { readData } from '../../server/utils/storage'

const DATA_DIR = join(import.meta.dirname, '../../data')
const DATA_FILE = join(DATA_DIR, 'products.json')

function seedData(data: ScrapeData) {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function cleanData() {
  if (existsSync(DATA_FILE)) unlinkSync(DATA_FILE)
}

describe('GET /api/products', () => {
  afterEach(() => cleanData())

  it('returns null when no scrapes exist', () => {
    cleanData()
    const data = readData()
    const latest = data.scrapes.length > 0 ? data.scrapes[data.scrapes.length - 1] : null
    expect(latest).toBeNull()
  })

  it('returns the latest scrape entry', () => {
    seedData({
      scrapes: [
        { timestamp: '2026-04-01T10:00:00.000Z', products: [{ name: 'Old', price: 10, discount: '', rating: 0, location: '' }] },
        { timestamp: '2026-04-01T11:00:00.000Z', products: [{ name: 'New', price: 20, discount: '', rating: 0, location: '' }] },
      ]
    })
    const data = readData()
    const latest = data.scrapes[data.scrapes.length - 1]
    expect(latest.products[0].name).toBe('New')
    expect(latest.timestamp).toBe('2026-04-01T11:00:00.000Z')
  })
})
