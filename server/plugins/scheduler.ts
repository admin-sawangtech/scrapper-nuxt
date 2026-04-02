import { scrapeShopee } from '../utils/scraper'
import { appendScrape } from '../utils/storage'

const INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

async function runScrape() {
  console.log(`[scheduler] Starting scrape at ${new Date().toISOString()}`)
  try {
    const products = await scrapeShopee()
    const entry = appendScrape(products)
    console.log(`[scheduler] Scraped ${entry.products.length} products at ${entry.timestamp}`)
  } catch (error) {
    console.error('[scheduler] Scrape failed:', error)
  }
}

export default defineNitroPlugin(() => {
  console.log('[scheduler] Starting Shopee scraper scheduler (every 5 min)')

  // Run first scrape on boot
  runScrape()

  // Schedule recurring scrapes
  setInterval(runScrape, INTERVAL_MS)
})
