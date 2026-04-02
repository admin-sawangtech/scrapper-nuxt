import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { readData, appendScrape } from '../../server/utils/storage'
import type { Product, ScrapeData } from '../../server/utils/types'

const TEST_DATA_DIR = join(import.meta.dirname, '../../data')
const TEST_FILE = join(TEST_DATA_DIR, 'products.json')

function cleanTestFile() {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
}

describe('storage', () => {
  beforeEach(() => {
    cleanTestFile()
  })

  afterEach(() => {
    cleanTestFile()
  })

  describe('readData', () => {
    it('returns empty scrapes array when file does not exist', () => {
      const data = readData()
      expect(data).toEqual({ scrapes: [] })
    })

    it('returns parsed data when file exists', () => {
      const existing: ScrapeData = {
        scrapes: [{
          timestamp: '2026-04-01T10:00:00.000Z',
          products: [{ name: 'Test Headphone', price: 25.00, discount: '-50%', rating: 4.5, location: 'KL' }]
        }]
      }
      mkdirSync(TEST_DATA_DIR, { recursive: true })
      writeFileSync(TEST_FILE, JSON.stringify(existing, null, 2))
      const data = readData()
      expect(data.scrapes).toHaveLength(1)
      expect(data.scrapes[0].products[0].name).toBe('Test Headphone')
    })
  })

  describe('appendScrape', () => {
    it('creates file and appends first scrape when file does not exist', () => {
      const products: Product[] = [
        { name: 'Headphone A', price: 30.00, discount: '-20%', rating: 4.0, location: 'Penang' }
      ]
      appendScrape(products)
      const raw = readFileSync(TEST_FILE, 'utf-8')
      const data: ScrapeData = JSON.parse(raw)
      expect(data.scrapes).toHaveLength(1)
      expect(data.scrapes[0].products).toHaveLength(1)
      expect(data.scrapes[0].products[0].name).toBe('Headphone A')
      expect(data.scrapes[0].timestamp).toBeDefined()
    })

    it('appends to existing scrapes', () => {
      const products1: Product[] = [
        { name: 'Headphone A', price: 30.00, discount: '-20%', rating: 4.0, location: 'Penang' }
      ]
      const products2: Product[] = [
        { name: 'Headphone B', price: 50.00, discount: '-10%', rating: 5.0, location: 'KL' }
      ]
      appendScrape(products1)
      appendScrape(products2)
      const data = readData()
      expect(data.scrapes).toHaveLength(2)
      expect(data.scrapes[1].products[0].name).toBe('Headphone B')
    })
  })
})
