import { readData } from '../utils/storage'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit as string, 10) : undefined
  const data = readData()

  if (limit && limit > 0) {
    return { scrapes: data.scrapes.slice(-limit) }
  }
  return { scrapes: data.scrapes }
})
