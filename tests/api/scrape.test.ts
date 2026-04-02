import { describe, it, expect, vi, afterEach } from 'vitest'
import { unlinkSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_FILE = join(import.meta.dirname, '../../data/products.json')

function cleanData() {
  if (existsSync(DATA_FILE)) unlinkSync(DATA_FILE)
}

vi.mock('../../server/utils/scraper', () => ({
  scrapeShopee: vi.fn().mockResolvedValue([
    { name: 'Mock Headphone', price: 99.00, discount: '-50%', rating: 4.5, location: 'KL' }
  ]),
  parseProducts: vi.fn((raw: any[]) => raw),
}))

import { scrapeShopee } from '../../server/utils/scraper'
import { appendScrape, readData } from '../../server/utils/storage'

describe('POST /api/scrape', () => {
  afterEach(() => cleanData())

  it('triggers scrape and saves results', async () => {
    const products = await scrapeShopee()
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('Mock Headphone')

    const entry = appendScrape(products)
    expect(entry.products).toHaveLength(1)
    expect(entry.timestamp).toBeDefined()

    const data = readData()
    expect(data.scrapes).toHaveLength(1)
  })
})
