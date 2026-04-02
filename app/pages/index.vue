<script setup lang="ts">
interface Product {
  name: string
  price: number
  discount: string
  rating: number
  location: string
}

interface ScrapeEntry {
  timestamp: string
  products: Product[]
}

const { data: latestData, refresh: refreshLatest } = await useFetch<{ latest: ScrapeEntry | null }>('/api/products')
const { data: historyData, refresh: refreshHistory } = await useFetch<{ scrapes: ScrapeEntry[] }>('/api/history', {
  query: { limit: 20 },
})

const scraping = ref(false)

async function triggerScrape() {
  scraping.value = true
  try {
    await $fetch('/api/scrape', { method: 'POST' })
    await refreshLatest()
    await refreshHistory()
  } finally {
    scraping.value = false
  }
}

// Auto-refresh every 5 minutes (client-side only)
let refreshInterval: ReturnType<typeof setInterval>

onMounted(() => {
  refreshInterval = setInterval(() => {
    refreshLatest()
    refreshHistory()
  }, 5 * 60 * 1000)
})

onUnmounted(() => clearInterval(refreshInterval))
</script>

<template>
  <div style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
    <h1>Shopee Headphone Scraper</h1>

    <div style="margin-bottom: 20px;">
      <button
        :disabled="scraping"
        style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #ee4d2d; color: white; border: none; border-radius: 4px;"
        @click="triggerScrape"
      >
        {{ scraping ? 'Scraping...' : 'Scrape Now' }}
      </button>
    </div>

    <section style="margin-bottom: 30px;">
      <h2>Latest Results</h2>
      <p v-if="!latestData?.latest" style="color: #666;">
        No data yet. Click "Scrape Now" to start.
      </p>
      <div v-else>
        <p style="color: #666; margin-bottom: 10px;">
          Scraped at: {{ new Date(latestData.latest.timestamp).toLocaleString() }}
          ({{ latestData.latest.products.length }} products)
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">#</th>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Product</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price (RM)</th>
              <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Discount</th>
              <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Rating</th>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, i) in latestData.latest.products" :key="i" style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">{{ i + 1 }}</td>
              <td style="padding: 8px; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ product.name }}</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">{{ product.price.toFixed(2) }}</td>
              <td style="padding: 8px; text-align: center; color: #ee4d2d;">{{ product.discount }}</td>
              <td style="padding: 8px; text-align: center;">{{ product.rating }}</td>
              <td style="padding: 8px;">{{ product.location }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Scrape History</h2>
      <p v-if="!historyData?.scrapes?.length" style="color: #666;">
        No history yet.
      </p>
      <table v-else style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Timestamp</th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Products Found</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in [...historyData.scrapes].reverse()" :key="entry.timestamp" style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">{{ new Date(entry.timestamp).toLocaleString() }}</td>
            <td style="padding: 8px; text-align: right;">{{ entry.products.length }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
