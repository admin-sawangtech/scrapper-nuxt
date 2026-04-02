export interface Product {
  name: string
  price: number
  discount: string
  rating: number
  location: string
}

export interface ScrapeEntry {
  timestamp: string
  products: Product[]
}

export interface ScrapeData {
  scrapes: ScrapeEntry[]
}
