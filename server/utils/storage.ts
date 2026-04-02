import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { Product, ScrapeData, ScrapeEntry } from './types'

const DATA_FILE = join(process.cwd(), 'data', 'products.json')

export function readData(): ScrapeData {
  if (!existsSync(DATA_FILE)) {
    return { scrapes: [] }
  }
  const raw = readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as ScrapeData
}

export function appendScrape(products: Product[]): ScrapeEntry {
  const data = readData()
  const entry: ScrapeEntry = {
    timestamp: new Date().toISOString(),
    products,
  }
  data.scrapes.push(entry)
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  return entry
}
