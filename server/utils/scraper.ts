import { connect } from 'puppeteer-real-browser'
import type { Product } from './types'

interface RawProduct {
  name: string | null
  price: string | null
  discount: string | null
  rating: string | null
  location: string | null
}

export function parseProducts(rawData: RawProduct[]): Product[] {
  return rawData.map((raw) => ({
    name: raw.name || '',
    price: parseFloat(raw.price || '0') || 0,
    discount: raw.discount || '',
    rating: parseFloat(raw.rating || '0') || 0,
    location: raw.location || '',
  }))
}

export async function scrapeShopee(): Promise<Product[]> {
  let browser: any = null
  try {
    const connection = await connect({
      headless: false,
      turnstile: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    browser = connection.browser
    const page = connection.page

    console.log('[scraper] Navigating to Shopee search...')
    await page.goto('https://shopee.com.my/search?keyword=headphone', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    const currentUrl = page.url()
    console.log(`[scraper] Current URL: ${currentUrl}`)

    if (currentUrl.includes('/verify/') || currentUrl.includes('/buyer/login')) {
      console.log('[scraper] Blocked by Shopee anti-bot')
      return []
    }

    // Wait for content to render
    await new Promise(r => setTimeout(r, 5000))

    // Scroll to trigger lazy loading
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 300))
      await new Promise(r => setTimeout(r, 1000))
    }

    // Wait for product cards
    try {
      await page.waitForSelector('li > [role="group"]', { timeout: 15000 })
    } catch {
      console.log('[scraper] No product cards found')
      return []
    }

    // Extract product data
    const rawData: RawProduct[] = await page.evaluate(() => {
      const cards = document.querySelectorAll('li > [role="group"]')
      const items: { name: string | null; price: string | null; discount: string | null; rating: string | null; location: string | null }[] = []

      cards.forEach((card) => {
        const ariaLabel = card.getAttribute('aria-label') || ''
        const nameMatch = ariaLabel.match(/^Product card: (.+)$/)
        const name = nameMatch ? nameMatch[1] : ''

        if (!name) return

        const allText = card.querySelectorAll('*')
        let price = ''
        let discount = ''
        let rating = ''
        let location = ''

        allText.forEach((el) => {
          const text = (el as HTMLElement).innerText?.trim() || ''
          const ariaLbl = el.getAttribute('aria-label') || ''

          if (!price && /^[\d,]+\.\d{2}$/.test(text)) {
            price = text.replace(/,/g, '')
          }
          if (!discount && /^-\d+%$/.test(text)) {
            discount = text
          }
          if (!rating && /^\d\.\d$/.test(text) && ariaLbl === '') {
            rating = text
          }
          if (!location && ariaLbl.startsWith('location-')) {
            location = ariaLbl.replace('location-', '')
          }
        })

        items.push({ name, price, discount, rating, location })
      })

      return items
    })

    console.log(`[scraper] Found ${rawData.length} products`)
    return parseProducts(rawData)
  } catch (error) {
    console.error('[scraper] Failed to scrape Shopee:', error)
    return []
  } finally {
    if (browser) await browser.close()
  }
}
