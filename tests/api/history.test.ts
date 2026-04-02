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

describe('GET /api/history', () => {
  afterEach(() => cleanData())

  it('returns all scrapes', () => {
    seedData({
      scrapes: [
        { timestamp: '2026-04-01T10:00:00.000Z', products: [] },
        { timestamp: '2026-04-01T10:05:00.000Z', products: [] },
        { timestamp: '2026-04-01T10:10:00.000Z', products: [] },
      ]
    })
    const data = readData()
    expect(data.scrapes).toHaveLength(3)
  })

  it('respects limit parameter', () => {
    seedData({
      scrapes: [
        { timestamp: '2026-04-01T10:00:00.000Z', products: [] },
        { timestamp: '2026-04-01T10:05:00.000Z', products: [] },
        { timestamp: '2026-04-01T10:10:00.000Z', products: [] },
      ]
    })
    const data = readData()
    const limit = 2
    const limited = data.scrapes.slice(-limit)
    expect(limited).toHaveLength(2)
    expect(limited[0].timestamp).toBe('2026-04-01T10:05:00.000Z')
  })

  it('returns empty array when no data', () => {
    cleanData()
    const data = readData()
    expect(data.scrapes).toEqual([])
  })
})
