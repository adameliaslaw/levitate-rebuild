
import { neon } from '@neondatabase/serverless'
export const getNeonClient = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  return neon(url)
}
