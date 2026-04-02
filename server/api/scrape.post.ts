import { scrapeShopee } from '../utils/scraper'
import { appendScrape } from '../utils/storage'

export default defineEventHandler(async () => {
  const products = await scrapeShopee()
  const entry = appendScrape(products)
  return {
    success: true,
    timestamp: entry.timestamp,
    count: entry.products.length,
    products: entry.products,
  }
})
