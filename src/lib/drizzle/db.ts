import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

// Transaction Pooler — port 6543, required for serverless/edge
// DO NOT use session pooler (port 5432) with Drizzle in serverless environments
const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, {
  prepare: false, // Required for Supabase Transaction Pooler
  max: 1,         // Serverless: single connection per invocation
})

export const db = drizzle(client, { schema })

export type DB = typeof db
