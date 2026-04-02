import { readData } from '../utils/storage'

export default defineEventHandler(() => {
  const data = readData()
  if (data.scrapes.length === 0) {
    return { latest: null }
  }
  return { latest: data.scrapes[data.scrapes.length - 1] }
})
