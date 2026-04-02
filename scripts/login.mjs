/**
 * Login to Shopee manually.
 * This opens a Chrome browser with a persistent profile.
 * Log in to your Shopee account, then close the browser.
 * The session cookies will be saved for the scraper to use.
 */
import { chromium } from 'playwright'
import { join } from 'path'

const userDataDir = join(process.cwd(), 'data', 'chrome-profile')

console.log('Opening Chrome for Shopee login...')
console.log('Profile saved at:', userDataDir)
console.log('')
console.log('Steps:')
console.log('1. Select English language if prompted')
console.log('2. Log in to your Shopee account')
console.log('3. Once logged in, close the browser window')
console.log('')

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: 'chrome',
  headless: false,
  args: ['--disable-blink-features=AutomationControlled'],
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  viewport: { width: 1366, height: 768 },
  locale: 'en-MY',
  timezoneId: 'Asia/Kuala_Lumpur',
})

const page = context.pages()[0] || await context.newPage()

await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false })
})

await page.goto('https://shopee.com.my/buyer/login', { waitUntil: 'domcontentloaded' })

console.log('Browser opened. Please log in and then close the browser window.')

// Wait for browser to be closed by user
await new Promise((resolve) => {
  context.on('close', resolve)
})

console.log('Session saved! You can now run: npm run dev')
