import { describe, it, expect, vi } from 'vitest'
import { parseProducts } from '../../server/utils/scraper'
import type { Product } from '../../server/utils/types'

describe('scraper', () => {
  describe('parseProducts', () => {
    it('parses product data from raw evaluation result', () => {
      const rawData = [
        {
          name: 'SPRISE Premium Wireless Bluetooth Headset',
          price: '20.00',
          discount: '-71%',
          rating: '5.0',
          location: 'Negeri Sembilan',
        },
        {
          name: 'Sony WH-CH520 Wireless Headphones',
          price: '189.00',
          discount: '-30%',
          rating: '4.8',
          location: 'Kuala Lumpur',
        },
      ]

      const products = parseProducts(rawData)

      expect(products).toHaveLength(2)
      expect(products[0]).toEqual({
        name: 'SPRISE Premium Wireless Bluetooth Headset',
        price: 20.00,
        discount: '-71%',
        rating: 5.0,
        location: 'Negeri Sembilan',
      })
      expect(products[1].price).toBe(189.00)
    })

    it('handles missing or invalid price gracefully', () => {
      const rawData = [
        { name: 'Bad Product', price: '', discount: '', rating: '', location: '' },
        { name: 'No Price', price: null, discount: '-10%', rating: '3.0', location: 'KL' },
      ]

      const products = parseProducts(rawData)

      expect(products).toHaveLength(2)
      expect(products[0].price).toBe(0)
      expect(products[1].price).toBe(0)
    })

    it('returns empty array for empty input', () => {
      const products = parseProducts([])
      expect(products).toEqual([])
    })
  })
})
