import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import * as relations from './relations';

export const db = drizzle(sql, { schema: { ...schema, ...relations } });