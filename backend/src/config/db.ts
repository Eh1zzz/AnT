import mysql from 'mysql2/promise';
import { env } from './env';
import { logger } from '../utils/logger';

export const pool = mysql.createPool({
  host:               env.db.host,
  port:               env.db.port,
  user:               env.db.user,
  password:           env.db.password,
  database:           env.db.name,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

export async function testConnection(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info('MySQL connection pool established');
  } catch (err) {
    logger.error('MySQL connection failed:', err);
    throw err;
  }
}

/** Helper: execute a query and return typed rows */
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/** Helper: execute and return single row or null */
export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Helper: execute INSERT/UPDATE/DELETE and return result metadata */
export async function execute(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
